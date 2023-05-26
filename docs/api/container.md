## Container API

### createContainer

```js
createContainer([options]);
```

This is the recommended way of creating containers, passing them as `containedBy` attribute on store creation.

##### Arguments

1. [`options`] _(Object)_: containing one or more of the following keys:

   - `displayName` _(string)_: Used by React to better identify a component. Defaults to `Container(${storeName})`

##### Returns

_(Component)_: this React component allows you to change the behaviour of child components by providing different Store instances or custom props to actions. It accept the following props:

- `isGlobal` _(bool)_: by default, Container defines a local store instance. This prop will allow child components to get data from the global store's registry instance instead

- `scope` _(string)_: this option will allow creating multiple global instances of the same store. Those instances will be automatically cleaned once all the containers pointing to the scoped version are removed from the tree. Changing a Container `scope` will: create a new Store instance, make `onInit` action run again and all child components will get the data from it.

- `...props` _(any)_: any additional prop set on the Container component is made available in the actions of child components

##### Example

Let's create a Container that initializes all theme-related stores:

```js
// theming.js
import { createContainer } from 'react-sweet-state';
export const ThemeContainer = createContainer();

// colors.js
import { ThemeContainer } from './theming';
const ColorsStore = createStore({
  // ...
  containedBy: ThemeContainer,
});
// We can also have a FontSizesStore that has the same `containedBy` value

// app.js
const UserTheme = ({ colors, sizes }) => (
  <ThemeContainer initialTheme={{ colors, sizes }}>
    <TodosList />
  </ThemeContainer>
);
```

### createContainer as override

> _Note: this API configuration provides less flexibility and safety nets than using Store's `containedBy` and `handlers`, so we recommend using this style mostly for testing/storybook purposes._

```js
createContainer(Store, [options]);
```

##### Arguments

1. `Store` _(Object)_: The store type returned from a call to `createStore`

2. [`options`] _(Object)_: containing one or more of the following keys:

   - `displayName` _(string)_: Used by React to better identify a component. Defaults to `Container(${storeName})`.

   - `onInit` _(Function)_: an action that will be triggered on container initialisation. It overrides store's `handlers.onInit` and will be triggered every time the container is mounted.

   - `onUpdate` _(Function)_: an action that will be triggered when props on a container change. It is different from store's `onUpdate` API. It overrides store's `handlers.onContainerUpdate` and it does not receive current/prev props as arguments.

   - `onCleanup` _(Function)_: an action that will be triggered after the container has been unmounted and no more consumers of the store instance are present. Useful in case you want to clean up side effects like event listeners or timers. It overrides store's `handlers.onDestroy`.

##### Example

Let's create a container that provides an initial state on tests:

```js
import { createContainer } from 'react-sweet-state';
import { ColorsStore } from './colors';

const ColorsContainer = createContainer(ColorsStore, {
  onInit:
    () =>
    ({ setState }, { initialColor }) => {
      setState({ color: initialColor });
    },
});

it('should render with right color', () => {
  const mockColor = 'white';
  const { asFragment } = render(
    <ColorsContainer initialColor={mockColor}>
      <TodosList />
    </ColorsContainer>
  );
  expect(asFragment()).toMatchSnapshot();
});
```
