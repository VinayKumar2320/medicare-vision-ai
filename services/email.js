import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Create SMTP transporter
const createTransporter = () => {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

  if (!smtpUser || !smtpPassword) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });
};

export async function sendEmail(toEmail, subject, textBody, htmlBody) {
  // Try Resend first (recommended - easier and more reliable)
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      
      const { data, error } = await resend.emails.send({
        from: `Medicare Vision AI <${fromEmail}>`,
        to: [toEmail],
        subject: subject,
        text: textBody,
        html: htmlBody || textBody.replace(/\n/g, '<br>'),
      });

      if (error) {
        // Check if it's the "only send to your own email" limitation
        if (error.message && error.message.includes('only send testing emails to your own email')) {
          const verifiedEmail = error.message.match(/\(([^)]+)\)/)?.[1] || 'your verified email';
          throw new Error(`Resend free tier limitation: You can only send to ${verifiedEmail}. For production, verify a domain at resend.com/domains or use SMTP.`);
        }
        throw new Error(error.message || 'Resend API error');
      }

      console.log('Email sent successfully via Resend:', data?.id);
      return { 
        success: true, 
        data: { messageId: data?.id, method: 'Resend' } 
      };
    } catch (resendError) {
      // If it's the "own email" limitation, don't fall back - return clear error
      if (resendError.message && resendError.message.includes('Resend free tier limitation')) {
        console.warn('Resend limitation:', resendError.message);
        return { 
          success: false, 
          error: resendError.message,
          suggestion: 'For sending to guardians, either verify a domain at resend.com/domains or configure SMTP in .env.local'
        };
      }
      console.warn('Resend failed, falling back to SMTP:', resendError.message);
      // Fall through to SMTP
    }
  }

  // Fallback to SMTP
  const transporter = createTransporter();
  
  if (!transporter) {
    return { 
      success: false, 
      error: 'No email service configured. Please set either RESEND_API_KEY or SMTP_USER/SMTP_PASSWORD in .env.local' 
    };
  }

  const smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@medicarevisionai.com';

  const mailOptions = {
    from: `"Medicare Vision AI" <${smtpFrom}>`,
    to: toEmail,
    subject: subject,
    text: textBody,
    html: htmlBody || textBody.replace(/\n/g, '<br>'),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully via SMTP:', info.messageId);
    return { 
      success: true, 
      data: { messageId: info.messageId, method: 'SMTP' } 
    };
  } catch (error) {
    console.error('SMTP error:', error);
    return {
      success: false,
      error: `Failed to send email: ${error.message || 'Unknown error occurred'}`
    };
  }
}

