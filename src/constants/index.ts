export const MONITORING_INTERVAL = 4000; // 4 seconds
export const MOCK_HEALTH_CONDITIONS = "High blood pressure and Type 2 Diabetes";

// API Base URL - use environment variable or fallback to localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const UI_COLORS = {
  primary: '#007bff',
  secondary: '#6c757d',
  background: '#f0f2f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#17a2b8',
  success: '#28a745',
  warning: '#ffc107',
  danger: '#dc3545',
  border: '#dee2e6'
};

