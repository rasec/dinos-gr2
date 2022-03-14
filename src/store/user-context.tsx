import { createContext, useState, Context, ReactNode } from "react";

import { FirebaseApp } from '@firebase/app';
import { User as FirebaseUser } from '@firebase/auth';

export type UserContextType = {
  firebaseApp?: FirebaseApp,
  user?: FirebaseUser,
  setUser?: (user?: FirebaseUser) => void
  setFirebaseApp?: (firebaseApp: FirebaseApp) => void
};

const UserContext: Context<UserContextType> = createContext({});

export function UserContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser|undefined>();
  const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | undefined>();

  function setFirebaseAppHandler(firebaseApp?: FirebaseApp) {
    setFirebaseApp(firebaseApp);
  };

  function setUserHandler(user?: FirebaseUser) {
    setUser(user);
  };

  const context: UserContextType = {
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
