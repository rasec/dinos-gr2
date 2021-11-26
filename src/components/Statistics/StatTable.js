import styles from './statistics.components.module.scss';
import { successRunFilter, calculateSuccessRate } from '../../utils/utils';

function StatTable({ runsList, onClickHandler }) {

  const displayRunsAndPercentage = (successfulRuns, totalRuns) => {
    if (totalRuns.length === 0) {
      return '-';
    }
    return `${successfulRuns.length}/${totalRuns.length}(${calculateSuccessRate({ successfulRuns, totalRuns })}%)`;
  };
  return (
    <table className={`${styles.table} ${styles.stats}`}>
      <tbody>
        {runsList.map(runObject => {
          const successfulRuns = runObject.runs.filter(successRunFilter);
          return (
            <tr className={styles.row} onClick={() => onClickHandler(successfulRuns, runObject.displayText)}>
              <td className={`${styles.td} ${styles.run}`}>{runObject.displayText} Runs:</td>
              <td className={`${styles.td} ${styles.stat}`}>{displayRunsAndPercentage(successfulRuns, runObject.runs)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default StatTable;