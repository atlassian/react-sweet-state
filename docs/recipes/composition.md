## Composition

Hooks allow composition naturally, without rendering additional components:

```js
// ...
import { useUserState } from './state-containers/user';
import { useProjectState } from './state-containers/projects';

const UserProject = uid => {
  const [userState, userActions] = useUserState();
  const [projectState, projectActions] = useProjectState();

  /* now we can useEffect to trigger userActions.load()
    and when user data is returned call projectActions.load(userState.data.id) */
  useEffect(() => {
    // note: should be responsibility of the action to avoid multiple/useless fetch requests
    userActions.load(uid);
  }, [uid, userActions]);

  useEffect(() => {
    // this effect will be triggered every time user data changes
    if (userState.data) {
      projectActions.load(userState.data);
    }
  }, [userState.data, projectActions]);

  return; /* ... */
};
```

If you are looking for a way to avoid render-props component hell, you can have composition via 3rd party libs, like `react-composer`:

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
