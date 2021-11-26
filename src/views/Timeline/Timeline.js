import React, { useState, useContext } from 'react';
import { Timeline, TimelineItem, TimelineDot, TimelineSeparator, TimelineConnector, TimelineOppositeContent, TimelineContent } from '@material-ui/lab';
import { Paper, makeStyles, CircularProgress } from '@material-ui/core';

import GamesContext from '../../store/games-context';
import RunsContext from '../../store/runs-context';

import ResultModal from '../../components/Results/ResultsModal';

import { STATUS, SPLITS_PER_RUN } from '../../utils/constants';

const useStyles = makeStyles((theme) => ({
  timeline: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  paper: {
    padding: '6px 16px',
    background: '#282c34',
    color: '#FFF',
    cursor: 'pointer'
  },
  succeeded: {
    color: '#0F0',
    content: 'OK',
  },
  failed: {
    color: '#F00',
    content: 'KO',
  },
  notended: {
    color: '#000',
  },
  run: {
    padding: '5px 0',
    verticalAlign: 'middle'
  },
  date: {
    fontSize: '20px'
  },
  loading: {
    width: '40px',
    height: '40px',
    margin: '0 auto',
    display: 'block',
  },
  clipLink: {
    color: '#FFF'
  },
  icon: {
    verticalAlign: 'middle',
    margin: '0 5px',
    display: 'inline-block'
  }
}));


const TimelineComponent = () => {
  // getModalStyle is not a pure function, we roll the style only on the first render
  const gamesContext = useContext(GamesContext);
  const runsContext = useContext(RunsContext);

  const games = gamesContext.games;
  const runs = runsContext.runs;

  const [dateRuns, setDateRuns] = useState([]);
  const [hasToShowResults, showResults] = useState(false);
  const classes = useStyles();
  const getRunStatus = (run) => {
    if (run.partial && (run.endSplit && run.endSplit < SPLITS_PER_RUN - 1)) {
      return STATUS.NOTENDED;
    }
    return (run.includesHit) ? STATUS.FAILED : STATUS.SUCCEEDED;
  };
  const displayCrossIcon = () => {
    return (
      <svg className="svg-icon" width="2em" height="2em" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.185,1.417c-4.741,0-8.583,3.842-8.583,8.583c0,4.74,3.842,8.582,8.583,8.582S18.768,14.74,18.768,10C18.768,5.259,14.926,1.417,10.185,1.417 M10.185,17.68c-4.235,0-7.679-3.445-7.679-7.68c0-4.235,3.444-7.679,7.679-7.679S17.864,5.765,17.864,10C17.864,14.234,14.42,17.68,10.185,17.68 M10.824,10l2.842-2.844c0.178-0.176,0.178-0.46,0-0.637c-0.177-0.178-0.461-0.178-0.637,0l-2.844,2.841L7.341,6.52c-0.176-0.178-0.46-0.178-0.637,0c-0.178,0.176-0.178,0.461,0,0.637L9.546,10l-2.841,2.844c-0.178,0.176-0.178,0.461,0,0.637c0.178,0.178,0.459,0.178,0.637,0l2.844-2.841l2.844,2.841c0.178,0.178,0.459,0.178,0.637,0c0.178-0.176,0.178-0.461,0-0.637L10.824,10z"></path>
      </svg>
    );
  };
  const displayTickIcon = () => {
    return (
      <>
        <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" fill="currentColor" className="bi bi-check-circle" viewBox="-2 -2 19 19">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
          <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
        </svg>
      </>
    );
  };
  const displayDayResults = (dateRuns) => {
    setDateRuns(dateRuns);
    showResults(true);
  };

  const displayResult = () => {
    return (
      <ResultModal runs={dateRuns} onClose={()=> showResults(false) } hasToShowResults={hasToShowResults} />
    );
  };

  const displayRun = (run) => {
    const runStatus = getRunStatus(run);
    const selectedRunGame = games[run.selectedGame];
    return (
      <div className={classes.run} key={run._id}>
        <span className={classes.icon}>
          {selectedRunGame?.name}
        </span>
        <span className={`${classes[runStatus.toLowerCase()]} ${classes.icon}`}>
          {
            (runStatus === STATUS.FAILED ? displayCrossIcon() : (runStatus === STATUS.SUCCEEDED ? displayTickIcon() : null))
          }
        </span>
      </div >
    );
  }
  const displayTimelineItem = (dateRuns = []) => {
    const sortedRuns = dateRuns.sort((a, b) => (a.order - b.order));
    const firstRun = sortedRuns?.[0];
    const date = firstRun?.date;
    return (
      <TimelineItem key={date}>
        <TimelineOppositeContent>
          <div color="textSecondary" className={classes.date}>{date}</div>
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Paper elevation={3} className={classes.paper} onClick={() => (displayDayResults(sortedRuns))}>
            {
              sortedRuns.map(run => { return displayRun(run); })
            }
          </Paper>
        </TimelineContent>
      </TimelineItem>
    )
  };
  if (runs && runs.length > 0) {
    const groupedRuns = runs.reduce((acc, run) => {
      const dateExists = acc.find(item => {
        return item.date === run.date
      });
      if (dateExists) {
        dateExists.runs.push(run);
      } else {
        acc.push({ 'date': run.date, runs: [run] })
      }
      return acc;
    }, []);
    const sortedRuns = groupedRuns?.sort((run1, run2) => {
      return (new Date(run1.date) - new Date(run2.date));
    });
    return (
      <>
        <Timeline align="alternate" className={classes.timeline}>
          {(sortedRuns.map(run => { return displayTimelineItem(run.runs) }))}
        </Timeline>
        {displayResult()}
      </>
    )
  }
  return (
    <div className={classes.loading}>
      <CircularProgress className={classes.loader} />
    </div>
  );
};
export default TimelineComponent;
