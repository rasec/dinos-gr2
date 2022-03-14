import React, { useState } from 'react';
import ResultColumn from './ResultColumn';
import Run from '../../types/run';
import style from './result.module.css';

const Results = ({ runs }: { runs: Run[] }) => {

  const [selectedDate] = useState(new Date());

  const showResult = () => {
    const sortedRuns = runs.sort((a, b) => (a.order - b.order)); // Just in case
    return sortedRuns?.map(({ selectedGame, includesHit, splitHit, clip, partial, startSplit, endSplit, order }: Run) =>
    (<ResultColumn
      selectedGame={selectedGame}
      includesHit={includesHit}
      splitHit={splitHit}
      clip={clip}
      date={selectedDate}
      order={order}
      partial={partial}
      startSplit={startSplit}
      endSplit={endSplit}/>));
  }

  if (runs && runs.length > 0) {
    return (
      <>
        <div className={style.tablecontent}>
          {
            showResult()
          }
        </div>
      </>);
  }
  return (
    <>
      loading data
    </>
  )
};
export default Results;
