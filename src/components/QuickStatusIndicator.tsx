import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './QuickStatusIndicator.module.css';

const QuickStatusIndicator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className={`${styles.statusIndicator} ${styles.loading}`}>
        <span className={styles.dot}></span>
        Checking...
      </div>
    );
  }

  return (
    <div className={`${styles.statusIndicator} ${user ? styles.connected : styles.offline}`}>
      <span className={styles.dot}></span>
      {user ? 'Connected' : 'Offline'}
    </div>
  );
};

export default QuickStatusIndicator;
