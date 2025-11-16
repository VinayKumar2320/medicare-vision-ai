import React, { useState, useRef } from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { styles } from '../styles';
import { UI_COLORS } from '../constants';
import { BloodReportService } from '../services/bloodReportService';
import type { BloodReport } from '../types';

export const BloodReportsView = ({ 
  bloodReports, 
  onBloodReportsUpdated,
  token
}: { 
  bloodReports: BloodReport[];
  onBloodReportsUpdated: () => void;
  token: string;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if token exists
    if (!token) {
      setUploadStatus('Error: You are not logged in. Please refresh the page and log in again.');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus('Error: Please upload a JPEG, PNG image or PDF file.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading and processing blood report...');

    try {
      console.log('📋 Starting blood report upload...');
      const result = await BloodReportService.uploadBloodReport(token, file);
      
      if (result.reports && result.reports.length > 0) {
        const testsCount = result.testsFound || result.reports.length;
        setUploadStatus(
          `✅ Successfully uploaded blood report! ` +
          `Extracted ${testsCount} test result${testsCount > 1 ? 's' : ''}. ` +
          (result.ocrAvailable 
            ? 'OCR extraction completed successfully.' 
            : 'File uploaded but OCR extraction was not available.')
        );
        
        // Reload blood reports
        if (onBloodReportsUpdated) {
          onBloodReportsUpdated();
        }
      } else {
        setUploadStatus('✅ File uploaded successfully, but no test results were automatically extracted. The file has been saved.');
        if (onBloodReportsUpdated) {
          onBloodReportsUpdated();
        }
      }
    } catch (error: any) {
      setUploadStatus(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this blood report?')) return;

    try {
      await BloodReportService.deleteBloodReport(token, reportId);
      if (onBloodReportsUpdated) {
        onBloodReportsUpdated();
      }
    } catch (error: any) {
      alert(`Error deleting report: ${error.message}`);
    }
  };

  return (
    <div style={styles.viewContainer}>
      <DashboardCard title="Blood Reports" style={styles.fullWidthCard}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginTop: 0 }}>Upload Blood Report</h3>
          <p style={{ color: UI_COLORS.textSecondary, marginBottom: '16px' }}>
            Upload a photo or PDF of your blood test report. The system will automatically extract test results using OCR.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            onChange={handleFileSelect}
            disabled={isUploading}
            style={{ display: 'none' }}
            id="blood-report-upload"
          />
          <label
            htmlFor="blood-report-upload"
            style={{
              ...styles.actionButton,
              display: 'inline-block',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              opacity: isUploading ? 0.6 : 1
            }}
          >
            {isUploading ? 'Uploading...' : 'Choose Blood Report File'}
          </label>
          {uploadStatus && (
            <p style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: uploadStatus.includes('Error') ? '#f8d7da' : '#d4edda',
              border: `1px solid ${uploadStatus.includes('Error') ? UI_COLORS.danger : UI_COLORS.success}`,
              borderRadius: '4px',
              color: uploadStatus.includes('Error') ? UI_COLORS.danger : UI_COLORS.text
            }}>
              {uploadStatus}
            </p>
          )}
        </div>

        <div>
          <h3>Your Blood Reports</h3>
          {bloodReports.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${UI_COLORS.border}` }}>
                    <th style={{ ...styles.th, padding: '8px', textAlign: 'left' }}>Test Date</th>
                    <th style={{ ...styles.th, padding: '8px', textAlign: 'left' }}>Test Name</th>
                    <th style={{ ...styles.th, padding: '8px', textAlign: 'left' }}>Value</th>
                    <th style={{ ...styles.th, padding: '8px', textAlign: 'left' }}>Normal Range</th>
                    <th style={{ ...styles.th, padding: '8px', textAlign: 'left' }}>Status</th>
                    <th style={{ ...styles.th, padding: '8px', textAlign: 'left' }}>Document</th>
                    <th style={{ ...styles.th, padding: '8px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bloodReports.map((report) => (
                    <tr key={report.id} style={{ borderBottom: `1px solid ${UI_COLORS.border}` }}>
                      <td style={{ ...styles.td, padding: '8px' }}>
                        {new Date(report.testDate).toLocaleDateString()}
                      </td>
                      <td style={{ ...styles.td, padding: '8px' }}>{report.testName}</td>
                      <td style={{ ...styles.td, padding: '8px' }}>
                        {report.value} {report.unit}
                      </td>
                      <td style={{ ...styles.td, padding: '8px', fontSize: '0.85rem', color: UI_COLORS.textSecondary }}>
                        {report.normalRange || '-'}
                      </td>
                      <td style={{ 
                        ...styles.td, 
                        padding: '8px',
                        color: report.status === 'Normal' ? UI_COLORS.success :
                               report.status === 'Critical' ? UI_COLORS.danger :
                               report.status === 'High' || report.status === 'Low' ? UI_COLORS.warning :
                               UI_COLORS.text,
                        fontWeight: report.status !== 'Normal' ? 'bold' : 'normal'
                      }}>
                        {report.status}
                      </td>
                      <td style={{ ...styles.td, padding: '8px' }}>
                        {report.fileUrl ? (
                          <a 
                            href={`http://localhost:3001${report.fileUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: UI_COLORS.primary, textDecoration: 'none' }}
                          >
                            View Document
                          </a>
                        ) : '-'}
                      </td>
                      <td style={{ ...styles.td, padding: '8px' }}>
                        <button
                          onClick={() => handleDelete(report.id)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.85rem',
                            backgroundColor: UI_COLORS.danger,
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: UI_COLORS.textSecondary, fontStyle: 'italic', marginTop: '16px' }}>
              No blood reports uploaded yet. Upload your first blood test report above.
            </p>
          )}
        </div>
      </DashboardCard>
    </div>
  );
};

