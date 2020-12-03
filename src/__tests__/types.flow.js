// @flow
/* eslint-disable no-unused-vars, react/display-name */
import React from 'react';
import {
  batch,
  createStore,
  createContainer,
  createSubscriber,
  createHook,
  type Action,
  type StoreActionApi,
} from '..';

/**
 * Store types tests
 */
type State = {|
  count: number,
|};
type Actions = typeof actions;
type SelectorProps = {|
  min: number,
|};

let Test;
let TypeStore;
let TypeContainer;
let TypeSubscriber;
let typeHook;
let TypeSelector;

const actionsGeneric = {
  // setState tests
  increment: (n: number): Action<State, {}, string> => ({ setState }) => {
    // $FlowExpectedError[incompatible-shape] setState should be of type State
    setState('');

    // $FlowExpectedError[prop-missing] Partial state should be of type State
    setState({
      foo: 1,
    });

    // correct
    setState({
      count: 2,
    });
    return '';
  },

  // GetState tests
  decrement: (): Action<State, {}, number> => ({ setState, getState }) => {
    const state = getState();
    // $FlowExpectedError[prop-missing] State should be of type State
    const bla = state.bla;
    // $FlowExpectedError[cannot-write] State should not be considered writable
    state.count = 1;

    // correct
    const { count } = state;

    return count;
  },

  fetch: (): Action<State, {}, Promise<string>> => async () => {
    return '';
  },

  // Actions tests
  setTitle: (title: string): Action<State> => ({ dispatch }) => {
    const v0 = dispatch(actions.decrement());
    // $FlowExpectedError[incompatible-call] action should be correctly typed
    dispatch(actions.increment());
    // $FlowExpectedError[incompatible-call] action should be correctly typed
    dispatch(actions.increment('1'));
    // $FlowExpectedError[extra-arg] Increment should only accept one argument
    dispatch(actions.increment(1, 'foo'));
    // $FlowExpectedError[prop-missing] action should be correctly typed
    dispatch(actions.decrement()).then();
    // $FlowExpectedError[prop-missing] result should be correctly typed
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
    // $FlowExpectedError[incompatible-shape] setState should be of type State
    setState('');

    // $FlowExpectedError[prop-missing] Partial state should be of type State
    setState({
      foo: 1,
    });

    // correct
    setState({
      count: 2,
    });
    return '';
  },

  // GetState tests
  decrement: () => ({ setState, getState }: StoreActionApi<State>) => {
    const state = getState();
    // $FlowExpectedError[prop-missing] State should be of type State
    const bla = state.bla;
    // $FlowExpectedError[cannot-write] State should not be considered writable
    state.count = 1;

    // correct
    const { count } = state;

    return count;
  },

  fetch: () => async (): Promise<string> => {
    return '';
  },

  // Actions tests
  setTitle: (title: string) => ({ dispatch }: StoreActionApi<State>) => {
    const v0 = dispatch(actions.decrement());
    // $FlowExpectedError[incompatible-call] action should be correctly typed
    dispatch(actions.increment());
    // $FlowExpectedError[incompatible-call] action should be correctly typed
    dispatch(actions.increment('1'));
    // $FlowExpectedError[extra-arg] Increment should only accept one argument
    dispatch(actions.increment(1, 'foo'));
    // $FlowExpectedError[prop-missing] action should be correctly typed
    dispatch(actions.decrement()).then();
    // $FlowExpectedError[prop-missing] result should be correctly typed
    v0.split('');

    // Correct
    batch(() => dispatch(actions.decrement()));
    dispatch(actions.increment(1));
    dispatch(actions.fetch()).then((v) => v.split(''));
    v0 + 1;
  },
};

// $FlowExpectedError[prop-missing] Store should be created with a valid argument
TypeStore = createStore<State, Actions>({ count: 0 });

// $FlowExpectedError[prop-missing] Store should have initialState of type state
TypeStore = createStore<State, Actions>({ initialState: { bla: 0 }, actions });

// $FlowExpectedError[prop-missing] Store should have actions
TypeStore = createStore<State, Actions>({ initialState: { count: 0 } });

// $FlowExpectedError[incompatible-call] Store type should be object
TypeStore = createStore<string, Actions>({ initialState: '', actions });

// Correct
TypeStore = createStore<State, Actions>({
  initialState: { count: 0 },
  actions,
  name: 'Type',
});

/**
 * createSubscriber types tests
 */

TypeSubscriber = createSubscriber<State, Actions>(TypeStore);

Test = (
  // $FlowExpectedError[prop-missing] Child arg shape should be state + actions
  <TypeSubscriber>{({ foo }) => foo}</TypeSubscriber>
);

Test = (
  // $FlowExpectedError[incompatible-call] Actions should be correctly typed
  <TypeSubscriber>{(__, { increment }) => increment()}</TypeSubscriber>
);

Test = (
  // $FlowExpectedError[incompatible-call] string is incompatible with number
  <TypeSubscriber>{(__, { increment }) => increment('1')}</TypeSubscriber>
);

Test = (
  // TODO Increment should only accept one argument
  <TypeSubscriber>{(__, { increment }) => increment(1, 'foo')}</TypeSubscriber>
);

// Correct
Test = <TypeSubscriber>{({ count }) => count + 0}</TypeSubscriber>;
Test = <TypeSubscriber>{(__, { increment }) => increment(1)}</TypeSubscriber>;

/**
 * createSubscriber with selector types tests
 */
TypeSelector = createSubscriber<State, Actions, _, void>(TypeStore, {
  selector: (state) => ({ baz: 1 }),
});

Test = (
  // $FlowExpectedError[prop-missing] Child arg shape should be pick + actions
  <TypeSelector>{({ count }) => count}</TypeSelector>
);

Test = (
  // $FlowExpectedError[prop-missing] Should not accept props
  <TypeSelector min={3}>{({ baz }) => baz}</TypeSelector>
);

// Correct
Test = <TypeSelector>{({ baz }) => baz}</TypeSelector>;
Test = <TypeSelector>{(__, { increment }) => increment(1)}</TypeSelector>;

TypeSelector = createSubscriber<State, Actions, void, void>(TypeStore, {
  selector: null,
});

Test = (
  // $FlowExpectedError[incompatible-use] Child arg shape should be just actions
  <TypeSelector>{({ count }) => count}</TypeSelector>
);

// $FlowExpectedError[prop-missing] Should not accept props
Test = <TypeSelector myProp>{(state) => !state}</TypeSelector>;

// Correct
Test = <TypeSelector>{(state, { increment }) => increment(1)}</TypeSelector>;

TypeSelector = createSubscriber<State, Actions, _, SelectorProps>(TypeStore, {
  selector: (state, props: SelectorProps) => ({ baz: 1, min: props.min }),
});

Test = (
  // $FlowExpectedError[prop-missing] Should require props
  <TypeSelector>{({ baz }) => baz}</TypeSelector>
);

Test = (
  // $FlowExpectedError[incompatible-type] Should require correct prop types
  <TypeSelector min="2">{({ baz }) => baz}</TypeSelector>
);

Test = (
  // $FlowExpectedError[prop-missing] Should have correct selector types
  <TypeSelector min={2}>{({ min }) => min.split('')}</TypeSelector>
);

// Correct
Test = <TypeSelector min={2}>{({ baz, min }) => baz + min}</TypeSelector>;

/**
 * createHook types tests
 */

typeHook = createHook<State, Actions>(TypeStore);

Test = typeHook();

// $FlowExpectedError[prop-missing] Array index 0 should be state
Test[0].foo;

// $FlowExpectedError[incompatible-call] Array index 1 should be actions
Test[1].increment();

// $FlowExpectedError[incompatible-call] Array index 1 should be actions
Test[1].increment('1');

// $FlowExpectedError[prop-missing] Action return type is number
Test[1].decrement().then((v) => v);

// TODO Increment should only accept one argument
Test[1].increment(1, 'foo');

// Correct
Test[0].count + 0;
Test[1].increment(1);
Test[1].decrement();
Test[1].fetch().then((v) => v);

/**
 * createHook with selector types tests
 */
typeHook = createHook<State, Actions, _, void>(TypeStore, {
  selector: (state) => ({ baz: 1 }),
});

Test = typeHook();

// $FlowExpectedError[prop-missing] Array index 0 shape should be selector output
Test[0].count;

// $FlowExpectedError[incompatible-call] Should not accept props
Test = typeHook({ min: 3 });

// Correct
Test[0].baz;
Test[1].increment(1);

typeHook = createHook<State, Actions, void, void>(TypeStore, {
  selector: null,
});

Test = typeHook();

// $FlowExpectedError[incompatible-use] Array 0 shape should be undefined
Test[0].count;

// Correct
Test[1].increment(1);

typeHook = createHook<State, Actions, _, SelectorProps>(TypeStore, {
  selector: (state, props: SelectorProps) => ({ baz: 1, min: props.min }),
});

// TODO: Should require props
Test = typeHook();

// $FlowExpectedError[incompatible-call] Should require correct prop types
Test = typeHook({ min: '2' });

Test = typeHook({ min: 2 });
// $FlowExpectedError[prop-missing] Should have correct selector types
Test[0].min.split('');

// Correct
Test[0].min + Test[0].baz;

/**
 * Container types tests
 */
TypeContainer = createContainer<State, Actions, {||}>(TypeStore);

Test = (
  // $FlowExpectedError[incompatible-type] Container is not a render-prop
  <TypeContainer>{({ count }) => count}</TypeContainer>
);

Test = (
  // $FlowExpectedError[prop-missing] Does not accept extra props
  <TypeContainer foo="1">bla</TypeContainer>
);

// Correct
Test = <TypeContainer>bla</TypeContainer>;
Test = <TypeContainer scope="a">bla</TypeContainer>;
Test = <TypeContainer isGlobal>bla</TypeContainer>;

type ContainerProps = {|
  url: string,
|};
const TypePropsContainer = createContainer<State, Actions, ContainerProps>(
  TypeStore
);

// $FlowExpectedError[prop-missing] Requires typed props
Test = <TypePropsContainer isGlobal>bla</TypePropsContainer>;

Test = (
  // $FlowExpectedError[prop-missing] Only allows typed extra props
  <TypePropsContainer foo="1">bla</TypePropsContainer>
);

Test = (
  <TypePropsContainer scope="a" url="">
    bla
  </TypePropsContainer>
);
