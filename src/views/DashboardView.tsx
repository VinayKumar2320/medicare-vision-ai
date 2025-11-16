import React from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { formatDate } from '../utils/helpers';
import { UI_COLORS } from '../constants';
import { styles } from '../styles';
import { SpeakerIcon } from '../components/Icons';
import type { Activity, MedicationLog, Symptom, Prescription, HealthIssue, BloodReport } from '../types';

export const DashboardView = ({ stats, activities, medicationLogs, symptoms, prescriptions, healthIssues, bloodReports, onSpeakTodayTablets }: {
  stats: { alertsToday: number; lastActivity: string; isMonitoring: boolean; todayTablets: number; todayMedications: Array<{ name: string; timing: string; count: number; taken?: boolean }> };
  activities: Activity[];
  medicationLogs: MedicationLog[];
  symptoms: Symptom[];
  prescriptions: Prescription[];
  healthIssues?: HealthIssue[];
  bloodReports?: BloodReport[];
  onSpeakTodayTablets?: () => void;
}) => {
  const medicationAdherence = medicationLogs.length > 0 ? (medicationLogs.filter(m => m.status === 'Verified').length / medicationLogs.length * 100).toFixed(0) : 100;
  
  // Debug: Log prescriptions data
  console.log('📊 DashboardView - Prescriptions data:', prescriptions);
  console.log('📊 DashboardView - Today\'s tablets stats:', stats);

  return (
    <div style={styles.viewContainer}>
      <div style={styles.grid}>
        <DashboardCard title="Medication Adherence" style={{ flex: '0 0 auto', minWidth: '150px' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: UI_COLORS.primary }}>{medicationAdherence}%</p>
        </DashboardCard>
        <DashboardCard title="Today's Tablets" style={{ flex: '1 1 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <p style={styles.statBig}>{stats.todayTablets}</p>
            {onSpeakTodayTablets && (
              <button
                onClick={onSpeakTodayTablets}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: UI_COLORS.primary,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = UI_COLORS.primary + '1A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Listen to today's medication summary"
              >
                <SpeakerIcon />
              </button>
            )}
          </div>
          {stats.todayMedications.length > 0 && (
            <div style={{ marginTop: '16px', fontSize: '1rem', color: UI_COLORS.text }}>
              {stats.todayMedications.map((med, idx) => (
                <div key={idx} style={{ 
                  marginTop: '8px', 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 0'
                }}>
                  <span style={{ 
                    fontSize: '1.2rem',
                    color: med.taken ? UI_COLORS.success : UI_COLORS.textSecondary,
                    fontWeight: med.taken ? 'bold' : 'normal',
                    minWidth: '24px'
                  }}>
                    {med.taken ? '✓' : '○'}
                  </span>
                  <span style={{
                    fontSize: '1rem',
                    textDecoration: med.taken ? 'line-through' : 'none',
                    opacity: med.taken ? 0.7 : 1,
                    color: UI_COLORS.text
                  }}>
                    {med.count}x {med.name} ({med.timing})
                  </span>
                </div>
              ))}
            </div>
          )}
          {stats.todayTablets === 0 && (
            <p style={{ marginTop: '8px', fontSize: '0.85rem', color: UI_COLORS.textSecondary, fontStyle: 'italic' }}>
              No tablets scheduled for today
            </p>
          )}
        </DashboardCard>
        <DashboardCard title="Last Activity">
          <p style={styles.statSmall}>{stats.lastActivity}</p>
        </DashboardCard>
        <DashboardCard title="Monitoring Status">
          <p style={{...styles.statSmall, color: stats.isMonitoring ? UI_COLORS.success : UI_COLORS.danger}}>
            {stats.isMonitoring ? 'ACTIVE' : 'INACTIVE'}
          </p>
        </DashboardCard>
      </div>
      <div style={styles.grid}>
        <DashboardCard title="Recent Activity" style={styles.fullWidthCard}>
          <ul style={styles.logList}>
            {activities.slice(0, 5).map(a => <li key={a.id}><strong>{formatDate(a.timestamp)}:</strong> {a.description}</li>)}
          </ul>
        </DashboardCard>
        <DashboardCard title="Medication Log" style={styles.fullWidthCard}>
           <ul style={styles.logList}>
            {medicationLogs.slice(0, 5).map(m => <li key={m.id}><strong>{formatDate(m.timestamp)}:</strong> {m.medication} - <span style={{color: m.status === 'Verified' ? UI_COLORS.success : UI_COLORS.danger}}>{m.status}</span></li>)}
          </ul>
        </DashboardCard>
        <DashboardCard title="Symptom Log" style={styles.fullWidthCard}>
           <ul style={styles.logList}>
            {symptoms.slice(0, 5).map(s => <li key={s.id} style={{color: s.severity === 'Urgent' ? UI_COLORS.danger : s.severity === 'Medium' ? UI_COLORS.warning : UI_COLORS.text}}><strong>{formatDate(s.timestamp)}:</strong> {s.description} ({s.severity})</li>)}
          </ul>
        </DashboardCard>
      </div>
      <div style={styles.grid}>
        <DashboardCard title="Health Issues" style={styles.fullWidthCard}>
          {healthIssues && healthIssues.length > 0 ? (
            <div>
              {healthIssues.map((issue) => (
                <div key={issue.id} style={{
                  padding: '12px',
                  marginBottom: '12px',
                  backgroundColor: UI_COLORS.background,
                  borderRadius: '8px',
                  borderLeft: `4px solid ${
                    issue.severity === 'High' ? UI_COLORS.danger :
                    issue.severity === 'Medium' ? UI_COLORS.warning :
                    UI_COLORS.primary
                  }`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', color: UI_COLORS.text, fontSize: '1rem' }}>
                        {issue.name}
                      </h4>
                      {issue.description && (
                        <p style={{ margin: '4px 0', fontSize: '0.9rem', color: UI_COLORS.textSecondary }}>
                          {issue.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.85rem', color: UI_COLORS.textSecondary }}>
                        {issue.diagnosedDate && (
                          <span>Diagnosed: {issue.diagnosedDate}</span>
                        )}
                        {issue.severity && (
                          <span style={{
                            color: issue.severity === 'High' ? UI_COLORS.danger :
                                   issue.severity === 'Medium' ? UI_COLORS.warning :
                                   UI_COLORS.text
                          }}>
                            Severity: {issue.severity}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: UI_COLORS.textSecondary, fontStyle: 'italic' }}>
              No health issues recorded. Contact your doctor to add your health conditions.
            </p>
          )}
        </DashboardCard>
        <DashboardCard title="Blood Report Summary" style={styles.fullWidthCard}>
          {bloodReports && bloodReports.length > 0 ? (() => {
            // Calculate summary statistics
            const totalTests = bloodReports.length;
            const abnormalTests = bloodReports.filter(r => r.status !== 'Normal').length;
            const criticalTests = bloodReports.filter(r => r.status === 'Critical').length;
            const latestTestDate = bloodReports.length > 0 
              ? new Date(Math.max(...bloodReports.map(r => new Date(r.testDate).getTime())))
              : null;
            
            // Get latest results (group by test name, get most recent)
            const latestResults = bloodReports
              .sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime())
              .reduce((acc, report) => {
                if (!acc[report.testName] || new Date(report.testDate) > new Date(acc[report.testName].testDate)) {
                  acc[report.testName] = report;
                }
                return acc;
              }, {} as Record<string, BloodReport>);
            
            const latestResultsList = Object.values(latestResults)
              .sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime())
              .slice(0, 6); // Show top 6 latest unique tests

            return (
              <div>
                {/* Summary Statistics */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                  gap: '12px', 
                  marginBottom: '20px',
                  padding: '12px',
                  backgroundColor: UI_COLORS.background,
                  borderRadius: '8px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: UI_COLORS.primary }}>
                      {totalTests}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: UI_COLORS.textSecondary, marginTop: '4px' }}>
                      Total Tests
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold', 
                      color: abnormalTests > 0 ? UI_COLORS.warning : UI_COLORS.success 
                    }}>
                      {abnormalTests}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: UI_COLORS.textSecondary, marginTop: '4px' }}>
                      Abnormal
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold', 
                      color: criticalTests > 0 ? UI_COLORS.danger : UI_COLORS.text 
                    }}>
                      {criticalTests}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: UI_COLORS.textSecondary, marginTop: '4px' }}>
                      Critical
                    </div>
                  </div>
                  {latestTestDate && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: UI_COLORS.text }}>
                        {latestTestDate.toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: UI_COLORS.textSecondary, marginTop: '4px' }}>
                        Latest Test
                      </div>
                    </div>
                  )}
                </div>

                {/* Latest Test Results - Condensed View */}
                <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: UI_COLORS.textSecondary, fontWeight: '500' }}>
                  Latest Test Results
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {latestResultsList.map((report) => (
                    <div 
                      key={report.id} 
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        backgroundColor: report.status !== 'Normal' 
                          ? (report.status === 'Critical' ? UI_COLORS.danger + '15' : UI_COLORS.warning + '15')
                          : UI_COLORS.background,
                        borderRadius: '6px',
                        borderLeft: `3px solid ${
                          report.status === 'Normal' ? UI_COLORS.success :
                          report.status === 'Critical' ? UI_COLORS.danger :
                          report.status === 'High' || report.status === 'Low' ? UI_COLORS.warning :
                          UI_COLORS.border
                        }`
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: '0.9rem', 
                          fontWeight: '500', 
                          color: UI_COLORS.text,
                          marginBottom: '2px'
                        }}>
                          {report.testName}
                        </div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: UI_COLORS.textSecondary 
                        }}>
                          {new Date(report.testDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', marginRight: '12px' }}>
                        <div style={{ 
                          fontSize: '0.95rem', 
                          fontWeight: '600',
                          color: UI_COLORS.text
                        }}>
                          {report.value} {report.unit}
                        </div>
                        {report.normalRange && (
                          <div style={{ 
                            fontSize: '0.7rem', 
                            color: UI_COLORS.textSecondary 
                          }}>
                            ({report.normalRange})
                          </div>
                        )}
                      </div>
                      <div style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: report.status === 'Normal' ? UI_COLORS.success + '20' :
                                       report.status === 'Critical' ? UI_COLORS.danger + '20' :
                                       UI_COLORS.warning + '20',
                        color: report.status === 'Normal' ? UI_COLORS.success :
                               report.status === 'Critical' ? UI_COLORS.danger :
                               UI_COLORS.warning,
                        minWidth: '60px',
                        textAlign: 'center'
                      }}>
                        {report.status}
                      </div>
                    </div>
                  ))}
                </div>
                {bloodReports.length > 6 && (
                  <div style={{ 
                    marginTop: '12px', 
                    fontSize: '0.85rem', 
                    color: UI_COLORS.primary,
                    textAlign: 'center',
                    fontStyle: 'italic'
                  }}>
                    +{bloodReports.length - 6} more test results available
                  </div>
                )}
              </div>
            );
          })() : (
            <p style={{ color: UI_COLORS.textSecondary, fontStyle: 'italic' }}>
              No blood reports available. Upload your latest blood test results to see them here.
            </p>
          )}
        </DashboardCard>
      </div>
    </div>
  );
};

