import React from 'react';
import { styles } from '../styles';

export const Modal = ({ show, onClose, title, children }: { show: boolean; onClose: () => void; title: string; children?: React.ReactNode }) => {
  if (!show) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h2>{title}</h2>
          <button onClick={onClose} style={styles.modalCloseButton}>&times;</button>
        </div>
        <div style={styles.modalBody}>
          {children}
        </div>
      </div>
    </div>
  );
};

