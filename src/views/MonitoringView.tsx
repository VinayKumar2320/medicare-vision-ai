import React from 'react';
import { PillIcon } from '../components/Icons';
import { formatDate } from '../utils/helpers';
import { UI_COLORS } from '../constants';
import { styles } from '../styles';
import type { Activity } from '../types';

export const MonitoringView = ({ activities, isMonitoring, onToggleMonitoring, onMedicationScan, videoRef }: {
  activities: Activity[];
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
  onMedicationScan: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}) => (
  <div style={styles.viewContainer}>
    <div style={styles.monitoringLayout}>
      <div style={styles.videoContainer}>
        <video ref={videoRef} style={styles.videoFeed} autoPlay muted playsInline></video>
        <div style={styles.monitoringControls}>
            <button onClick={onToggleMonitoring} style={{...styles.actionButton, backgroundColor: isMonitoring ? UI_COLORS.danger : UI_COLORS.success }}>
                {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </button>
            <button onClick={onMedicationScan} style={{...styles.actionButton, backgroundColor: UI_COLORS.primary}}>
                <PillIcon /> Scan Medication
            </button>
        </div>
      </div>
      <div style={styles.activityFeed}>
        <h3 style={styles.feedTitle}>Live Activity Feed</h3>
        <ul style={{...styles.logList, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto'}}>
          {activities.map(a => (
            <li key={a.id} style={{color: a.isAlert ? UI_COLORS.danger : UI_COLORS.text}}>
              <strong>{formatDate(a.timestamp)}:</strong> {a.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

