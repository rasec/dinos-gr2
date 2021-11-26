import React, { useState } from 'react';
import ResultColumn from './ResultColumn';
import style from './result.module.css';

const Results = ({ runs }) => {

  const [selectedDate] = useState('');

  const showResult = () => {
    const sortedRuns = runs.sort((a, b) => (a.order - b.order)); // Just in case
    return sortedRuns?.map(({ selectedGame, includesHit, splitHit, clip, partial, startSplit, endSplit }) =>
    (<ResultColumn
      selectedGame={selectedGame}
      includesHit={includesHit}
      splitHit={splitHit}
      clip={clip}
      date={selectedDate}
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
