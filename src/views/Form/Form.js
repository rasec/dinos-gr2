import React, { useState, useContext } from 'react';
import { TextField, Select, InputLabel, MenuItem, Button, Icon, Checkbox, FormControlLabel, CircularProgress } from '@material-ui/core';
import { getDatabase, ref, child, push, update } from "firebase/database";
import { getAuth, signInWithPopup, onAuthStateChanged, GoogleAuthProvider, signOut } from 'firebase/auth';

import GamesContext from '../../store/games-context';
import RunsContext from '../../store/runs-context';
import UserContext from '../../store/user-context';
import styles from './form.module.scss';

const Form = () => {
  const gamesContext = useContext(GamesContext);
  const runsContext = useContext(RunsContext);
  const userContext = useContext(UserContext);
  const games = gamesContext.games;

  const [includesHit, changeIncludesHit] = useState(false);
  const [selectedGame, changeSelectedGame] = useState(0);
  const [partial, changePartial] = useState(false);
  const [date, updateDate] = useState('');
  const [order, updateOrder] = useState(1);
  const [splitHit, updateHitSplit] = useState(undefined);
  const [startSplit, updateStartSplit] = useState(undefined);
  const [endSplit, updateEndSplit] = useState(undefined);
  const [clip, updateClip] = useState('');

  const auth = getAuth(userContext.firebaseApp);
  const provider = new GoogleAuthProvider();

  onAuthStateChanged(auth, (user) => userContext.setUser(user));


  const resetForm = () => {
    changeIncludesHit(false);
    changeSelectedGame(0);
    changePartial(false);
    updateDate('');
    updateOrder(1);
    updateHitSplit(undefined);
    updateStartSplit(undefined);
    updateEndSplit(undefined);
    updateClip('');
  };

  const listSplits = (game) => {
    const splitsSorted = game?.splits?.sort((split1, split2) => (split1.order - split2.order));
    return (splitsSorted?.map(split =>
      <MenuItem key={split.id} value={split.id}>{split.name}</MenuItem>
    ));
  }

  const showHitSelector = () =>
  (<div className={styles.formitem} >
    <InputLabel id="splitHit">Split Hit</InputLabel>
    <Select className={styles.select} labelId="splitHit" id="splitHitSelect" value={splitHit} onChange={e => updateHitSplit(e.target.value)}>
      {listSplits(games[selectedGame])}
    </Select>

  </div>
  );

  const showStartAndEndSelectors = () => {
    return (<>
      <div className={styles.formitem} >
        <InputLabel id="splitStart">Split Start</InputLabel>
        <Select className={styles.select} labelId="splitStart" id="splitStartSelect" value={startSplit} onChange={e => updateStartSplit(e.target.value)}>
          {listSplits(games[selectedGame])}
        </Select>
      </div>
      <div className={styles.formitem} >
        <InputLabel id="splitEnds">Split End</InputLabel>
        <Select labelId="splitEnd" id="splitEndSelect" value={endSplit} onChange={e => updateEndSplit(e.target.value)}>
          {listSplits(games[selectedGame])}
        </Select>
      </div>
    </>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const state = { date, selectedGame, includesHit, splitHit, clip, order, partial, endSplit, startSplit };

    const db = getDatabase(window.firebaseApp);
    const cleanUpState = JSON.parse(JSON.stringify(state));
    // Get a key for a new Run.
    const newRunKey = push(child(ref(db), 'run')).key;
    const updates = {};
    updates['/run/' + newRunKey] = cleanUpState;
    update(ref(db), updates).then(result => {
      runsContext.addRun(state);
      resetForm();
    }).catch(error => {
      console.log(`Error adding a new run: ${error}`);
    });
  };

  const displayUserButton = () => {
    if(userContext.user && userContext.user.isAnonymous === false) {
      return (<div className={styles.userheader}><span>Logged as {userContext.user.email}</span> <button onClick={()=> signOut(auth)}>Logout</button></div>);
    }
    return (<div className={styles.userheader}><span>Only allowed users can add new runs</span><button onClick={()=> signInWithPopup(auth, provider)}>Login</button></div>);
  }
  if (games && games.length > 0) {
    const listGames = games.map(game =>
      <MenuItem key={game.id} value={game.id}>{game.name}</MenuItem>
    );
    return (
      <>
      {displayUserButton()}
      <form className={styles.container} noValidate onSubmit={handleSubmit}>
        <div className={styles.formitem} >
          <TextField
            id="date"
            label="Run Date"
            type="date"
            className={styles.textField}
            value={date}
            onInput={e => updateDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </div>
        <div className={styles.formitem} >
          <TextField
            id="order"
            label="Run number in the day"
            type="number"
            className={styles.textField}
            value={order}
            onInput={e => updateOrder(parseInt(e.target.value, 10))}
          />
        </div>
        <div className={styles.formitem} >
          <InputLabel id="game">Game</InputLabel>
          <Select className={styles.select} labelId="game" id="gameSelect" value={selectedGame} onChange={e => changeSelectedGame(e.target.value)}>
            {listGames}
          </Select>
        </div>
        <div className={styles.formitem} >
          <FormControlLabel
            control={
              <Checkbox
                checked={partial}
                onChange={() => changePartial(!partial)}
                name="partial"
                color="primary"
              />
            }
            label="Partial Run?"
          />
        </div>
        {
          (partial ?
            (showStartAndEndSelectors())
            : null)
        }
        <div className={styles.formitem} >
          <FormControlLabel
            control={
              <Checkbox
                checked={includesHit}
                onChange={() => changeIncludesHit(!includesHit)}
                name="includesHit"
                color="primary"
              />
            }
            label="Hit?"
          />
        </div>
        {
          (includesHit ? (showHitSelector())
            : null)
        }
        <div className={styles.formitem} >
          <TextField multiline rows={4} id="run-clip" label="Clip" className={styles.clip} value={clip} onInput={e => updateClip(e.target.value)} />
        </div>
        <Button variant="contained" color="primary" endIcon={<Icon>send</Icon>} type="submit">
          Submit
        </Button>
      </form>
      </>
    )
  }
  return (
    <div className={styles.loaderContainer}>
      <CircularProgress className={styles.loader} />
    </div>
  );
}

export default Form;
