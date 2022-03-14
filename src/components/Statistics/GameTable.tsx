import React from 'react';
import T from 'prop-types';
import Split, { SplitHit } from '../../types/split';
import Run from '../../types/run';

import styles from './statistics.components.module.scss';

function GameTable({ gameShortName, logo, totalRuns = [], splits = [], onSplitHitClick }: { gameShortName: string, logo: string, totalRuns: Run[], splits: Split[], onSplitHitClick: any }) {
  /** TODO: check if a type fits here */
  const displayRow = ({ splitId, splitName, splitHits, totalHits }: { splitId: number, splitName: string, splitHits: SplitHit[], totalHits: number}) => {
    const hasHit = (totalHits > 0);
    return (
      <tr className={`${styles.row} ${hasHit ? styles.hit : ''}`} key={splitId} onClick={() => {
        if (hasHit) onSplitHitClick(splitHits)
      }}>
        <td className={`${styles.td} ${styles.split}`}>{splitName}</td>
        <td className={`${styles.td} ${styles.accumulator}`}>{totalHits}</td>
      </tr>
    )
  }
  const displayRowPerSplit = (totalRuns : Run[], splits: Split[]) => {
    return splits.map(split => {
      let totalHits = 0;
      let splitHits = [] as SplitHit[];
      const {name: splitName, id: splitId } = split;
      totalRuns.forEach(run => {
        if (split.id === run.splitHit) {
          totalHits += 1;
          splitHits.push({ name: split.name, clip: run.clip, date: run.date });
        }
      });
      return displayRow({ splitId, splitName, splitHits, totalHits });
    });
  };
  return (
    <table className={styles.table}>
      <thead><tr><th className={styles.logoContainer}><img className={styles.logo} src={logo} alt={gameShortName} /></th></tr></thead>
      <tbody>
        {displayRowPerSplit(totalRuns, splits)}
      </tbody>
    </table>
  );
};

GameTable.propTypes = {
  gameShortName: T.string,
  logo: T.string,
  onSplitHitClick: T.func,
  splits: T.array,
  totalRuns: T.array
};

export default GameTable;