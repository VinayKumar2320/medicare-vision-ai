import React from 'react';
import { DashboardIcon, MonitorIcon, MealIcon, PrescriptionIcon, GuardianIcon, AssistantIcon, BloodReportIcon } from './Icons';
import { UI_COLORS } from '../constants';
import { styles } from '../styles';
import type { View } from '../types';

export const Sidebar = ({ currentView, setView }: { currentView: View; setView: (view: View) => void }) => {
  const NavItem = ({ view, label, icon }: { view: View; label: string; icon: React.ReactNode }) => (
    <button
      style={{
        ...styles.navItem,
        ...(currentView === view ? styles.navItemActive : {})
      }}
      onClick={() => setView(view)}
      aria-current={currentView === view}
    >
      {icon}
      <span style={styles.navItemLabel}>{label}</span>
    </button>
  );

  return (
    <nav style={styles.sidebar}>
      <NavItem view="DASHBOARD" label="Dashboard" icon={<DashboardIcon />} />
      <NavItem view="MONITORING" label="Live Monitoring" icon={<MonitorIcon />} />
      <NavItem view="MEAL_PLAN" label="Meal Planner" icon={<MealIcon />} />
      <NavItem view="PRESCRIPTIONS" label="Prescriptions" icon={<PrescriptionIcon />} />
      <NavItem view="GUARDIAN" label="Guardian Details" icon={<GuardianIcon />} />
      <NavItem view="BLOOD_REPORTS" label="Blood Reports" icon={<BloodReportIcon />} />
      <NavItem view="VOICE_ASSISTANT" label="Voice Assistant" icon={<AssistantIcon />} />
    </nav>
  );
};

