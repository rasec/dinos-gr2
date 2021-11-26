import { Modal } from '@material-ui/core';

import Results from './Results';
import styles from './result.module.css';

function ResultModal({ runs, onClose, hasToShowResults }) {
  return (<div>
    <Modal
      open={hasToShowResults}
      onClose={onClose}
      className={styles.modal}
      closeAfterTransition
      BackdropProps={{
        timeout: 500,
      }}
    >
      <div className={styles.modalContent}>
        <Results runs={runs} />
      </div>
    </Modal>
  </div>);
}

export default ResultModal;
