import React from 'react';

import {
  createStore,
  createContainer,
  createSubscriber,
  createHook,
  StoreActionApi,
} from 'react-sweet-state';

/**
 * Store types tests
 */
type State = { count: number };
type Actions = typeof actions;
type SelectorProps = { min: number };

let Test;

const actions = {
  // setState tests
  increment: (n: number) => ({ setState }: StoreActionApi<State>) => {
    // $ExpectError
    setState('');

    // $ExpectError
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
    // $ExpectError
    const bla = state.bla;
    // $ExpectError
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
    // $ExpectError
    dispatch(actions.decrement()).then();
    // $ExpectError
    v0.split('');

    // Correct
    dispatch(actions.decrement());
    dispatch(actions.fetch()).then(v => v + 1);
    dispatch(actions.fetch()).then(v => v.split(''));
    v0 + 1;
    return title;
  },
};

// $ExpectError
const TypeStore0 = createStore<State, Actions>({ count: 0 });

const TypeStore1 = createStore<State, Actions>({
  // $ExpectError
  initialState: { bla: 0 },
  actions,
});

// $ExpectError
const TypeStore2 = createStore<State, Actions>({ initialState: { count: 0 } });

// $ExpectError
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
  // $ExpectError
  <TypeSubscriber>{({ foo }) => foo}</TypeSubscriber>
);

Test = (
  // $ExpectError
  <TypeSubscriber>{(__, { increment }) => increment()}</TypeSubscriber>
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
    selector: state => ({ baz: 1 }),
  }
);

Test = (
  // $ExpectError
  <TypeSelector>{({ count }) => count}</TypeSelector>
);

Test = (
  // $ExpectError
  <TypeSelector min={3}>{({ baz }) => baz}</TypeSelector>
);

// Correct
Test = <TypeSelector>{({ baz }) => baz}</TypeSelector>;
Test = <TypeSelector>{(__, { increment }) => increment(1)}</TypeSelector>;

const TypeSelectorNull = createSubscriber<State, Actions, void>(TypeStore, {
  selector: null,
});

Test = (
  // $ExpectError
  <TypeSelectorNull>{({ count }) => count}</TypeSelectorNull>
);

Test = (
  // $ExpectError
  <TypeSelectorNull myProp>{state => state === undefined}</TypeSelectorNull>
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
  // $ExpectError
  <TypeSelectorProp>{({ baz }) => baz}</TypeSelectorProp>
);

Test = (
  // $ExpectError
  <TypeSelectorProp min="2">{({ baz }) => baz}</TypeSelectorProp>
);

Test = (
  // $ExpectError
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

// $ExpectError
typeBaseHook({});

// $ExpectError
baseReturn[0].foo;

// $ExpectError
baseReturn[1].increment();

// $ExpectError
baseReturn[1].increment('1');

// $ExpectError
baseReturn[1].decrement().then(v => v);

// Correct
baseReturn[0].count + 0;
baseReturn[1].increment(1);
baseReturn[1].decrement();
baseReturn[1].fetch().then(v => v);

/**
 * createHook with selector types tests
 */
const typeSelectorHook = createHook<State, Actions, { baz: number }>(
  TypeStore,
  { selector: state => ({ baz: 1 }) }
);

const selectorReturn = typeSelectorHook();

// $ExpectError
selectorReturn[0].count;

// $ExpectError
typeSelectorHook({ min: 3 });

// Correct
selectorReturn[0].baz;
selectorReturn[1].increment(1);

const typeNullHook = createHook<State, Actions, void>(TypeStore, {
  selector: null,
});

const nullReturn = typeNullHook();

// $ExpectError
nullReturn[0].count;

// Correct
nullReturn[1].increment(1);

const typeArgHook = createHook<State, Actions, SelectorState, SelectorProps>(
  TypeStore,
  { selector: (state, props) => ({ baz: 1, min: props.min }) }
);

// $ExpectError
typeArgHook();

// $ExpectError
typeArgHook({ min: '2' });

const argReturn = typeArgHook({ min: 2 });
// $ExpectError
argReturn[0].min.split('');

// Correct
argReturn[0].min + argReturn[0].baz;

/**
 * Container types tests
 */

const TypeContainer = createContainer<State, Actions>(TypeStore);

Test = (
  // $ExpectError
  <TypeContainer>{({ count }) => count}</TypeContainer>
);

Test = (
  // $ExpectError
  <TypeContainer foo="1">bla</TypeContainer>
);

// Correct
Test = <TypeContainer>bla</TypeContainer>;
Test = <TypeContainer scope="a">bla</TypeContainer>;
Test = <TypeContainer isGlobal>bla</TypeContainer>;

const TypePropsContainer = createContainer<State, Actions, { url: string }>(
  TypeStore
);

// $ExpectError
Test = <TypePropsContainer isGlobal>bla</TypePropsContainer>;

Test = (
  // $ExpectError
  <TypePropsContainer foo="1">bla</TypePropsContainer>
);

// Correct
Test = (
  <TypePropsContainer scope="a" url="">
    bla
  </TypePropsContainer>
);
