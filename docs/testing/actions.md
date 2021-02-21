## Simple actions

You will often find yourself writing actions that hold no special internal logic. These will likely only call `setState` or do so conditionally based on inputs. For example:

```js
const actions = {
  reset: () => ({ setState, getState }) => {
    if (getState().count !== 0) {
      setState({ count: 0 });
    }
  },
};
```

To test this kind of action you easily mock the thunks dependencies directly and execute assertions on your mocks. The following tests would cover logic in the above `reset` action:

```js
import resetAction from './reset';

const thunk = resetAction();
const setState = jest.fn();
const getState = jest.fn(() => ({}));

beforeEach(() => {
  jest.resetAllMocks();
});

it('should not setState if the count is 0', () => {
  getState.mockImplementation(() => ({
    count: 0;
  }));
  thunk({ setState, getState });
  expect(setState).not.toHaveBeenCalled();
});

it('should reset state if the current count is not 0', () => {
  getState.mockImplementation(() => {
    count: 1;
  });
  thunk({ setState, getState });
  expect(setState).toHaveBeenCalledTimes(1);
  expect(setState).toHaveBeenCalledWith({ count: 0 });
});
```

## Async actions

When your action contains some asynchronous logic, calls to endpoints for example, you can use the same testing strategy as with simple actions. The main difference being you'll need to make your tests async. Let's see an example of an asynchronous action:

```js
import { fetchUser } from './rest/user';

const actions = {
  fetchUserData: (userId) => async ({ setState, getState }) => {
    const currentUser = getState().user;

    // Return if data exists
    if (currentUser.data && currentUser.data.id === userId) {
      return;
    }

    // Set loading state to true
    setState({
      user: {
        loading: true,
        data: null,
        error: null,
      },
    });

    try {
      // Initiate request
      const newUserData = await fetchStatus(userId);

      // Store success
      setState({
        user: {
          loading: false,
          data: newUserData,
          error: null,
        },
      });
    } catch (e) {
      // Store failure
      setState({
        loading: false,
        error: e.message,
      });
    }
  },
};
```

This action, despite it looking more complex than the simple one we first tested, can be validated with the same simple testing strategy. We obtain the thunk, mock the dependencies and assert on them:

```js
import { fetchUser } from './rest/user';
import fetchUserDataAction from './fetch-user-data';

jest.mock('./rest/user', () => ({
  fetchUser: jest.fn(),
}));

const userId_1 = '12345-abc';
const mockUserData_1 = {
  id: userId,
  name: 'Place',
  surmane: 'Holder',
  avatar: 'https://placehold.it/80x80',
};

const thunk = fetchUserDataAction(userId_1);
const setState = jest.fn();
const getState = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();
});

it('should return the existing user data if present', async () => {
  getState.mockImplementation(() => ({
    user: mockState,
  }));

  await thunk({ setState, getState });

  expect(setState).not.toHaveBeenCalled();
});

it('should setState to loading while request is in flight', async () => {
  fetchUser.mockImplementation(() => Promise.resolve(mockUserData_1));

  await thunk({ setState, getState });

  expect(setState).toHaveBeenNthCalledWith(1, {
    user: {
      loading: true,
      data: null,
      error: null,
    },
  });
});

it('should store response data', async () => {
  fetchUser.mockImplementation(() => Promise.resolve(mockUserData_1));

  await thunk({ setState, getState });

  expect(setState).toHaveBeenNthCalledWith(2, {
    user: {
      loading: false,
      data: mockUserData_1,
    },
  });
});

it('should store the error message on failure', async () => {
  const errorMessage = 'Failure message';
  fetchUser.mockImplemantation(() => Promise.reject(errorMessage));

  await thunk({ setState, getState });

  expect(setState).toHaveBeenNthCalledWith(2, {
    user: {
      loading: false,
      error: errorMessage,
    },
  });
});
```

## Composed actions

Actions can trigger other actions inside them. Testing these state changes can be more or less complicated, depending on how complex a relationship you build between the actions. Let's look at an example of an action triggering another:

```js
import { sendClickAnalytics } from './analytics';

const clickAnalytics = () => ({ setState, getState }) => {
  const currentTime = Date.now();

  // Store last anaytics sent and execute
  setState({ lastAnalytics: currentTime });
  sendClickAnalytics(getState());
};

const clickManager = () => ({ setState, getState, dispatch }) => {
  // Update click counter
  const currentCount = getState().count;
  setState({ count: currentCount + 1 });

  // Send analytics every 5 clicks
  if (currentCount + 1 === 5) {
    dispatch(clickAnanlytics());
  }
};

const actions = {
  clickAnalytics,
  clickManager,
};
```

In this scenario we have two actions that affect the store state and one of them holds logic that triggers the other. Testing these two actions would be as trivial as testing the simple action (described in the first section). When testing the `clickManager` action in this example we would mock `setState`, `getState` and `dispatch`. Then, we would assert on the expected calls to these functions and their arguments.

#### Note of caution

When creating actions you can make them as complex and intertwined as you like. Below we show an example of the sort of situation you can build. **However, we strongly advise you don't write actions that directly depend on transient state set by other actions**. This is considered a 'code smell' and indicator of an incorrect separation of concerns across actions.

```js
// Example of intertwined actions

const interimAction = () => ({ setState }) => {
  setState({ option2: Date.now() });
};

const initiatorAction = () => ({ setState, getState, dispatch }) => {
  setState({ option1: Date.now() });

  dispatch(interimAction());

  const { option2: newOption } = getState();

  if (Date.now() - newOption < 50) {
    // fast action
    setState({ type: 'fast' });
  } else {
    setState({ type: 'slow' });
  }
};
```
