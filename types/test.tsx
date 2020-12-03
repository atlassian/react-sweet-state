/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';

import {
  batch,
  createStore,
  createContainer,
  createSubscriber,
  createHook,
  StoreActionApi,
  Action,
} from 'react-sweet-state';

/**
 * Store types tests
 */
type State = { count: number };
type Actions = typeof actions;
type SelectorProps = { min: number };

let Test;

const actionsGeneric = {
  // setState tests
  increment: (n: number): Action<State, void, string> => ({ setState }) => {
    // @ts-expect-error
    setState('');

    // @ts-expect-error
    setState({ foo: 1 });

    // Correct
    setState({
      count: 2,
    });

    return '';
  },

  // GetState tests
  decrement: (): Action<State, {}, number> => ({ setState, getState }) => {
    const state = getState();
    // @ts-expect-error
    const bla = state.bla;
    // @ts-expect-error
    state.count = 1;

    // correct
    const { count } = state;

    return count;
  },

  fetch: (): Action<State, {}, Promise<string>> => async () => {
    return '';
  },

  // Dispatch tests
  setTitle: (title: string): Action<State> => ({ dispatch }) => {
    const v0 = dispatch(actions.decrement());
    // @ts-expect-error
    dispatch(actions.increment());
    // @ts-expect-error
    dispatch(actions.increment('1'));
    // @ts-expect-error
    dispatch(actions.increment(1, 'foo'));
    // @ts-expect-error
    dispatch(actions.decrement()).then();
    // @ts-expect-error
    v0.split('');

    // Correct
    batch(() => dispatch(actions.decrement()));
    dispatch(actions.increment(1));
    dispatch(actions.fetch()).then((v) => v.split(''));
    v0 + 1;
  },
};

const actions = {
  // setState tests
  increment: (n: number) => ({ setState }: StoreActionApi<State>) => {
    // @ts-expect-error
    setState('');

    // @ts-expect-error
    setState({ foo: 1 });

    // Correct
    setState({
      count: 2,
    });

    return '';
  },

  // GetState tests
  decrement: () => ({ setState, getState }: StoreActionApi<State>) => {
    const state = getState();
    // @ts-expect-error
    const bla = state.bla;
    // @ts-expect-error
    state.count = 1;

    // correct
    const { count } = state;

    return count;
  },

  fetch: () => async (): Promise<string> => {
    return '';
  },

  // Dispatch tests
  setTitle: (title: string) => ({ dispatch }: StoreActionApi<State>) => {
    const v0 = dispatch(actions.decrement());
    // @ts-expect-error
    dispatch(actions.increment());
    // @ts-expect-error
    dispatch(actions.increment('1'));
    // @ts-expect-error
    dispatch(actions.increment(1, 'foo'));
    // @ts-expect-error
    dispatch(actions.decrement()).then();
    // @ts-expect-error
    v0.split('');

    // Correct
    batch(() => dispatch(actions.decrement()));
    dispatch(actions.increment(1));
    dispatch(actions.fetch()).then((v) => v.split(''));
    v0 + 1;
  },
};

// @ts-expect-error
const TypeStore0 = createStore<State, Actions>({ count: 0 });

const TypeStore1 = createStore<State, Actions>({
  // @ts-expect-error
  initialState: { bla: 0 },
  actions,
});

// @ts-expect-error
const TypeStore2 = createStore<State, Actions>({ initialState: { count: 0 } });

// @ts-expect-error
const TypeStore3 = createStore<string, Actions>({ initialState: '', actions });

// Correct
const TypeStore = createStore<State, Actions>({
  initialState: { count: 0 },
  actions,
  name: 'Type',
});

/**
 * createSubscriber types tests
 */

const TypeSubscriber = createSubscriber(TypeStore);

Test = (
  // @ts-expect-error
  <TypeSubscriber>{({ foo }) => foo}</TypeSubscriber>
);

Test = (
  // @ts-expect-error
  <TypeSubscriber>{(__, { increment }) => increment()}</TypeSubscriber>
);

Test = (
  // @ts-expect-error
  <TypeSubscriber>{(__, { increment }) => increment('1')}</TypeSubscriber>
);

Test = (
  // @ts-expect-error
  <TypeSubscriber>{(__, { increment }) => increment(1, 'foo')}</TypeSubscriber>
);

// Correct
Test = <TypeSubscriber>{({ count }) => count + 0}</TypeSubscriber>;
Test = <TypeSubscriber>{(__, { increment }) => increment(1)}</TypeSubscriber>;

/**
 * createSubscriber with selector types tests
 */
const TypeSelector = createSubscriber<State, Actions, { baz: number }>(
  TypeStore,
  {
    selector: (state) => ({ baz: 1 }),
  }
);

Test = (
  // @ts-expect-error
  <TypeSelector>{({ count }) => count}</TypeSelector>
);

Test = (
  // @ts-expect-error
  <TypeSelector min={3}>{({ baz }) => baz}</TypeSelector>
);

// Correct
Test = <TypeSelector>{({ baz }) => baz}</TypeSelector>;
Test = <TypeSelector>{(__, { increment }) => increment(1)}</TypeSelector>;

const TypeSelectorNull = createSubscriber<State, Actions, void>(TypeStore, {
  selector: null,
});

Test = (
  // @ts-expect-error
  <TypeSelectorNull>{({ count }) => count}</TypeSelectorNull>
);

Test = (
  // @ts-expect-error
  <TypeSelectorNull myProp>{(state) => state === undefined}</TypeSelectorNull>
);

// Correct
Test = (
  <TypeSelectorNull>{(state, { increment }) => increment(1)}</TypeSelectorNull>
);

type SelectorState = { baz: number; min: number };

const TypeSelectorProp = createSubscriber<
  State,
  Actions,
  SelectorState,
  SelectorProps
>(TypeStore, {
  selector: (state, props) => ({ baz: 1, min: props.min }),
});

Test = (
  // @ts-expect-error
  <TypeSelectorProp>{({ baz }) => baz}</TypeSelectorProp>
);

Test = (
  // @ts-expect-error
  <TypeSelectorProp min="2">{({ baz }) => baz}</TypeSelectorProp>
);

Test = (
  // @ts-expect-error
  <TypeSelectorProp min={2}>{({ min }) => min.split('')}</TypeSelectorProp>
);

// Correct
Test = (
  <TypeSelectorProp min={2}>{({ baz, min }) => baz + min}</TypeSelectorProp>
);

/**
 * createHook types tests
 */

const typeBaseHook = createHook<State, Actions>(TypeStore);

const baseReturn = typeBaseHook();

// @ts-expect-error
typeBaseHook({});

// @ts-expect-error
baseReturn[0].foo;

// @ts-expect-error
baseReturn[1].increment();

// @ts-expect-error
baseReturn[1].increment('1');

// @ts-expect-error
baseReturn[1].increment(1, 'foo');

// @ts-expect-error
baseReturn[1].decrement().then((v) => v);

// Correct
baseReturn[0].count + 0;
baseReturn[1].increment(1);
baseReturn[1].decrement();
baseReturn[1].fetch().then((v) => v);

/**
 * createHook with selector types tests
 */
const typeSelectorHook = createHook<State, Actions, { baz: number }>(
  TypeStore,
  { selector: (state) => ({ baz: 1 }) }
);

const selectorReturn = typeSelectorHook();

// @ts-expect-error
selectorReturn[0].count;

// @ts-expect-error
typeSelectorHook({ min: 3 });

// Correct
selectorReturn[0].baz;
selectorReturn[1].increment(1);

const typeNullHook = createHook<State, Actions, void>(TypeStore, {
  selector: null,
});

const nullReturn = typeNullHook();

// @ts-expect-error
nullReturn[0].count;

// Correct
nullReturn[1].increment(1);

const typeArgHook = createHook<State, Actions, SelectorState, SelectorProps>(
  TypeStore,
  { selector: (state, props) => ({ baz: 1, min: props.min }) }
);

// @ts-expect-error
typeArgHook();

// @ts-expect-error
typeArgHook({ min: '2' });

const argReturn = typeArgHook({ min: 2 });
// @ts-expect-error
argReturn[0].min.split('');

// Correct
argReturn[0].min + argReturn[0].baz;

/**
 * Container types tests
 */

const TypeContainer = createContainer<State, Actions>(TypeStore);

Test = (
  // @ts-expect-error
  <TypeContainer>{({ count }) => count}</TypeContainer>
);

Test = (
  // @ts-expect-error
  <TypeContainer foo="1">bla</TypeContainer>
);

// Correct
Test = <TypeContainer>bla</TypeContainer>;
Test = <TypeContainer scope="a">bla</TypeContainer>;
Test = <TypeContainer isGlobal>bla</TypeContainer>;

const TypePropsContainer = createContainer<State, Actions, { url: string }>(
  TypeStore
);

// @ts-expect-error
Test = <TypePropsContainer isGlobal>bla</TypePropsContainer>;

Test = (
  // @ts-expect-error
  <TypePropsContainer foo="1">bla</TypePropsContainer>
);

// Correct
Test = (
  <TypePropsContainer scope="a" url="">
    bla
  </TypePropsContainer>
);
