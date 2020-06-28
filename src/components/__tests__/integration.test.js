/* eslint-env jest */

import React, { Fragment, Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import { createStore, defaultRegistry } from '../../store';
import { createContainer } from '../container';
import { createSubscriber } from '../subscriber';
import { createHook } from '../hook';

const actTick = () => act(async () => await Promise.resolve());

const actions = {
  add: todo => ({ setState, getState }) =>
    setState({ todos: [...getState().todos, todo] }),
  load: (v = '') => async ({ setState, getState }) => {
    if (getState().loading) return;
    setState({ loading: true });
    await Promise.resolve();
    setState({ todos: [`todo${v}`], loading: false });
  },
};
const Store = createStore({
  initialState: { todos: [], loading: false },
  actions,
});

const expectActions = {
  add: expect.any(Function),
  load: expect.any(Function),
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
    mount(
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
      onInit: () => ({ dispatch }) => dispatch(actions.load()),
    });
    const Subscriber = createSubscriber(Store);

    const children1 = jest.fn(() => null);
    const children2 = jest.fn(() => null);

    mount(
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
      onInit: () => ({ dispatch }, { v }) => dispatch(actions.load(v)),
    });
    const Subscriber = createSubscriber(Store);
    const useHook = createHook(Store);

    const children1 = jest.fn(() => null);
    const children2 = jest.fn(() => null);
    const children3 = jest.fn(() => null);
    const children4 = jest.fn(() => null);

    const IsolatedSubscriber = React.memo(() => (
      <Subscriber>{children2}</Subscriber>
    ));

    const Hook = ({ fn = children3 }) => {
      const [state, boundActions] = useHook();
      return fn(state, boundActions);
    };

    // cannot use React.memo here as bug in enzyme-adapt 1.11
    class IsolatedHook extends PureComponent {
      render() {
        return <Hook fn={children4} />;
      }
    }

    class App extends Component {
      static propTypes = {
        scopeId: PropTypes.string,
      };
      render() {
        return (
          <Container scope={this.props.scopeId} v={this.props.scopeId}>
            <Subscriber>{children1}</Subscriber>
            <IsolatedSubscriber />
            <Hook />
            <IsolatedHook />
          </Container>
        );
      }
    }

    const wrapper = mount(<App scopeId="a" />);
    await actTick();

    // 1. { loading: true, todos: [] };
    // 2. { loading: false, todos: ['todo1'] };
    expect(children1).toHaveBeenCalledTimes(2);
    expect(children2).toHaveBeenCalledTimes(2);
    expect(children3).toHaveBeenCalledTimes(2);
    expect(children4).toHaveBeenCalledTimes(2);

    wrapper.setProps({ scopeId: 'B' });

    await actTick();

    const state2 = { loading: true, todos: [] };
    const call2 = 2;
    expect(children1.mock.calls[call2]).toEqual([state2, expectActions]);
    expect(children2.mock.calls[call2]).toEqual([state2, expectActions]);
    expect(children3.mock.calls[call2]).toEqual([state2, expectActions]);
    expect(children4.mock.calls[call2]).toEqual([state2, expectActions]);

    await actTick();

    const state3 = { loading: false, todos: ['todoB'] };
    // should be 3 but enzyme does not support batching properly
    const call3 = 4;
    expect(children1.mock.calls[call3]).toEqual([state3, expectActions]);
    expect(children2.mock.calls[call3]).toEqual([state3, expectActions]);
    expect(children3.mock.calls[call3]).toEqual([state3, expectActions]);
    expect(children4.mock.calls[call3]).toEqual([state3, expectActions]);
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

    function ParentComponent({ children }) {
      return (
        <Subscriber>
          {(state, action) => parent({ state, action, children })}
        </Subscriber>
      );
    }
    ParentComponent.propTypes = { children: PropTypes.any };

    const App = () => (
      <Container scope="test">
        <ParentComponent>
          <Children />
          <Hook />
        </ParentComponent>
      </Container>
    );

    mount(<App />);
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

    HookWrapper.propTypes = { name: PropTypes.string, children: PropTypes.any };

    class App extends Component {
      static propTypes = {
        scopeId: PropTypes.string,
      };
      render() {
        return (
          <>
            <HookWrapper name="outter" />
            <Container scope={this.props.scopeId} v={this.props.scopeId}>
              <HookWrapper name="inner">
                <SubWrapper />
                <HookWrapper name="in-inner" />
              </HookWrapper>
            </Container>
          </>
        );
      }
    }

    const wrapper = mount(<App scopeId="a" />);
    await actTick();

    expect(calls).toEqual([
      'HookWrapper[outter]',
      'HookWrapper[inner]',
      'SubWrapper',
      'HookWrapper[in-inner]',
    ]);

    calls.splice(0);

    wrapper.setProps({ scopeId: 'B' });
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
    const opts = { selector: s => ({ l: s.loading }) };
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

    mount(
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
});
