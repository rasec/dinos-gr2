import { createContext, useState } from "react";

const UserContext = createContext({
  firebaseApp: {},
  user: {},
  setUser: (user) => {},
  setFirebaseApp: (firebaseApp) => {}
});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState({});
  const [firebaseApp, setFirebaseApp] = useState({});

  function setFirebaseAppHandler(firebaseApp) {
    setFirebaseApp(firebaseApp);
  };

  function setUserHandler(user) {
    setUser(user);
  };

  const context = {
    user: user,
    firebaseApp: firebaseApp,
    setUser: setUserHandler,
    setFirebaseApp: setFirebaseAppHandler
  };

  return (
    <UserContext.Provider value={context}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
