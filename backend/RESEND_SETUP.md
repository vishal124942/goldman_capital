# Resend Setup Guide

## Quick Setup (3 Steps)

### 1. Create Resend Account
Visit [resend.com/signup](https://resend.com/signup) and create a free account.

### 2. Generate API Key
1. Go to [resend.com/api-keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Give it a name like "Capital Forge Backend"
4. Copy the API key (starts with `re_`)

### 3. Update Environment Variables
Open `backend/.env` and replace:
```
RESEND_API_KEY=your_resend_api_key_here
```
with your actual API key:
```
RESEND_API_KEY=re_your_actual_key_here
```

## Email Sending Limits

**Free Tier:**
- 100 emails/day
- 3,000 emails/month
- Perfect for testing and small-scale production

**Production Setup (Optional):**
For production, you can:
1. Verify your domain in Resend dashboard
2. Update `EMAIL_FROM` in `.env` with your domain email

## Testing

### Without API Key (Development)
If you don't set `RESEND_API_KEY`, OTP codes will be logged to the console:
```
==================================================
📧 MOCK EMAIL (Configure RESEND_API_KEY for real emails)
==================================================
To: user@example.com
Subject: Your Verification Code - Godman Capital
🔐 OTP CODE: 123456
==================================================
```

### With API Key (Production)
Emails will be sent via Resend and you'll see:
```
✅ Email sent successfully to: user@example.com
📧 Email ID: abc123-def456-ghi789
```

## Next Steps
1. Get your Resend API key
2. Update `RESEND_API_KEY` in `backend/.env`
3. Restart your backend server
4. Test login flow - OTP emails will be delivered!
