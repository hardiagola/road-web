# Gmail API Configuration for RoadFix Buddy

## Setup Instructions

### 1. Create Gmail OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to: APIs & Services > Library > Gmail API
4. Enable Gmail API
5. Go to Credentials > Create Credentials
6. Select "OAuth client ID"
7. Create credentials (Client ID and Client Secret)
8. Add authorized redirect URIs:
   - `http://localhost:8084/auth/callback`
   - `http://localhost:8084/auth/signin`

### 2. Environment Variables

Add these to your `.env` file:

```bash
# Gmail API Configuration
VITE_GMAIL_CLIENT_ID=your_client_id_here
VITE_GMAIL_CLIENT_SECRET=your_client_secret_here
VITE_GMAIL_REFRESH_TOKEN=your_refresh_token_here
```

### 3. Gmail Service Features

The Gmail service provides:
- **Real Email Sending**: Uses Gmail's REST API
- **Authentication**: OAuth 2.0 flow with refresh tokens
- **Thread Management**: Groups related emails
- **Error Handling**: Comprehensive error management
- **Tracking**: Stores email logs in database

### 4. Security Notes

- **Never commit credentials** to version control
- **Use environment variables** for sensitive data
- **HTTPS Only**: Ensure all API calls use HTTPS
- **Rate Limiting**: Gmail has usage limits

### 5. Email Templates

The service supports these email types:
- Welcome emails for new users
- Report status updates
- Work completion notifications
- Municipal partnership reports

### 6. Usage Example

```typescript
import { sendEmail } from '@/lib/emailService';

// Send welcome email
await sendEmail(createWelcomeEmail('John Doe', 'john@example.com'));

// Send report update
await sendEmail(createReportStatusEmail('John Doe', 'john@example.com', 'Pothole Reported', 'report-123'));
```

### 7. Migration Notes

After setting up credentials, the application will automatically use Gmail for sending real emails instead of simulated ones.

## Next Steps

1. Set up Gmail OAuth credentials
2. Update environment variables
3. Test the integration
4. Deploy to production

The Gmail service is now ready to replace the simulated email system!
