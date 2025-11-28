# Gmail OAuth Setup Guide

This guide will help you set up Gmail OAuth 2.0 authentication for the CollegeMedia application.

## Prerequisites

1. A Google account
2. Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" and then "New Project"
3. Enter a project name (e.g., "CollegeMedia Gmail App")
4. Click "Create"

## Step 2: Enable Gmail API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Gmail API"
3. Click on "Gmail API" and then "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "CollegeMedia"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
5. Add test users (your email address)
6. Save and continue

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set authorized redirect URIs:
   - `http://localhost:5173` (for development)
   - `http://localhost:3000` (if using different port)
   - Your production domain (when deployed)
5. Click "Create"
6. Copy the Client ID and Client Secret

## Step 5: Configure Environment Variables

1. Create a `.env` file in your project root
2. Add the following variables:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_client_secret_here
```

## Step 6: Update OAuth Consent Screen

1. Go back to "OAuth consent screen"
2. Add your production domain to authorized domains
3. Publish the app (if going to production)

## Security Notes

- **Never commit your `.env` file to version control**
- The client secret is only needed for server-side token exchange
- For production, consider implementing a backend service for token exchange
- Gmail API has quotas and rate limits

## Testing

1. Start your development server
2. Navigate to `/login`
3. Click "Sign in with Gmail"
4. Authorize the application
5. You should be redirected to the home page
6. Navigate to `/mails` to see your emails

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI"**
   - Check that your redirect URI matches exactly in Google Cloud Console
   - Include protocol (http/https) and port number

2. **"Access blocked"**
   - Make sure you've added your email as a test user
   - Check that the OAuth consent screen is properly configured

3. **"API not enabled"**
   - Ensure Gmail API is enabled in your Google Cloud project

4. **"Invalid client"**
   - Verify your Client ID is correct
   - Check that the OAuth 2.0 client is properly configured

### Rate Limits:

- Gmail API has daily quotas
- Monitor usage in Google Cloud Console
- Implement proper error handling for quota exceeded errors

## Production Deployment

When deploying to production:

1. Update authorized redirect URIs in Google Cloud Console
2. Add your production domain to authorized domains
3. Review and update OAuth consent screen
4. Consider implementing refresh token handling
5. Monitor API usage and quotas

## Support

If you encounter issues:

1. Check Google Cloud Console for API quotas and errors
2. Review browser console for client-side errors
3. Verify environment variables are loaded correctly
4. Check that all required scopes are included

