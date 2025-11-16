export const EmailService = {
  sendEmail: async (toEmail: string, subject: string, textBody: string, htmlBody?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Use local proxy server to avoid CORS issues
      const proxyUrl = 'http://localhost:3001/api/send-email';
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toEmail,
          subject,
          textBody,
          htmlBody
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error("Email service error:", errorMessage);
        return { success: false, error: errorMessage };
      }

      const result = await response.json();
      console.log("Email sent successfully:", result);
      return { success: true };
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error occurred';
      console.error("Error sending email via SMTP:", error);
      
      // Check if it's a connection error (server not running)
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('ECONNREFUSED')) {
        return { 
          success: false, 
          error: 'Cannot connect to email server. Please make sure the proxy server is running (npm run dev:all)' 
        };
      }
      
      return { success: false, error: `Network error: ${errorMsg}` };
    }
  }
};

