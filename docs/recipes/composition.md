## Composition

sweet-state supports render props composition via 3rd party libs:

```js
import Composer from "react-composer";
// ...

const UserProject = () => (
  <Composer
    components={[
      <UserSubscriber />,
      <ProjectSubscriber />
    ]}
  >
    {([[userState, userActions], [projectState, projectActions]]) => (
      /* here you can have a component that triggers userActions.load()
         and when user data is returned calls projectActions.load(userState.data.id) */
    )}
  </Composer>
);
```
