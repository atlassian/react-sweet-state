// @flow
/* eslint-disable no-unused-vars, react/display-name */
import React from 'react';
import {
  createStore,
  createContainer,
  createSubscriber,
  type Action,
} from '..';

/**
 * Store types tests
 */
type State = {| count: number |};
type Actions = typeof actions;

let Test;
let TypeStore;
let TypeContainer;
let TypeSubscriber;
let TypeSelector;

const actions = {
  // setState tests
  increment: (n: number): Action<State> => ({ setState }) => {
    // $ExpectError setState should be of type State
    setState('');

    // $ExpectError Partial state should be of type State
    setState({
      foo: 1,
    });

    // correct
    setState({
      count: 2,
    });
  },

  // GetState tests
  decrement: (): Action<State> => ({ setState, getState }) => {
    const state = getState();
    // $ExpectError State should be of type State
    const bla = state.bla;
    // $ExpectError State should not be considered writable
    state.count = 1;

    // correct
    const { count } = state;
  },
};

// $ExpectError Store should be created with a valid argument
TypeStore = createStore<State, Actions>({ count: 0 });

// $ExpectError Store should have initialState of type state
TypeStore = createStore<State, Actions>({ initialState: { bla: 0 }, actions });

// $ExpectError Store should have actions
TypeStore = createStore<State, Actions>({ initialState: { count: 0 } });

// Correct
TypeStore = createStore<State, Actions>({
  initialState: { count: 0 },
  actions,
  name: 'Type',
});

/**
 * createComponents types tests
 */
TypeContainer = createContainer<*, *, {| url?: string |}>(TypeStore);

TypeSubscriber = createSubscriber<*, *>(TypeStore);

Test = (
  // $ExpectError Child arg shape should be state + actions
  <TypeSubscriber>{({ foo }) => foo}</TypeSubscriber>
);

Test = (
  // $ExpectError Actions should be correcly typed
  <TypeSubscriber>{(__, { increment }) => increment()}</TypeSubscriber>
);

Test = (
  // $ExpectError State should be read only
  <TypeSubscriber>{state => (state.count = 1)}</TypeSubscriber>
);

// Correct
Test = <TypeSubscriber>{({ count }) => count + 0}</TypeSubscriber>;
Test = <TypeSubscriber>{(__, { increment }) => increment(1)}</TypeSubscriber>;

/**
 * createSubscriber with selector types tests
 */
TypeSelector = createSubscriber<*, *, _, void>(TypeStore, {
  selector: state => ({ baz: 1 }),
});

Test = (
  // $ExpectError Child arg shape should be pick + actions
  <TypeSelector>{({ count }) => count}</TypeSelector>
);

Test = (
  // $ExpectError Should not accept props
  <TypeSelector min={3}>{({ baz }) => baz}</TypeSelector>
);

// Correct
Test = <TypeSelector>{({ baz }) => baz}</TypeSelector>;
Test = <TypeSelector>{(__, { increment }) => increment(1)}</TypeSelector>;

TypeSelector = createSubscriber<*, *, {||}, {||}>(TypeStore, {
  selector: null,
});

Test = (
  // $ExpectError Child arg shape should be just actions
  <TypeSelector>{({ count }) => count}</TypeSelector>
);

// Correct
Test = <TypeSelector>{([, { increment }]) => increment(1)}</TypeSelector>;

type SelectorProps = {| min: number |};

TypeSelector = createSubscriber<*, *, _, SelectorProps>(TypeStore, {
  selector: (state, props: SelectorProps) => ({ baz: 1, min: props.min }),
});

Test = (
  // $ExpectError Should require props
  <TypeSelector>{({ baz }) => baz}</TypeSelector>
);

Test = (
  // $ExpectError Should require correct prop types
  <TypeSelector min="2">{({ baz }) => baz}</TypeSelector>
);

Test = (
  // $ExpectError Should have correct selector types
  <TypeSelector min={2}>{({ min }) => min.split('')}</TypeSelector>
);

// Correct
Test = <TypeSelector min={2}>{({ baz, min }) => baz + min}</TypeSelector>;

/**
 * Container types tests
 */
Test = (
  // $ExpectError Container is not a render-prop
  <TypeContainer>{({ count }) => count}</TypeContainer>
);

Test = (
  // $ExpectError Only allows typed extra props
  <TypeContainer foo="1">bla</TypeContainer>
);

// Correct
Test = <TypeContainer>bla</TypeContainer>;
Test = <TypeContainer scope="a">bla</TypeContainer>;
Test = <TypeContainer isGlobal>bla</TypeContainer>;
Test = (
  <TypeContainer scope="a" url="">
    bla
  </TypeContainer>
);
