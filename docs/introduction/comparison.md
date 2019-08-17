## Comparison with other libs

### How does sweet-state compare against Redux

As said in the [motivations](./motivation.md), sweet-state was heavily influenced by Redux, but tries to make the new patterns in React first class citizens.

There are lots of things that sweet-state and Redux share:

- debuggability: they both use the excellent Redux Devtools
- support for state selectors
- testability: both actions and selectors testing stratigies are the same

Some of the differences are:

- interoperability: Redux is known for working best when it owns your entire state. sweet-state instead fully promotes integration with any state management solution via composition
- reduced boilerplate: Sweet-state actions are in reality redux-thunk actions but there are no reducers, so the amount of code required is minimal compared to Redux.
- nesting ability: Sweet-state works great when you want your components to be resilient to whatever wraps them: as there is no `Provider` concept you can mix & match/nest components as you please, while nesting Redux providers can become challenging.

Is that enough to consider a switch? It’s your call, but if you plan to integrate other libraries like Apollo/GraphQL then Redux might start to fill like an "over-engineered" solution.

### How does sweet-state compare against Context API

Under the hood sweet-state uses React Context API, however sweet-state tries to protect consumers from common mistakes and at the same time improving debuggability, testability and performance.

Indeed, Context API has some limitation and you must be cautios if you are going to use it at scale:

- it is not designed for frequent updates [source](https://twitter.com/dan_abramov/status/1109595839347990528)
- async operations are tricky [blog](https://medium.com/@albertogasparin/the-pitfalls-of-async-operations-via-react-context-api-ab987d4290e6)
- it has performance limitation [issue](https://github.com/facebook/react/issues/13739)
- does not support selectors [issue](https://github.com/facebook/react/issues/14110)
- you cannot prevent re-renders [issue](https://github.com/facebook/react/issues/15156)
- correclty handle provider-less context is hard

So, if you start by just using Context API, and then end up adding selectors support, integration with Devtools and guidelines to protect yourself from the asynchronous nature of React `setState`, you are basically creating your own version of sweet-state.

### How does sweet-state compare against library X?

sweet-state was developed to solve some pain points within a 1M+ lines codebase, and we found stability, performance and support are paramount requirements that most libraries out there do not met.
