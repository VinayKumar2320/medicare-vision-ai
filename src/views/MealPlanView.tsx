import React, { useState, useRef } from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { styles } from '../styles';
import type { MealPlan } from '../types';

export const MealPlanView = ({ 
  mealPlan, 
  onGenerate, 
  onGenerateFromReport,
  isLoading,
  token 
}: {
  mealPlan: MealPlan | null;
  onGenerate: () => void;
  onGenerateFromReport: (file: File) => Promise<void>;
  isLoading: boolean;
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
    setUploadStatus('Uploading and analyzing patient report...');

    try {
      console.log('📋 Starting meal plan generation from patient report...');
      await onGenerateFromReport(file);
      setUploadStatus('✅ Meal plan generated successfully from your patient report!');
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

  return (
    <div style={styles.viewContainer}>
      <DashboardCard title="Today's Meal Plan" style={{maxWidth: 800, margin: 'auto'}}>
        <div style={{ marginBottom: 20 }}>
          <button 
            onClick={onGenerate} 
            disabled={isLoading || isUploading} 
            style={{...styles.actionButton, marginRight: 10, marginBottom: 10}}
          >
            {isLoading ? 'Generating...' : 'Generate Meal Plan (General)'}
          </button>
          
          <div style={{ marginTop: 15, padding: 15, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
            <h4 style={{ marginTop: 0, marginBottom: 10 }}>Generate from Patient Report</h4>
            <p style={{ marginBottom: 10, color: '#666', fontSize: '14px' }}>
              Upload a patient report (blood test, medical report, etc.) to generate a personalized meal plan based on your health conditions.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={handleFileSelect}
              disabled={isLoading || isUploading}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isUploading}
              style={{
                ...styles.actionButton,
                backgroundColor: '#4CAF50',
                marginBottom: 10
              }}
            >
              {isUploading ? 'Processing...' : '📄 Upload Patient Report'}
            </button>
            {uploadStatus && (
              <p style={{ 
                marginTop: 10, 
                padding: 10, 
                backgroundColor: uploadStatus.includes('Error') ? '#ffebee' : '#e8f5e9',
                color: uploadStatus.includes('Error') ? '#c62828' : '#2e7d32',
                borderRadius: 4,
                fontSize: '14px'
              }}>
                {uploadStatus}
              </p>
            )}
          </div>
        </div>

        {mealPlan ? (
          <div>
            <h4>Breakfast</h4>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{mealPlan.breakfast}</p>
            
            <h4>Lunch</h4>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{mealPlan.lunch}</p>
            
            <h4>Dinner</h4>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{mealPlan.dinner}</p>
            
            {mealPlan.snacks && (
              <>
                <h4>Snacks</h4>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{mealPlan.snacks}</p>
              </>
            )}
            
            <h4>Dietary Tips</h4>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{mealPlan.tips}</p>
          </div>
        ) : (
          <p>Click the button above to generate a meal plan. You can generate a general meal plan or upload a patient report for a personalized plan based on your health conditions.</p>
        )}
      </DashboardCard>
    </div>
  );
};

