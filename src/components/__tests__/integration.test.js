/* eslint-env jest */

import React, { Fragment, Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';

import { createStore, defaultRegistry } from '../../store';
import { createContainer, createSubscriber } from '../creators';
import { createHook } from '../hook';

const Store = createStore({
  initialState: { todos: [], loading: false },
  actions: {
    add: todo => ({ setState, getState }) =>
      setState({ todos: [...getState().todos, todo] }),
    load: (v = '') => async ({ setState, getState }) => {
      if (getState().loading) return;
      setState({ loading: true });
      await Promise.resolve();
      setState({ todos: [`todo${v}`], loading: false });
    },
  },
});

const expectActions = {
  add: expect.any(Function),
  load: expect.any(Function),
};

describe('Integration', () => {
  beforeEach(() => {
    defaultRegistry.stores.clear();
    // this is a hack to get useEffect run sync, otherwise it might not get called
    jest.spyOn(React, 'useEffect').mockImplementation(React.useLayoutEffect);
  });

  afterEach(() => {
    React.useEffect.mockRestore();
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
      onInit: () => ({ actions }) => actions.load(),
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

    await Promise.resolve();

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
      onInit: () => ({ actions }, { v }) => actions.load(v),
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
      const [state, actions] = useHook();
      return fn(state, actions);
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

    const wrapper = mount(<App scopeId="A" />);
    await Promise.resolve();

    // 1. { loading: true, todos: [] };
    // 2. { loading: false, todos: ['todo1'] };
    expect(children1).toHaveBeenCalledTimes(2);
    expect(children2).toHaveBeenCalledTimes(2);
    expect(children3).toHaveBeenCalledTimes(2);
    expect(children4).toHaveBeenCalledTimes(2);

    wrapper.setProps({ scopeId: 'B' });
    await Promise.resolve();

    const state2 = { loading: true, todos: [] };
    expect(children1.mock.calls[2]).toEqual([state2, expectActions]);
    expect(children2.mock.calls[2]).toEqual([state2, expectActions]);
    // hooks currently re-render an additional time, we ignore it
    expect(children3.mock.calls[3]).toEqual([state2, expectActions]);
    expect(children4.mock.calls[3]).toEqual([state2, expectActions]);

    const state3 = { loading: false, todos: ['todoB'] };
    expect(children1.mock.calls[3]).toEqual([state3, expectActions]);
    expect(children2.mock.calls[3]).toEqual([state3, expectActions]);
    expect(children3.mock.calls[4]).toEqual([state3, expectActions]);
    expect(children4.mock.calls[4]).toEqual([state3, expectActions]);
  });
});
