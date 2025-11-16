import React from 'react';

const Icon = ({ path, size = 24, color = 'currentColor' }: { path: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path}></path>
  </svg>
);

export const DashboardIcon = () => <Icon path="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />;
export const MonitorIcon = () => <Icon path="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />;
export const MealIcon = () => <Icon path="M12 22a10 10 0 0 0 10-10H2a10 10 0 0 0 10 10z M12 2a4 4 0 0 0-4 4h8a4 4 0 0 0-4-4z M2 12h20" />;
export const PrescriptionIcon = () => <Icon path="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M12 18v-6 M9 15h6" />;
export const GuardianIcon = () => <Icon path="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
export const MicIcon = ({ active }: { active: boolean }) => <Icon path="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4 M8 23h8" color={active ? '#dc3545' : 'currentColor'} />;
export const PillIcon = () => <Icon path="M12 2a8 8 0 0 0-8 8v0a8 8 0 0 0 8 8h0a8 8 0 0 0 8-8v0a8 8 0 0 0-8-8z M12 4a6 6 0 0 1 6 6h-6V4z" />;
export const AlertIcon = () => <Icon path="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01" />;
export const SpeakerIcon = () => <Icon path="M11 5L6 9H2v6h4l5 4V5z M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />;
export const AssistantIcon = () => <Icon path="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z M13 8H7 M17 12H7" />;
export const BloodReportIcon = () => <Icon path="M9 11a3 3 0 1 0 6 0 3 3 0 0 0-6 0z M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />;

