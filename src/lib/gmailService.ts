// Gmail API integration for RoadFix Buddy
// This service uses Gmail's REST API to send real emails

import { supabase } from '@/integrations/supabase/client';

interface GmailConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

interface GmailEmail {
  to: string;
  subject: string;
  htmlBody: string;
  threadId?: string;
}

interface GmailResponse {
  id: string;
}

class GmailService {
  private config: GmailConfig;
  private accessToken: string | null = null;

  constructor(config: GmailConfig) {
    this.config = config;
  }

  // Exchange authorization code for access token
  private async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:8084/auth/callback',
      }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(`OAuth error: ${data.error}`);
    }

    return data.access_token;
  }

  // Send email using Gmail API
  async sendEmail(email: GmailEmail): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      // Ensure we have a valid access token
      if (!this.accessToken) {
        throw new Error('No access token available. Please authenticate first.');
      }

      const rawEmail = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId: email.threadId || undefined,
          to: email.to,
          subject: email.subject,
          htmlBody: email.htmlBody,
        }),
      });

      const response = await rawEmail.json();

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gmail API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // Also store in notifications for tracking
      await supabase.from('notifications').insert({
        user_id: await this.getUserId(email.to),
        report_id: null,
        message: `Email sent via Gmail: ${email.subject}`,
        type: 'email_sent',
        is_read: false,
      } as any);

      return { 
        success: true, 
        messageId: data.id,
        error: undefined 
      };
    } catch (error: any) {
      console.error('Gmail service error:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper method to get user ID from email
  private async getUserId(email: string): Promise<string> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (profile?.id) {
        return profile.id;
      }

      // If no profile found, create one
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          email,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .maybeSingle();

      return newProfile.id;
    } catch (error) {
      console.error('Error getting user ID:', error);
      throw error;
    }
  }

  // Refresh access token if expired
  async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.config.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        console.error('Token refresh error:', data.error);
        return false;
      }

      this.accessToken = data.access_token;
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  // Initialize with stored refresh token
  async initialize(): Promise<void> {
    if (this.config.refreshToken) {
      const success = await this.refreshAccessToken();
      if (success) {
        console.log('Gmail access token refreshed successfully');
      }
    }
  }
}

export default GmailService;
