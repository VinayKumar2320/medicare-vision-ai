import React, { CSSProperties } from 'react';
import { styles } from '../styles';

export const DashboardCard = ({ title, children, style = {} }: { title: string; children?: React.ReactNode; style?: CSSProperties }) => (
  <div style={{ ...styles.card, ...style }}>
    <h3 style={styles.cardTitle}>{title}</h3>
    <div style={styles.cardContent}>{children}</div>
  </div>
);

