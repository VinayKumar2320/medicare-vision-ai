import express from 'express';
import { sendEmail } from '../services/email.js';

const router = express.Router();

// Email sending endpoint - Uses Resend (recommended) or SMTP as fallback
router.post('/send-email', async (req, res) => {
  try {
    const { toEmail, subject, textBody, htmlBody } = req.body;

    if (!toEmail || !subject || !textBody) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: toEmail, subject, textBody' 
      });
    }

    const result = await sendEmail(toEmail, subject, textBody, htmlBody);
    
    if (result.success) {
      return res.json(result);
    } else {
      // Check if it's the "own email" limitation
      if (result.error && result.error.includes('Resend free tier limitation')) {
        return res.status(400).json({ 
          success: false, 
          error: result.error,
          suggestion: result.suggestion || 'For sending to guardians, either verify a domain at resend.com/domains or configure SMTP in .env.local'
        });
      }
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error('Email error:', error);
    const errorMessage = error.message || 'Unknown error occurred';
    res.status(500).json({ 
      success: false, 
      error: `Failed to send email: ${errorMessage}` 
    });
  }
});

export default router;

