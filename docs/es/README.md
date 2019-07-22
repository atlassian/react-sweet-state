<h1>
  <img align="middle" src="https://user-images.githubusercontent.com/84136/59560300-2fca8e80-9053-11e9-8f90-76d9ef281ca6.png" alt="react-sweet-state logo" height="100" />
  <span>react-sweet-state</span>
</h1>

!> **WIP: Estamos terminando de traducir los docs**

Lo mejor de Redux y React Context unido en una solucion flexible, escalable y fácil de usar.

```sh
npm i react-sweet-state
# or
yarn add react-sweet-state
```

```js
import { createStore, createSubscriber, createHook } from "react-sweet-state";

const Store = createStore({
  // valor inicial del store
  initialState: {
    count: 0
  },
  // acciones para modificar el estado del store
  actions: {
    increment: (by = 1) => ({ setState, getState }) => {
      // mutación de estado síncrona
      setState({
        count: getState().count + by
      });
    }
  },
  // opcional, generalmente utilizado para debugar con facilidad
  name: "counter"
});

const CounterSubscriber = createSubscriber(Store);
// or
const useCounter = createHook(Store);

const App = () => (
  <div>
    <h1>My counter</h1>
    <CounterSubscriber>
      {/* Store state is the first argument and actions are the second one */}
      {/* El primer argumento recibido es el estado del store y el segundo las acciones */}
      {(state, actions) => (
        <div>
          {state.count}
          <button onClick={() => actions.increment()}>Add +1</button>
          <button onClick={() => actions.increment(2)}>Add +2</button>
        </div>
      )}
    </CounterSubscriber>
  </div>
);
```
