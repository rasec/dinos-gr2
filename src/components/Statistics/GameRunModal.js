import React from 'react';
import { Modal } from '@material-ui/core';

import styles from './statistics.components.module.scss';

function GameRunModal({runs, displayText, onClose, type }) {
  const extraText = type === 'hits' ? 'Hits' : 'Runs';
  return (
    <Modal open onClose={() => onClose([])} className={styles.hitClipsContainer}>
      <div className={styles.content}>
        <h3>{displayText} {extraText}:</h3>
        <ul>
          {(runs.map(succeedGameRun =>
          (
            <li key={JSON.stringify(succeedGameRun)}>
              {succeedGameRun.date}: <a href={succeedGameRun.clip}>{succeedGameRun.clip}</a>
            </li>
          )
          ))}
        </ul>
      </div>
    </Modal>
  );
}

export default GameRunModal;