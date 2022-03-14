
import React, { useState, useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import Game from './types/game';
import Run from './types/run';

import { initializeApp } from 'firebase/app';

import GamesContext from './store/games-context';
import RunsContext from './store/runs-context';
import UserContext, { UserContextType } from './store/user-context';

import Form from './views/Form/Form';
import Timeline from './views/Timeline/Timeline';
import Statistics from './views/Statistics/Statistics';
import Visual from './views/Statistics/Visual';

import firebaseConfig from './config/firebase.config';

import './App.css';

export default function App() {
  const gamesContext = useContext(GamesContext);
  const runsContext = useContext(RunsContext);
  const userContext: UserContextType = useContext(UserContext);

  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  if (!firebaseInitialized && userContext) {
    const firebaseApp = initializeApp(firebaseConfig);
    userContext?.setFirebaseApp?.(firebaseApp);
    setFirebaseInitialized(true);
  }

  useEffect(() => {
    if (!gamesContext.games || gamesContext.games.length <= 0) {
      fetch('https://dino-gr2-default-rtdb.europe-west1.firebasedatabase.app/games.json',)
        .then(response => response.json())
        .then(games => {
          const sortedGames = games.sort((a: Game, b: Game) => (a.id - b.id));
          gamesContext.setGames?.(sortedGames);
        });
    }
    if (!runsContext.runs || runsContext.runs.length <= 0) {
      fetch('https://dino-gr2-default-rtdb.europe-west1.firebasedatabase.app/run.json',)
        .then(response => response.json())
        .then(runsResponse => {
          if (runsResponse && runsContext.setRuns) {
            const runs: Run[] = (Object.values(runsResponse) as Run[]);
            runsContext?.setRuns(runs);
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  if (!firebaseInitialized || !userContext.firebaseApp || !("name" in userContext.firebaseApp)) {
    return (<>Loading...</>);
  }
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Timeline</Link>
            </li>
            <li>
              <Link to="/statistics">Statistics</Link>
            </li>
            <li>
              <Link to="/visual">Time Progress</Link>
            </li>
            <li>
              <Link to="/form">Add new Runs</Link>
            </li>
          </ul>
        </nav>
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route exact path="/">
            <Timeline />
          </Route>
          <Route path="/form" >
            <Form />
          </Route>
          <Route path="/statistics">
            <Statistics />
          </Route>
          <Route path="/visual">
            <Visual />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
