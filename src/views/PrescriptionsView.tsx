import React, { useState } from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { formatDateTime } from '../utils/helpers';
import { PrescriptionService } from '../services/prescriptionService';
import { styles } from '../styles';
import type { Prescription } from '../types';

export const PrescriptionsView = ({ prescriptions, onAddPrescription, onPrescriptionAdded }: {
  prescriptions: Prescription[];
  onAddPrescription: (prescription: { name: string; dosage: string; frequency: string }) => void;
  onPrescriptionAdded?: () => void;
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && dosage && frequency) {
      onAddPrescription({ name, dosage, frequency });
      setName('');
      setDosage('');
      setFrequency('');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage({
          file: file,
          preview: event.target?.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPrescription = async () => {
    if (!uploadedImage?.file) {
      setUploadStatus('Please select an image first');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Processing prescription image...');
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setUploadStatus('Authentication required');
        setIsUploading(false);
        return;
      }

      const result = await PrescriptionService.uploadPrescriptionImage(token, uploadedImage.file);
      
      // Reload prescriptions to get the latest data from database
      if (onPrescriptionAdded) {
        onPrescriptionAdded();
      }
      
      // Pre-fill the form with extracted data
      setName(result.medicationName || '');
      setDosage(result.dosage || '');
      setFrequency(result.frequency || '');
      
      // Show detailed extraction results
      let statusMessage = `✅ Successfully processed prescription image!\n\n`;
      statusMessage += `📋 Extracted Data:\n`;
      statusMessage += `   Medication: ${result.medicationName || 'Not found'}\n`;
      statusMessage += `   Dosage: ${result.dosage || 'Not found'}\n`;
      statusMessage += `   Frequency: ${result.frequency || 'Not found'}\n`;
      statusMessage += `   Morning: ${result.Morning} tablet(s)\n`;
      statusMessage += `   Evening: ${result.Evening} tablet(s)\n`;
      statusMessage += `   Night: ${result.Night} tablet(s)\n`;
      if (result.doctorName) statusMessage += `   Doctor: ${result.doctorName}\n`;
      if (result.prescriptionDate) statusMessage += `   Date: ${result.prescriptionDate}\n`;
      
      if (result.extractedText && result.extractedText.length > 0) {
        statusMessage += `\n📄 OCR Text extracted (${result.extractedText.length} characters)`;
        statusMessage += `\n\n💡 Tip: If data is missing, check if your prescription format matches the expected format.`;
      } else {
        statusMessage += `\n⚠️ Warning: No text was extracted from the image.`;
        statusMessage += `\n   - Make sure the image is clear and well-lit`;
        statusMessage += `\n   - Try a higher resolution image`;
        statusMessage += `\n   - Ensure text is readable`;
      }
      
      setUploadStatus(statusMessage);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setUploadedImage(null);
        setShowUpload(false);
        setUploadStatus('');
      }, 3000);
    } catch (error: any) {
      setUploadStatus(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={styles.viewContainer}>
      <DashboardCard title="Add Prescription">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <button 
            onClick={() => setShowUpload(!showUpload)} 
            style={{...styles.actionButton, flex: 1, backgroundColor: showUpload ? '#4CAF50' : '#2196F3'}}
          >
            {showUpload ? '📷 Upload Doctor\'s Prescription' : '📝 Manual Entry'}
          </button>
        </div>

        {showUpload ? (
          <div style={styles.prescriptionForm}>
            <div style={{ border: '2px dashed #2196F3', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageSelect}
                id="prescriptionUpload"
                style={{ display: 'none' }}
              />
              <label 
                htmlFor="prescriptionUpload"
                style={{ cursor: 'pointer', display: 'block' }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📸</div>
                <div>Click to select a prescription image</div>
                <div style={{ fontSize: '12px', color: '#666' }}>(JPG or PNG)</div>
              </label>
            </div>

            {uploadedImage?.preview && (
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <img src={uploadedImage.preview} style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} alt="Preview" />
                <button 
                  onClick={handleUploadPrescription}
                  disabled={isUploading}
                  style={{...styles.actionButton, marginTop: '12px', opacity: isUploading ? 0.6 : 1}}
                >
                  {isUploading ? '🔄 Processing...' : '✓ Extract & Process'}
                </button>
              </div>
            )}

            {uploadStatus && (
              <div style={{ marginTop: '12px', padding: '12px', backgroundColor: uploadStatus.includes('Error') ? '#ffebee' : '#e8f5e9', borderRadius: '8px', fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                {uploadStatus}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.prescriptionForm}>
            <input type="text" placeholder="Medication Name" value={name} onChange={e => setName(e.target.value)} style={styles.input} required />
            <input type="text" placeholder="Dosage (e.g., 10mg)" value={dosage} onChange={e => setDosage(e.target.value)} style={styles.input} required />
            <input type="text" placeholder="Frequency (e.g., Once a day)" value={frequency} onChange={e => setFrequency(e.target.value)} style={styles.input} required />
            <button type="submit" style={styles.actionButton}>Add Prescription</button>
          </form>
        )}
      </DashboardCard>
      <DashboardCard title="Current Prescriptions" style={{marginTop: 24}}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Medication</th>
              <th style={styles.th}>Dosage</th>
              <th style={styles.th}>Frequency</th>
              <th style={styles.th}>Last Taken</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map(p => (
              <tr key={p.id}>
                <td style={styles.td}>{p.name}</td>
                <td style={styles.td}>{p.dosage}</td>
                <td style={styles.td}>{p.frequency}</td>
                <td style={styles.td}>{formatDateTime(p.lastTaken)}</td>
              </tr>
            ))}
            {prescriptions.length === 0 && (
              <tr>
                <td colSpan={4} style={{...styles.td, textAlign: 'center', fontStyle: 'italic'}}>No prescriptions added yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </DashboardCard>
    </div>
  );
};

