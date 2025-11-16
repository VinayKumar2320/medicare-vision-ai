import React, { useState, useEffect } from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { UI_COLORS } from '../constants';
import { styles } from '../styles';

export const GuardianView = ({ email, onSaveEmail, onTestEmail }: {
  email: string;
  onSaveEmail: (email: string) => void;
  onTestEmail?: (email: string) => Promise<void>;
}) => {
  const [currentEmail, setCurrentEmail] = useState(email || '');
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  useEffect(() => {
    setCurrentEmail(email || '');
  }, [email]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveEmail(currentEmail);
  };

  const handleTestEmail = async () => {
    if (!currentEmail) {
      alert('Please enter and save a guardian email first.');
      return;
    }
    setIsTestingEmail(true);
    if (onTestEmail) {
      await onTestEmail(currentEmail);
    }
    setIsTestingEmail(false);
  };

  return (
    <div style={styles.viewContainer}>
      <DashboardCard title="Guardian Contact Information">
        <p style={styles.cardContent}>
          Set the email address of a guardian or caretaker. They will <strong>automatically receive email notifications via SMTP</strong> when:
        </p>
        <ul style={{...styles.cardContent, marginLeft: 20, marginTop: 10, marginBottom: 20}}>
          <li>An unverified medication is detected</li>
          <li>Critical health alerts occur</li>
        </ul>
        {currentEmail && (
          <div style={{...styles.cardContent, padding: '12px', backgroundColor: UI_COLORS.background, borderRadius: 4, marginBottom: 16}}>
            <strong>Current Guardian Email:</strong> {currentEmail}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{...styles.prescriptionForm, marginTop: 20}}>
          <input 
            type="email" 
            placeholder="Guardian's Email Address" 
            value={currentEmail} 
            onChange={e => setCurrentEmail(e.target.value)} 
            style={{...styles.input, flex: '1 1 300px'}} 
            required 
          />
          <button type="submit" style={styles.actionButton}>Save Email</button>
        </form>
        {currentEmail && (
          <div style={{marginTop: 20, paddingTop: 20, borderTop: `1px solid ${UI_COLORS.border}`}}>
            <button 
              onClick={handleTestEmail} 
              disabled={isTestingEmail}
              style={{
                ...styles.actionButton, 
                backgroundColor: UI_COLORS.accent,
                opacity: isTestingEmail ? 0.6 : 1
              }}
            >
              {isTestingEmail ? 'Sending Test Email...' : 'Send Test Email'}
            </button>
            <p style={{...styles.cardContent, marginTop: 10, fontSize: '0.9rem'}}>
              Click to send a test email and verify email integration is working.
            </p>
            <div style={{...styles.cardContent, marginTop: 15, padding: '12px', backgroundColor: '#d1ecf1', borderRadius: 4, border: '1px solid #17a2b8', fontSize: '0.85rem'}}>
              <strong>ℹ️ Email Setup:</strong>
              <ul style={{marginTop: 8, marginBottom: 0, paddingLeft: 20}}>
                <li><strong>Resend with Domain (Recommended):</strong> 
                  <ol style={{marginTop: 4, marginBottom: 4, paddingLeft: 20}}>
                    <li>Verify domain at <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer">resend.com/domains</a></li>
                    <li>Add DNS records to your domain</li>
                    <li>Set <code>RESEND_FROM_EMAIL=noreply@yourdomain.com</code> in <code>.env.local</code></li>
                    <li>Then you can send to any email address!</li>
                  </ol>
                </li>
                <li><strong>SMTP (Alternative):</strong> Set <code>SMTP_USER</code> and <code>SMTP_PASSWORD</code> in <code>.env.local</code></li>
                <li>For Gmail SMTP: Use <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer">App Password</a></li>
              </ul>
              <p style={{marginTop: 10, marginBottom: 0, fontSize: '0.8rem', fontStyle: 'italic'}}>
                💡 See <code>RESEND_DOMAIN_SETUP.md</code> for detailed domain verification steps
              </p>
            </div>
          </div>
        )}
      </DashboardCard>
    </div>
  );
};

