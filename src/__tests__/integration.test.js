/* @jest-environment jsdom */
/* eslint-env jest */

import React, { Fragment, memo, useEffect } from 'react';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import { createStore, defaultRegistry } from '../store';
import { createContainer } from '../components/container';
import { createSubscriber } from '../components/subscriber';
import { createHook } from '../components/hook';

const actTick = () => act(async () => await Promise.resolve());

const actions = {
  add:
    (todo) =>
    ({ setState, getState }) =>
      setState({ todos: [...getState().todos, todo] }),
  load:
    (v = '') =>
    async ({ setState, getState }) => {
      if (getState().loading) return;
      setState({ loading: true });
      await Promise.resolve();
      setState({ todos: [`todo${v}`], loading: false });
    },
  setLoading:
    () =>
    ({ setState }) => {
      setState({ loading: true });
    },
};
const Store = createStore({
  name: 'store',
  initialState: { todos: [], loading: false },
  actions,
});

const expectActions = {
  add: expect.any(Function),
  load: expect.any(Function),
  setLoading: expect.any(Function),
};

describe('Integration', () => {
  beforeEach(() => {
    defaultRegistry.stores.clear();
  });

  it('should get closer storeState with scope id if matching', () => {
    const Container = createContainer(Store);
    const Subscriber = createSubscriber(Store);
    const children1 = jest.fn((s, a) => {
      s.todos.length || a.add('todo2');
      return null;
    });
    const children2 = jest.fn(() => null);
    const OtherStore = createStore({
      initialState: {},
      actions: {},
    });
    const OtherContainer = createContainer(OtherStore);
    render(
      <Container scope="s1">
        <Subscriber>{children1}</Subscriber>
        <Container scope="s2">
          <OtherContainer scope="s3">
            <OtherContainer>
              <Subscriber>{children2}</Subscriber>
            </OtherContainer>
          </OtherContainer>
        </Container>
      </Container>
    );

    expect(children1).toHaveBeenCalledTimes(2);
    expect(children1).toHaveBeenCalledWith(
      { todos: ['todo2'], loading: false },
      expect.any(Object)
    );

    expect(children2).toHaveBeenCalledTimes(1);
    expect(children2).toHaveBeenCalledWith(
      { todos: [], loading: false },
      expectActions
    );
  });

  it('should share scoped state across multiple subscribers', async () => {
    const Container = createContainer(Store, {
      onInit:
        () =>
        ({ dispatch }) =>
          dispatch(actions.load()),
    });
    const Subscriber = createSubscriber(Store);

    const children1 = jest.fn(() => null);
    const children2 = jest.fn(() => null);

    render(
      <Fragment>
        <Container scope="s1">
          <Subscriber>{children1}</Subscriber>
        </Container>
        <Container scope="s1">
          <Subscriber>{children2}</Subscriber>
        </Container>
      </Fragment>
    );

    await actTick();

    expect(children1.mock.calls[0]).toEqual([
      { loading: true, todos: [] },
      expectActions,
    ]);
    expect(children1.mock.calls[1]).toEqual([
      { loading: false, todos: ['todo'] },
      expectActions,
    ]);

    expect(children2.mock.calls[0]).toEqual([
      { loading: true, todos: [] },
      expectActions,
    ]);
    expect(children2.mock.calls[1]).toEqual([
      { loading: false, todos: ['todo'] },
      expectActions,
    ]);
  });

  it('should update all subscribers on scope change', async () => {
    const Container = createContainer(Store, {
      onInit:
        () =>
        ({ dispatch }, { v }) =>
          dispatch(actions.load(v)),
    });
    const useHook = createHook(Store);

    const children1 = jest.fn(() => null);
    const children2 = jest.fn(() => null);

    const Hook = () => {
      const [state, boundActions] = useHook();
      return children1(state, boundActions);
    };

    const IsolatedHook = memo(() => {
      const [state, boundActions] = useHook();
      return children2(state, boundActions);
    });

    const App = ({ scopeId }) => (
      <Container scope={scopeId} v={scopeId}>
        <Hook />
        <IsolatedHook />
      </Container>
    );

    const { rerender } = render(<App scopeId="A" />);
    await actTick();

    // 1. { loading: true, todos: [] };
    // 2. { loading: false, todos: ['todo1'] };
    expect(children1).toHaveBeenCalledTimes(2);
    expect(children2).toHaveBeenCalledTimes(2);

    rerender(<App scopeId="B" />);

    await actTick();

    const state2 = { loading: true, todos: [] };
    const call2 = 2;
    expect(children1.mock.calls[call2]).toEqual([state2, expectActions]);
    expect(children2.mock.calls[call2]).toEqual([state2, expectActions]);

    await actTick();

    const state3 = { loading: false, todos: ['todoB'] };
    const call3 = 3;
    expect(children1.mock.calls[call3]).toEqual([state3, expectActions]);
    expect(children2.mock.calls[call3]).toEqual([state3, expectActions]);
  });

  it('should call the listeners in the correct register order', async () => {
    const Container = createContainer(Store, {});
    const Subscriber = createSubscriber(Store);
    const useHook = createHook(Store);

    const calls = [];
    const childrensChild = jest.fn(() => {
      calls.push('childrensChild');
      return null;
    });
    const Children = jest.fn(() => {
      calls.push('Children');
      return <Subscriber>{childrensChild}</Subscriber>;
    });
    const parent = jest.fn(({ children }) => {
      calls.push('parent');
      return children;
    });
    const childrenHook = jest.fn(() => {
      calls.push('childrenHook');
      return null;
    });

    let acts;

    const Hook = () => {
      const [state, boundActions] = useHook();
      acts = boundActions;
      return childrenHook(state, boundActions);
    };

    const ParentComponent = ({ children }) => (
      <Subscriber>
        {(state, action) => parent({ state, action, children })}
      </Subscriber>
    );

    const App = () => (
      <Container scope="test">
        <ParentComponent>
          <Children />
          <Hook />
        </ParentComponent>
      </Container>
    );

    render(<App />);
    await actTick();

    expect(calls).toEqual([
      'parent',
      'Children',
      'childrensChild',
      'childrenHook',
    ]);
    calls.splice(0);

    act(() => acts.add('todo2'));

    expect(calls).toEqual(['parent', 'childrensChild', 'childrenHook']);
  });

  it('should call the listeners in the correct register order after scope change', async () => {
    const Container = createContainer(Store, {});
    const Subscriber = createSubscriber(Store);
    const useHook = createHook(Store);

    const calls = [];

    let acts;

    const SubWrapper = () => {
      return (
        <Subscriber>
          {(_, action) => {
            acts = action;
            calls.push('SubWrapper');
            return null;
          }}
        </Subscriber>
      );
    };

    const HookWrapper = ({ name, children = null }) => {
      const [, boundActions] = useHook({ name });
      acts = boundActions;
      calls.push(`HookWrapper[${name}]`);
      return children;
    };

    const App = ({ scopeId }) => (
      <>
        <HookWrapper name="outter" />
        <Container scope={scopeId} v={scopeId}>
          <HookWrapper name="inner">
            <SubWrapper />
            <HookWrapper name="in-inner" />
          </HookWrapper>
        </Container>
      </>
    );

    const { rerender } = render(<App scopeId="A" />);
    await actTick();

    expect(calls).toEqual([
      'HookWrapper[outter]',
      'HookWrapper[inner]',
      'SubWrapper',
      'HookWrapper[in-inner]',
    ]);

    calls.splice(0);

    rerender(<App scopeId="B" />);
    await actTick();

    expect(calls).toEqual([
      'HookWrapper[outter]',
      'HookWrapper[inner]',
      'SubWrapper',
      'HookWrapper[in-inner]',
    ]);
    calls.splice(0);

    act(() => acts.add('todo2'));

    expect(calls).toEqual([
      'HookWrapper[inner]',
      'SubWrapper',
      'HookWrapper[in-inner]',
    ]);
  });

  it('should not re-render components if selector returns same value', async () => {
    const opts = { selector: (s) => ({ l: s.loading }) };
    const Subscriber = createSubscriber(Store, opts);
    const useHook = createHook(Store, opts);

    const calls = [];
    let acts;

    const SubWrapper = () => (
      <Subscriber>
        {(_, action) => {
          acts = action;
          calls.push('SubWrapper');
          return null;
        }}
      </Subscriber>
    );

    const HookWrapper = () => {
      const [, boundActions] = useHook();
      acts = boundActions;
      calls.push('HookWrapper');
      return null;
    };

    render(
      <>
        <HookWrapper />
        <SubWrapper />
      </>
    );

    expect(calls).toEqual(['HookWrapper', 'SubWrapper']);

    calls.splice(0);
    act(() => acts.add('todo2'));

    expect(calls).toEqual([]);
  });

  it('should not render-loop if state/action returns shallow equal value', async () => {
    const useHook = createHook(Store);
    const calls = [];

    const HookWrapper = () => {
      const [state, boundActions] = useHook();
      useEffect(() => {
        boundActions.setLoading();
      }, [state, boundActions]);
      calls.push('HookWrapper');
      return null;
    };

    render(<HookWrapper />);

    expect(calls).toHaveLength(2);
  });

  it('should not re-compute selector if no arguments are passed', async () => {
    const selector = jest.fn((s) => s);
    const useHook = createHook(Store, { selector });

    const HookWrapper = () => {
      useHook();
      useHook();
      return null;
    };
    render(<HookWrapper />);

    expect(selector).toHaveBeenCalledTimes(1);
  });

  it('should re-compute selector if arguments are passed', async () => {
    const selector = jest.fn((s) => s);
    const useHook = createHook(Store, { selector });

    const HookWrapper = () => {
      useHook(1);
      useHook(1);
      return null;
    };
    render(<HookWrapper />);

    expect(selector).toHaveBeenCalledTimes(2);
  });

  it('should capture all contained stores', async () => {
    const SharedContainer = createContainer();
    const handlers1 = {
      onInit: jest.fn().mockReturnValue(() => {}),
      onUpdate: jest.fn().mockReturnValue(() => {}),
      onDestroy: jest.fn().mockReturnValue(() => {}),
      onContainerUpdate: jest.fn().mockReturnValue(() => {}),
    };
    const Store1 = createStore({
      name: 'store',
      initialState: { todos: [], loading: false },
      actions,
      containedBy: SharedContainer,
      handlers: handlers1,
    });

    const handlers2 = {
      onInit: jest.fn().mockReturnValue(() => {}),
      onUpdate: jest.fn().mockReturnValue(() => {}),
      onDestroy: jest.fn().mockReturnValue(() => {}),
      onContainerUpdate: jest.fn().mockReturnValue(() => {}),
    };
    const Store2 = createStore({
      name: 'two',
      initialState: {},
      actions,
      containedBy: SharedContainer,
      handlers: handlers2,
    });
    const Subscriber = createSubscriber(Store1);
    const Subscriber2 = createSubscriber(Store2);

    let acts;

    const App = ({ value }) => (
      <SharedContainer value={value}>
        <Subscriber>{(_, a) => ((acts = a), null)}</Subscriber>
        <Subscriber2>{() => null}</Subscriber2>
      </SharedContainer>
    );

    const { rerender, unmount } = render(<App value="1" />);

    expect(handlers1.onInit).toHaveBeenCalledTimes(1);
    expect(handlers2.onInit).toHaveBeenCalledTimes(1);
    expect(defaultRegistry.stores.size).toEqual(0);

    act(() => acts.add('todo2'));

    expect(handlers1.onUpdate).toHaveBeenCalledTimes(1);
    expect(handlers2.onUpdate).toHaveBeenCalledTimes(0);

    rerender(<App value="2" />);

    expect(handlers1.onContainerUpdate).toHaveBeenCalledTimes(1);
    expect(handlers2.onContainerUpdate).toHaveBeenCalledTimes(1);

    unmount();
    await actTick();

    expect(handlers1.onDestroy).toHaveBeenCalledTimes(1);
    expect(handlers2.onDestroy).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if contained store is used without container', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const Store1 = createStore({
      name: 'one',
      initialState: { todos: [], loading: false },
      actions,
      containedBy: createContainer(),
    });

    const Subscriber = createSubscriber(Store1);

    expect(() => {
      render(<Subscriber>{() => null}</Subscriber>);
    }).toThrow(/should be contained/);
    errorSpy.mockRestore();
  });

  describe('dispatchTo', () => {
    const createTestElements = ({ mainContainer, otherContainer }) => {
      const actionOther =
        (n) =>
        ({ setState }, { plus }) =>
          setState({ count: n, plus });
      const StoreOther = createStore({
        name: 'store-other',
        containedBy: otherContainer,
        initialState: {},
        actions: { set: actionOther },
      });
      const StoreMain = createStore({
        name: 'store-main',
        containedBy: mainContainer,
        initialState: {},
        actions: {
          setOther:
            (n) =>
            ({ dispatchTo }) =>
              dispatchTo(StoreOther, actionOther(n)),
        },
      });

      const MainSubscriber = createSubscriber(StoreMain);
      const OtherSubscriber = createSubscriber(StoreOther);
      const mainSpy = jest.fn().mockReturnValue(null);
      const otherSpy = jest.fn().mockReturnValue(null);

      const Content = () => (
        <>
          <MainSubscriber>{mainSpy}</MainSubscriber>
          <OtherSubscriber>{otherSpy}</OtherSubscriber>
        </>
      );
      return {
        Content,
        StoreMain,
        mainReturn: (n = 0) => mainSpy.mock.calls[n],
        otherReturn: (n = 0) => otherSpy.mock.calls[n],
      };
    };

    it('should allow dispatchTo global -> global', () => {
      const { Content, mainReturn, otherReturn } = createTestElements({
        mainContainer: null,
        otherContainer: null,
      });

      render(<Content />);
      const [, mainActions] = mainReturn(0);
      act(() => mainActions.setOther(1));

      expect(otherReturn(1)).toEqual([{ count: 1 }, expect.any(Object)]);
    });

    it('should allow dispatchTo contained -> contained', () => {
      const SharedContainer = createContainer();
      const { Content, mainReturn, otherReturn } = createTestElements({
        mainContainer: SharedContainer,
        otherContainer: SharedContainer,
      });

      render(
        <SharedContainer>
          <Content />
        </SharedContainer>
      );
      const [, mainActions] = mainReturn(0);
      act(() => mainActions.setOther(1));

      expect(otherReturn(1)).toEqual([{ count: 1 }, expect.any(Object)]);
    });

    it('should allow dispatchTo contained -> global', () => {
      const MainContainer = createContainer();
      const { Content, mainReturn, otherReturn } = createTestElements({
        mainContainer: MainContainer,
        otherContainer: null,
      });

      render(
        <MainContainer>
          <Content />
        </MainContainer>
      );
      const [, mainActions] = mainReturn(0);
      act(() => mainActions.setOther(1));

      expect(otherReturn(1)).toEqual([{ count: 1 }, expect.any(Object)]);
    });

    it('should allow dispatchTo global -> contained if properly contained', () => {
      const OtherContainer = createContainer({ displayName: 'OtherContainer' });
      const { Content, mainReturn, otherReturn } = createTestElements({
        mainContainer: null,
        otherContainer: OtherContainer,
      });

      render(
        <OtherContainer>
          <Content />
        </OtherContainer>
      );
      const [, mainActions] = mainReturn(0);
      act(() => mainActions.setOther(1));

      expect(otherReturn(1)).toEqual([{ count: 1 }, expect.any(Object)]);
    });

    it('should allow dispatchTo contained -> other contained', async () => {
      const MainContainer = createContainer();
      const OtherContainer = createContainer();

      const { Content, mainReturn, otherReturn } = createTestElements({
        mainContainer: MainContainer,
        otherContainer: OtherContainer,
      });

      render(
        <OtherContainer>
          <MainContainer>
            <Content />
          </MainContainer>
        </OtherContainer>
      );
      const [, mainActions] = mainReturn(0);
      act(() => mainActions.setOther(1));

      expect(otherReturn(1)).toEqual([{ count: 1 }, expect.any(Object)]);
    });

    it('should allow dispatchTo override -> contained', async () => {
      const { Content, StoreMain, mainReturn, otherReturn } =
        createTestElements({
          mainContainer: null,
          otherContainer: null,
        });
      const OverrideContainer = createContainer(StoreMain);

      render(
        <OverrideContainer>
          <Content />
        </OverrideContainer>
      );
      const [, mainActions] = mainReturn(0);
      act(() => mainActions.setOther(1));

      expect(otherReturn(1)).toEqual([{ count: 1 }, expect.any(Object)]);
    });
  });
});
