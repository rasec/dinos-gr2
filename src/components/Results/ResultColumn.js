import React, { useContext } from 'react';

import GamesContext from '../../store/games-context';
import { INITIAL_SPLIT_INDEX, FINAL_SPLIT_INDEX } from '../../utils/constants';

import style from './result.module.css';

const Result = ({ selectedGame, includesHit, splitHit, clip, startSplit = 0, endSplit = 15 }) => {
  const gamesContext = useContext(GamesContext);
  const games = gamesContext.games;

  const resultStartSplit = startSplit === null ? INITIAL_SPLIT_INDEX : startSplit;
  const resultEndSplit = endSplit === null ? (FINAL_SPLIT_INDEX + 1) : endSplit;
  const selectedGameObject = games[selectedGame];
  const renderSplits = () => {
    const splitsOrdered = selectedGameObject?.splits?.sort((split1, split2) => (split1.order - split2.order));
    let splitHitObject = {};
    let splitHitOrder;
    if(splitHit >= 0) {
      splitHitObject = splitsOrdered.find(split => split.id === splitHit);
      splitHitOrder = splitHitObject.order;
    }
    return (splitsOrdered?.map(split => {
      let className;
      
      if (includesHit) {
        if (split.order < splitHitOrder && split.id >= resultStartSplit && split.id <= resultEndSplit) {
          className = 'success';
        } else if (split.order === splitHitOrder) {
          className = 'hit';
        }
      } else {
        if (split.id >= resultStartSplit && split.id < resultEndSplit) {
          className = 'success';
        }
      }
      return (
        <div className={style.row}>
          <div className={`${style.cell} ${style[className]}`}>
            {split.name}
          </div>
        </div>
      );
    }));
  };

  const renderClip = (gameClassName) => {
    if (clip) {
      return (<a href={clip} target={'_blank'} rel={'noreferrer'} className={style[gameClassName]}>Clip</a>);
    }
    return '-';
  }

  const renderGame = () => {
    const isParcial = resultEndSplit < FINAL_SPLIT_INDEX;
    const gameClassName = includesHit ? 'fail' : !isParcial ? 'success' : null;
    return (
      <div className={`${style.run} ${style.column}`}>
        <div className={style.header}>
          <div className={`${style.cell} ${style[gameClassName]}`}>{selectedGameObject?.name}</div>
        </div>
        {renderSplits()}
        <div className={`${style.row} ${style.clip}`}><div className={style.cell}> {renderClip(gameClassName)}</div></div>
      </div>
    )
  }

  return renderGame();
};
export default Result;
