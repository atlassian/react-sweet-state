import React from "react";

import {
  createStore,
  createContainer,
  createSubscriber,
  createHook,
  ActionArgs
} from "react-sweet-state";

/**
 * Store types tests
 */
type State = { count: number };
type Actions = typeof actions;
type SelectorProps = { min: number };

let Test;

const actions = {
  // setState tests
  increment: (n: number) => ({ setState }: ActionArgs<State, Actions>) => {
    // @ts-ignore setState should be of type State
    setState("");

    // @ts-ignore Partial state should be of type State
    setState({ foo: 1 });

    // correct
    setState({
      count: 2
    });

    return "";
  },

  // GetState tests
  decrement: () => ({ setState, getState }: ActionArgs<State, Actions>) => {
    const state = getState();
    // @ts-ignore State should be of type State
    const bla = state.bla;
    // @ts-ignore State should not be considered writable
    state.count = 1;

    // correct
    const { count } = state;

    return count;
  },

  fetch: () => async (): Promise<string> => {
    return "";
  },

  // Actions tests
  setTitle: (title: string) => ({
    actions: acs
  }:  ActionArgs<State, Actions>) => {
    // @ts-ignore action should be correctly typed (not supported for no arg fn)
    const v0 = acs.decrement(1);
    // @ts-ignore action should be correctly typed
    acs.increment();
    // @ts-ignore action should be correctly typed
    acs.increment("1");
    // @ts-ignore action should be correctly typed
    acs.decrement().then();
    // @ts-ignore result should be correctly typed
    v0.split("");

    // Correct
    acs.decrement();
    acs.increment(1);
    acs.fetch().then(v => v + 1);
    acs.fetch().then(v => v.split(""));
    v0 + 1;
    return title;
  }
};

// @ts-ignore Store should be created with a valid argument
const TypeStore0 = createStore<State, Actions>({ count: 0 });

const TypeStore1 = createStore<State, Actions>({
  // @ts-ignore Store should have initialState of type state
  initialState: { bla: 0 },
  actions
});

// @ts-ignore Store should have actions
const TypeStore2 = createStore<State, Actions>({ initialState: { count: 0 } });

// Correct
const TypeStore = createStore<State, Actions>({
  initialState: { count: 0 },
  actions,
  name: "Type"
});

/**
 * createSubscriber types tests
 */

const TypeSubscriber = createSubscriber<State, Actions>(TypeStore);

Test = (
  // @ts-ignore Child arg shape should be state + actions
  <TypeSubscriber>{({ foo }) => foo}</TypeSubscriber>
);

Test = (
  // @ts-ignore Actions should be correcly typed
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
    selector: state => ({ baz: 1 })
  }
);

Test = (
  // @ts-ignore Child arg shape should be pick + actions
  <TypeSelector>{({ count }) => count}</TypeSelector>
);

Test = (
  // @ts-ignore Should not accept props
  <TypeSelector min={3}>{({ baz }) => baz}</TypeSelector>
);

// Correct
Test = <TypeSelector>{({ baz }) => baz}</TypeSelector>;
Test = <TypeSelector>{(__, { increment }) => increment(1)}</TypeSelector>;

const TypeSelectorNull = createSubscriber<State, Actions, void>(TypeStore, {
  selector: null
});

Test = (
  // @ts-ignore Child arg shape should be just actions
  <TypeSelectorNull>{({ count }) => count}</TypeSelectorNull>
);

// @ts-ignore Should not accept props
Test = <TypeSelectorNull myProp>{state => !state}</TypeSelectorNull>;

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
  selector: (state, props) => ({ baz: 1, min: props.min })
});

Test = (
  // @ts-ignore Should require props
  <TypeSelectorProp>{({ baz }) => baz}</TypeSelectorProp>
);

Test = (
  // @ts-ignore Should require correct prop types
  <TypeSelectorProp min="2">{({ baz }) => baz}</TypeSelectorProp>
);

Test = (
  // @ts-ignore Should have correct selector types
  <TypeSelectorProp min={2}>{({ min }) => min.split("")}</TypeSelectorProp>
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

// @ts-ignore Should not accept arguments
typeBaseHook({});

// @ts-ignore Array index 0 should be state
baseReturn[0].foo;

// @ts-ignore Array index 1 should be actions
baseReturn[1].increment();

// @ts-ignore Array index 1 should be actions
baseReturn[1].increment("1");

// @ts-ignore Array index 1 return type should be correct
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

// @ts-ignore Array index 0 shape should be selector output
selectorReturn[0].count;

// @ts-ignore Should not accept props
typeSelectorHook({ min: 3 });

// Correct
selectorReturn[0].baz;
selectorReturn[1].increment(1);

const typeNullHook = createHook<State, Actions, void>(TypeStore, {
  selector: null
});

const nullReturn = typeNullHook();

// @ts-ignore Array 0 shape should be undefined
nullReturn[0].count;

// Correct
nullReturn[1].increment(1);

const typeArgHook = createHook<State, Actions, SelectorState, SelectorProps>(
  TypeStore,
  { selector: (state, props) => ({ baz: 1, min: props.min }) }
);

// @ts-ignore Should require argument
typeArgHook();

// @ts-ignore Should require correct prop types
typeArgHook({ min: "2" });

const argReturn = typeArgHook({ min: 2 });
// @ts-ignore Should have correct selector types
argReturn[0].min.split("");

// Correct
argReturn[0].min + argReturn[0].baz;

/**
 * Container types tests
 */

const TypeContainer = createContainer<State, Actions>(TypeStore);

Test = (
  // @ts-ignore Container is not a render-prop
  <TypeContainer>{({ count }) => count}</TypeContainer>
);

Test = (
  // @ts-ignore Does not accept extra props
  <TypeContainer foo="1">bla</TypeContainer>
);

// Correct
Test = <TypeContainer>bla</TypeContainer>;
Test = <TypeContainer scope="a">bla</TypeContainer>;
Test = <TypeContainer isGlobal>bla</TypeContainer>;

const TypePropsContainer = createContainer<State, Actions, { url: string }>(
  TypeStore
);

// @ts-ignore Requires typed props
Test = <TypePropsContainer isGlobal>bla</TypePropsContainer>;

Test = (
  // @ts-ignore Only allows typed extra props
  <TypePropsContainer foo="1">bla</TypePropsContainer>
);

// Correct
Test = (
  <TypePropsContainer scope="a" url="">
    bla
  </TypePropsContainer>
);


const inferedStore = createStore({
  initialState: {
    counter : 0
  },
  actions: {
    increment: (by: number = 1) => ({getState, setState}) =>{
      setState({
        counter : getState().counter + by
      })
    },
    composite : () => ({actions}) => {
      actions.increment(2);
    }
  }
});