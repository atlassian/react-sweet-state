## Integration tests

If you want to assert how your components are behaving, we recommend using Containers to ensure each test is isolated.

```js
it('should increase the count', async () => {
  const TestContainer = createContainer(CounterStore);
  const TestComponent = () => {
    const [state, actions] = useCounter();
    return <button onClick={actions.increment}>count: {state.count}</button>;
  };

  render(
    <TestContainer>
      <TestComponent />
    </TestContainer>
  );
  const btn = screen.getByRole('button');
  await userEvent.click(btn);

  expect(btn).toHaveTextContent(`count: 2`);
});
```

In case you also need to provide some initial data, Container `onInit` action is perfect for that:

```js
const TestContainer = createContainer(CounterStore, {
  onInit:
    () =>
    ({ setState }) =>
      setState(mockData),
});
```

If every test component is wrapped in a Container, then there is no risk of global store leaks between tests.
Moreover, to ensure it does not accidentally happen, you add a check on `defaultRegistry` after each test and error if any store has been created there:

```js
import { defaultRegistry } from 'react-sweet-state';

afterEach(() => {
  if (defaultRegistry.stores.size > 0) {
    const keys = Array.from(defaultRegistry.stores.keys()).join(', ');
    throw new Error(
      `Some stores (${keys}) are not contained. Please wrap the component with a container to avoid leaks.`
    );
  }
});
```

In case you don't want to fail the test, you can call `defaultRegistry.stores.clear()` in the `afterEach` to force global stores to be removed between tests.
