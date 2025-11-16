export const formatDate = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

export const formatDateTime = (date: Date | null) => {
  if (!date) return 'Not taken yet';
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

