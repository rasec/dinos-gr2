import React, { useState, useContext } from 'react';
import { Chart } from "react-google-charts";

import GamesContext from '../../store/games-context';
import RunsContext from '../../store/runs-context';

import GameTable from '../../components/Statistics/GameTable';
import FilterForm from '../../components/Statistics/FilterForm';
import StatTable from '../../components/Statistics/StatTable';
import GameRunModal from '../../components/Statistics/GameRunModal';
import { successRunFilter, calculateSuccessRate } from '../../utils/utils';

import styles from './statistics.module.scss';
import ds1Logo from '../../static/img/ds1.png';
import ds2Logo from '../../static/img/ds2.png';
import ds3Logo from '../../static/img/ds3.png';
import desLogo from '../../static/img/des.png';
import bbLogo from '../../static/img/bb.png';
import skLogo from '../../static/img/sekiro.png';

const logos = {
  DS1: ds1Logo,
  DS2: ds2Logo,
  DS3: ds3Logo,
  DeS: desLogo,
  BB: bbLogo,
  SK: skLogo,
};

const getRunsByGameNumber = (runs) => {
  const checkFunctions = [isRunFirstGame, isRunSecondGame, isRunThridGame, isRunFourthGame, isRunFifthGame, isRunLastGame];
  const runsByGameNumber = [[], [], [], [], [], []];

  const clearedRuns = runs.filter((run) => run.endSplit === undefined);
  clearedRuns.forEach((run, index) => {
    checkFunctions.forEach((gameFunction, gameIndex) => {
      if (gameFunction({ run, index, runs: clearedRuns })) {
        runsByGameNumber[gameIndex].push(run);
      }
    });
  });
  return runsByGameNumber;
};

const isNGame = ({ run, index, runs, previousRuns }) => {
  // Run is minor that the current number (it is 3th run and we check for game 3, 4, 5, 6)
  if (index < previousRuns) {
    return false;
  }
  // Previous + 1 as it will also be the next type
  if (runs[index - (previousRuns + 1)] && runs[index - (previousRuns + 1)].includesHit === false) {
    return false;
  }
  let isNGame = true;
  for (let i = 0, j = 1; i < previousRuns; i += 1, j += 1) {
    if ((runs[index - j] && runs[index - j].includesHit === true)) {
      isNGame = false;
    }
  }
  return isNGame;
};

const isRunFirstGame = ({ run, index, runs }) => isNGame({ run, index, runs, previousRuns: 0 });
const isRunSecondGame = ({ run, index, runs }) => isNGame({ run, index, runs, previousRuns: 1 });
const isRunThridGame = ({ run, index, runs }) => isNGame({ run, index, runs, previousRuns: 2 });
const isRunFourthGame = ({ run, index, runs }) => isNGame({ run, index, runs, previousRuns: 3 });
const isRunFifthGame = ({ run, index, runs }) => isNGame({ run, index, runs, previousRuns: 4 });
const isRunLastGame = ({ run, index, runs }) => isNGame({ run, index, runs, previousRuns: 5 });


const getGamesSplits = games => {
  const DS1Splits = games[0].splits;
  const DS2Splits = games[1].splits;
  const DS3Splits = games[2].splits;
  const DeSSplits = games[3].splits;
  const BBSplits = games[4].splits;
  const SKSplits = games[5].splits;
  return {
    DS1Splits,
    DS2Splits,
    DS3Splits,
    DeSSplits,
    BBSplits,
    SKSplits
  };
}

const getTotalRuns = filteredRunsNoPartial => {
  const totalDS1Runs = filteredRunsNoPartial.filter(run => {
    return (run.selectedGame === 0);
  });

  const totalDS2Runs = filteredRunsNoPartial.filter(run => {
    return (run.selectedGame === 1);
  });

  const totalDS3Runs = filteredRunsNoPartial.filter(run => {
    return (run.selectedGame === 2);
  });

  const totalDeSRuns = filteredRunsNoPartial.filter(run => {
    return (run.selectedGame === 3);
  });

  const totalBBRuns = filteredRunsNoPartial.filter(run => {
    return (run.selectedGame === 4);
  });

  const totalSKRuns = filteredRunsNoPartial.filter(run => {
    return (run.selectedGame === 5);
  });

  return {
    totalDS1Runs,
    totalDS2Runs,
    totalDS3Runs,
    totalDeSRuns,
    totalBBRuns,
    totalSKRuns
  }
}

const Statistics = () => {
  const gamesContext = useContext(GamesContext);
  const runsContext = useContext(RunsContext);

  const games = gamesContext.games;
  const runs = runsContext.runs;
  const [initialDate, setInitalDate] = useState('2021-09-20');
  const [endDate, setEndDate] = useState(null);
  const [splitHits, setSplitHits] = useState([]);
  const [succeedGameRuns, setSucceedGameRuns] = useState([]);
  const [currentSplitName, setCurrentSplitName] = useState('');
  const [currentGameName, setCurrentGameName] = useState('');

  if (games.length > 0 && runs.length > 0) {

    const gamesSplits = getGamesSplits(games);

    const runsSortedByDate = runs.sort((run1, run2) => {
      const run1Date = new Date(run1.date);
      const run2Date = new Date(run2.date);
      const run1DateOrder = run1Date.getTime() + run1.order;
      const run2DateOrder = run2Date.getTime() + run2.order;
      return run1DateOrder - run2DateOrder;
    });


    let filteredRuns = runsSortedByDate.filter(run => (new Date(run.date) >= new Date(initialDate)));
    if (endDate) {
      filteredRuns = filteredRuns.filter(run => (new Date(run.date) <= new Date(endDate)));
    }

    const runsByGameNumber = getRunsByGameNumber(filteredRuns);

    const firstRuns = runsByGameNumber[0];
    const secondRuns = runsByGameNumber[1];
    const thridRuns = runsByGameNumber[2];
    const fourthRuns = runsByGameNumber[3];
    const fifthRuns = runsByGameNumber[4];
    const lastRuns = runsByGameNumber[5];

    const filteredRunsNoPartial = filteredRuns.filter(run => {
      return (!run.partial || run.clip);
    });

    const totalRuns = getTotalRuns(filteredRunsNoPartial);

    const {
      totalDS1Runs,
      totalDS2Runs,
      totalDS3Runs,
      totalDeSRuns,
      totalBBRuns,
      totalSKRuns
    } = totalRuns;

    const onSplitHitClick = (splitHits) => {
      setSplitHits(splitHits);
      setCurrentSplitName(splitHits[0].name);
    }

    const gameStats = [
      {
        runs: filteredRunsNoPartial,
        displayText: 'All'
      },
      {
        runs: totalDS1Runs,
        displayText: 'DS1'
      }, {
        runs: totalDS2Runs,
        displayText: 'DS2'
      }, {
        runs: totalDS3Runs,
        displayText: 'DS3'
      }, {
        runs: totalDeSRuns,
        displayText: 'DeS'
      }, {
        runs: totalBBRuns,
        displayText: 'BB'
      }, {
        runs: totalSKRuns,
        displayText: 'SK'
      }
    ];
    const gameOrderStats = [
      {
        runs: filteredRunsNoPartial,
        displayText: 'All'
      },
      {
        runs: firstRuns,
        displayText: '1st Game'
      }, {
        runs: secondRuns,
        displayText: '2nd Game'
      }, {
        runs: thridRuns,
        displayText: '3rd Game'
      }, {
        runs: fourthRuns,
        displayText: '4th Game'
      }, {
        runs: fifthRuns,
        displayText: '5th Game'
      }, {
        runs: lastRuns,
        displayText: 'Last Game'
      }
    ];

    const statRowItemClickHandler = (successfulRuns, text) => {
      setSucceedGameRuns(successfulRuns);
      setCurrentGameName(text);
    };

    let chatData = [['Game', 'Value']];

    gameStats.forEach((gameStat, index) => {
      if (index === 0) {
        return;// remove All stats
      }
      const successfulRuns = gameStat.runs.filter(successRunFilter);
      chatData.push([gameStat.displayText, calculateSuccessRate({ successfulRuns, totalRuns: gameStat.runs })]);
    });

    const getPerGameData = (gameStats) => {
      const perGameData = [['Game', 'Successful Runs']];
      gameStats.forEach((gameStat, index) => {
        if (index === 0) {
          return;// remove All stats
        }
        const succesfulGameRuns = gameStat.runs.filter(successRunFilter);
        perGameData.push([gameStat.displayText, succesfulGameRuns.length]);
      });
      return perGameData;
    }

    const getPerGameOrderData = (gameOrderStats) => {
      const perGameData = [['Game', 'Successful Runs']];
      gameOrderStats.forEach((gameNumberStat, index) => {
        if (index === 0) {
          return;// remove All stats
        }
        const succesfulGameRuns = gameNumberStat.runs.filter(successRunFilter);
        perGameData.push([gameNumberStat.displayText, succesfulGameRuns.length]);
      });
      return perGameData;
    }

    const perGameData = getPerGameData(gameStats);
    const perGameOrderData = getPerGameOrderData(gameOrderStats);

    return (
      <>
        <div className={styles.statistics}>
          <FilterForm setInitalDate={setInitalDate} setEndDate={setEndDate} />
          <div className={styles.break} />
          <h2>Statistics since: {initialDate}, until: {endDate ? endDate : 'today'}</h2>
          <div className={styles.break} />
          <StatTable runsList={gameStats} onClickHandler={statRowItemClickHandler} />
          <StatTable runsList={gameOrderStats} onClickHandler={statRowItemClickHandler} />
          <div className={styles.break} />
          <div style={{ display: 'flex', maxWidth: 1000, margin: 'auto' }}>
            <Chart
              width={500}
              height={400}
              chartType="PieChart"
              loader={<div>Loading Chart</div>}
              data={perGameData}
              options={{
                colors: ['#4285f3', '#DB4437', '#F4B400', '#369D57', '#AA47BC', '#41ACC0'],
                intervals: { style: 'sticks' },
                isStacked: true,
                title: 'Succesful Runs per Game',
                chartArea: { width: '70%' },
                hAxis: {
                  title: 'Game',
                  minValue: 0,
                },
                vAxis: {
                  title: 'Succesful Runs',
                },
              }}
            />
            <Chart
              width={500}
              height={400}
              chartType="PieChart"
              loader={<div>Loading Chart</div>}
              data={perGameOrderData}
              options={{
                colors: ['#4285f3', '#DB4437', '#F4B400', '#369D57', '#AA47BC', '#41ACC0'],
                intervals: { style: 'sticks' },
                isStacked: true,
                title: 'Succesful Runs per Game Order',
                chartArea: { width: '70%' },
                hAxis: {
                  title: 'Game',
                  minValue: 0,
                },
                vAxis: {
                  title: 'Succesful Runs',
                },
              }}
            />
          </div>
          <div className={styles.break} />
          <div>
            <Chart
              width={1600}
              height={300}
              chartType="Gauge"
              loader={<div>Loading Chart</div>}
              data={chatData}
              options={{
                redFrom: 0,
                redTo: 33,
                yellowFrom: 33,
                yellowTo: 66,
                greenFrom: 66,
                greenTo: 100,
                minorTicks: 5,
              }}
              rootProps={{ 'data-testid': '1' }}
            />
          </div>
          <div className={styles.splitStats}>
            {games.map(game => {
              const logo = logos[game.acronym];
              return (<GameTable onSplitHitClick={onSplitHitClick} gameName={game.name} gameShortName={game.acronym} logo={logo} totalRuns={totalRuns[`total${game.acronym}Runs`]} splits={gamesSplits[`${game.acronym}Splits`]} />);
            })
            }
          </div>
          {
            (succeedGameRuns.length > 0) ?
              <GameRunModal runs={succeedGameRuns} type='succeed' displayText={currentGameName} onClose={setSucceedGameRuns} />
              :
              ''
          }
          {(
            (splitHits.length > 0) ?
              <GameRunModal runs={splitHits} type='hits' displayText={currentSplitName} onClose={setSplitHits} />
              :
              ''
          )}
        </div >
      </>
    );
  } else {
    return (
      <>
        Loading data
      </>
    )
  }
};
export default Statistics;
