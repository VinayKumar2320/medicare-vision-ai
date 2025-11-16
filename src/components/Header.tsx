import React from 'react';
import { MicIcon } from './Icons';
import { UI_COLORS } from '../constants';
import { styles } from '../styles';

export const Header = ({ onCommand, isListening, user, onLogout }: { onCommand: () => void; isListening: boolean; user?: any; onLogout?: () => void }) => (
  <header style={styles.header}>
    <h1 style={styles.headerTitle}>Medicare Vision AI</h1>
    <div style={styles.headerControls}>
      {user && (
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <p style={{margin: 0, fontSize: '0.9rem', color: UI_COLORS.textSecondary}}>
            Welcome, <strong>{user.name || user.email}</strong>
          </p>
          <button 
            onClick={onLogout} 
            style={{...styles.actionButton, padding: '8px 16px', fontSize: '0.85rem', backgroundColor: UI_COLORS.secondary}}
          >
            Logout
          </button>
        </div>
      )}
      <p style={{...styles.listeningStatus, color: isListening ? UI_COLORS.danger : UI_COLORS.textSecondary}}>
        {isListening ? "Listening..." : "Voice commands inactive"}
      </p>
      <button onClick={onCommand} style={styles.micButton} aria-label="Activate voice command">
        <MicIcon active={isListening} />
      </button>
    </div>
  </header>
);

