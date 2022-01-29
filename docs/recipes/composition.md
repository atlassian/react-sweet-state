## Composition

Hooks allow composition naturally, without rendering additional components. Moreover, by creating actions-only hooks you can ensure side effect compositions to not waste re-render cycles:

```js
// ...
import { useUserState } from './state-containers/user';
import { useProjectActions } from './state-containers/projects';

const UserProject = (uid) => {
  const [userState, userActions] = useUserState();
  const projectActions = useProjectActions();

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
