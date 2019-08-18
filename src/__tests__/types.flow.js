// @flow
/* eslint-disable no-unused-vars, react/display-name */
import React from 'react';
import {
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
type State = {| count: number |};
type Actions = typeof actions;
type SelectorProps = {| min: number |};

let Test;
let TypeStore;
let TypeContainer;
let TypeSubscriber;
let typeHook;
let TypeSelector;

const actionsDeprecated = {
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
    return '';
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

    return count;
  },

  fetch: (): Action<State> => async (): Promise<string> => {
    return '';
  },

  // Actions tests
  setTitle: (title: string): Action<State, void, typeof actions> => ({
    actions: acs,
  }) => {
    // TODO: action should be correctly typed (not supported for no arg fn)
    const v0 = acs.decrement(1);
    // $ExpectError action should be correctly typed
    acs.increment();
    // $ExpectError action should be correctly typed
    acs.increment('1');
    // $ExpectError action should be correctly typed
    acs.decrement().then();
    // $ExpectError result should be correctly typed
    v0.split('');

    // Correct
    acs.decrement();
    acs.increment(1);
    acs.fetch().then(v => v + 1);
    acs.fetch().then(v => v.split(''));
    v0 + 1;
    return title;
  },
};

const actions = {
  // setState tests
  increment: (n: number) => ({ setState }: StoreActionApi<State>) => {
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
    return '';
  },

  // GetState tests
  decrement: () => ({ setState, getState }: StoreActionApi<State>) => {
    const state = getState();
    // $ExpectError State should be of type State
    const bla = state.bla;
    // $ExpectError State should not be considered writable
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
    // $ExpectError action should be correctly typed
    dispatch(actions.increment());
    // $ExpectError action should be correctly typed
    dispatch(actions.increment('1'));
    // $ExpectError action should be correctly typed
    dispatch(actions.decrement()).then();
    // $ExpectError result should be correctly typed
    v0.split('');

    // Correct
    dispatch(actions.increment(1));
    dispatch(actions.fetch()).then(v => v.split(''));
    v0 + 1;
    return title;
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
 * createSubscriber types tests
 */

TypeSubscriber = createSubscriber<State, Actions>(TypeStore);

Test = (
  // $ExpectError Child arg shape should be state + actions
  <TypeSubscriber>{({ foo }) => foo}</TypeSubscriber>
);

Test = (
  // $ExpectError Actions should be correcly typed
  <TypeSubscriber>{(__, { increment }) => increment()}</TypeSubscriber>
);

// Correct
Test = <TypeSubscriber>{({ count }) => count + 0}</TypeSubscriber>;
Test = <TypeSubscriber>{(__, { increment }) => increment(1)}</TypeSubscriber>;

/**
 * createSubscriber with selector types tests
 */
TypeSelector = createSubscriber<State, Actions, _, void>(TypeStore, {
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

TypeSelector = createSubscriber<State, Actions, void, void>(TypeStore, {
  selector: null,
});

Test = (
  // $ExpectError Child arg shape should be just actions
  <TypeSelector>{({ count }) => count}</TypeSelector>
);

// $ExpectError Should not accept props
Test = <TypeSelector myProp>{state => !state}</TypeSelector>;

// Correct
Test = <TypeSelector>{(state, { increment }) => increment(1)}</TypeSelector>;

TypeSelector = createSubscriber<State, Actions, _, SelectorProps>(TypeStore, {
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
 * createHook types tests
 */

typeHook = createHook<State, Actions>(TypeStore);

Test = typeHook();

// $ExpectError Array index 0 should be state
Test[0].foo;

// $ExpectError Array index 1 should be actions
Test[1].increment();

// $ExpectError Array index 1 should be actions
Test[1].increment('1');

// TODO
Test[1].decrement().then(v => v);

// Correct
Test[0].count + 0;
Test[1].increment(1);
Test[1].decrement();
Test[1].fetch().then(v => v);

/**
 * createHook with selector types tests
 */
typeHook = createHook<State, Actions, _, void>(TypeStore, {
  selector: state => ({ baz: 1 }),
});

Test = typeHook();

// $ExpectError Array index 0 shape should be selector output
Test[0].count;

// $ExpectError Should not accept props
Test = typeHook({ min: 3 });

// Correct
Test[0].baz;
Test[1].increment(1);

typeHook = createHook<State, Actions, void, void>(TypeStore, {
  selector: null,
});

Test = typeHook();

// $ExpectError Array 0 shape should be undefined
Test[0].count;

// Correct
Test[1].increment(1);

typeHook = createHook<State, Actions, _, SelectorProps>(TypeStore, {
  selector: (state, props: SelectorProps) => ({ baz: 1, min: props.min }),
});

// TODO: Should require props
Test = typeHook();

// $ExpectError Should require correct prop types
Test = typeHook({ min: '2' });

Test = typeHook({ min: 2 });
// $ExpectError Should have correct selector types
Test[0].min.split('');

// Correct
Test[0].min + Test[0].baz;

/**
 * Container types tests
 */
TypeContainer = createContainer<State, Actions, {||}>(TypeStore);

Test = (
  // $ExpectError Container is not a render-prop
  <TypeContainer>{({ count }) => count}</TypeContainer>
);

Test = (
  // $ExpectError Does not accept extra props
  <TypeContainer foo="1">bla</TypeContainer>
);

// Correct
Test = <TypeContainer>bla</TypeContainer>;
Test = <TypeContainer scope="a">bla</TypeContainer>;
Test = <TypeContainer isGlobal>bla</TypeContainer>;

const TypePropsContainer = createContainer<State, Actions, {| url: string |}>(
  TypeStore
);

// $ExpectError Requires typed props
Test = <TypePropsContainer isGlobal>bla</TypePropsContainer>;

Test = (
  // $ExpectError Only allows typed extra props
  <TypePropsContainer foo="1">bla</TypePropsContainer>
);

Test = (
  <TypePropsContainer scope="a" url="">
    bla
  </TypePropsContainer>
);
