import { supabase } from '@/integrations/supabase/client';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = async (emailData: EmailData): Promise<{ success: boolean; error?: string; messageId?: string }> => {
  try {
    // Use Gmail service for real email sending
    const gmailService = new GmailService({
      clientId: process.env.VITE_GMAIL_CLIENT_ID || '',
      clientSecret: process.env.VITE_GMAIL_CLIENT_SECRET || '',
      refreshToken: process.env.VITE_GMAIL_REFRESH_TOKEN || '',
    });

    // Initialize Gmail service if refresh token is available
    await gmailService.initialize();

    const result = await gmailService.sendEmail(emailData);
    
    // Also store in notifications for tracking
    await supabase.from('notifications').insert({
      user_id: await gmailService.getUserId(emailData.to),
      report_id: null,
      message: `Email sent via Gmail: ${emailData.subject}`,
      type: 'email_sent',
      is_read: false,
    } as any);

    return result;
  } catch (error: any) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

export const createWelcomeEmail = (userName: string, userEmail: string): EmailData => ({
  to: userEmail,
  subject: 'Welcome to RoadFix Buddy! 🛠️',
  from: 'support@roadfixbuddy.com',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to RoadFix Buddy</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛠️ Welcome to RoadFix Buddy!</h1>
          <p>Your account has been successfully created.</p>
        </div>
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          <p>Thank you for joining RoadFix Buddy! Your account is now ready to help you report and track road damage issues in your area.</p>
          <p>With RoadFix Buddy, you can:</p>
          <ul>
            <li>📸 Report road damage with AI-powered analysis</li>
            <li>📍 Track repair progress in real-time</li>
            <li>👥 Connect with professional repair workers</li>
            <li>📊 Monitor municipal response times</li>
          </ul>
          <a href="https://roadfixbuddy.com/dashboard" class="button">Go to Dashboard</a>
          <p>If you have any questions, reply to this email or contact our support team.</p>
        </div>
        <div class="footer">
          <p>Best regards,<br>The RoadFix Buddy Team</p>
          <p>📍 Making roads safer, one report at a time</p>
        </div>
      </div>
    </body>
    </html>
  `,
});

export const createReportStatusEmail = (userName: string, userEmail: string, reportTitle: string, status: string, reportIdString: string): EmailData => ({
  to: userEmail,
  subject: `RoadFix Report Update: ${reportTitle}`,
  from: 'updates@roadfixbuddy.com',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Report Status Update</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; margin: 10px 0; }
        .status-completed { background: #10b981; color: white; }
        .status-progress { background: #f59e0b; color: white; }
        .status-pending { background: #6b7280; color: white; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Report Status Update</h1>
          <p>Your report has been updated</p>
        </div>
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          <p>Your road damage report "<strong>${reportTitle}</strong>" status has been updated to:</p>
          <div class="status-badge ${status === 'Completed' ? 'status-completed' : status.includes('Progress') ? 'status-progress' : 'status-pending'}">
            ${status}
          </div>
          <a href="https://roadfixbuddy.com/reports/${reportIdString}" class="button">View Report Details</a>
          <p>You'll receive notifications as the repair progresses.</p>
        </div>
        <div class="footer">
          <p>Best regards,<br>The RoadFix Buddy Team</p>
          <p>📍 Keeping you informed about road repairs</p>
        </div>
      </div>
    </body>
    </html>
  `,
});

export const createWorkCompletionEmail = (userName: string, userEmail: string, reportTitle: string, completionTime: string, reportIdString: string): EmailData => ({
  to: userEmail,
  subject: `RoadFix Work Completed: ${reportTitle}`,
  from: 'completions@roadfixbuddy.com',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Work Completed</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .completion-box { background: #dcfce7; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Work Completed!</h1>
          <p>Your road damage report has been repaired</p>
        </div>
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          <p>Great news! Your road damage report "<strong>${reportTitle}</strong>" has been successfully completed and repaired.</p>
          <div class="completion-box">
            <h3>✅ Repair Completed</h3>
            <p><strong>Time taken:</strong> ${completionTime}</p>
            <p>The road is now safe for travel! Thank you for your patience.</p>
          </div>
          <a href="https://roadfixbuddy.com/reports/${reportIdString}" class="button">View Completion Details</a>
          <p>Your contribution helps make our roads safer for everyone.</p>
        </div>
        <div class="footer">
          <p>Best regards,<br>The RoadFix Buddy Team</p>
          <p>🛣️ Roads repaired, community served</p>
        </div>
      </div>
    </body>
    </html>
  `,
});

export const createMunicipalThankYouEmail = (municipalName: string, municipalEmail: string, reportCount: number, avgResponseTime: string): EmailData => ({
  to: municipalEmail,
  subject: `RoadFix Partnership Impact Report - ${reportCount} Reports Resolved`,
  from: 'partnerships@roadfixbuddy.com',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Municipal Partnership Report</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .stat-box { background: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: #10b981; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏛️️ Municipal Partnership Report</h1>
          <p>Your impact on road safety</p>
        </div>
        <div class="content">
          <p>Dear <strong>${municipalName}</strong> Team,</p>
          <p>Thank you for your partnership with RoadFix Buddy! Here's your impact report for this month:</p>
          <div class="stats">
            <div class="stat-box">
              <div class="stat-number">${reportCount}</div>
              <p>Reports Resolved</p>
            </div>
            <div class="stat-box">
              <div class="stat-number">${avgResponseTime}</div>
              <p>Avg Response Time</p>
            </div>
          </div>
          <p>Your quick response and efficient repairs have significantly improved road safety in your jurisdiction.</p>
          <a href="https://roadfixbuddy.com/municipal/dashboard" class="button">View Detailed Dashboard</a>
        </div>
        <div class="footer">
          <p>Best regards,<br>The RoadFix Buddy Team</p>
          <p>🤝 Building safer communities together</p>
        </div>
      </div>
    </body>
    </html>
  `,
});
