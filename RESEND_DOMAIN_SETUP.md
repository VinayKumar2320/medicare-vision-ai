# Resend Domain Verification Guide

## Step-by-Step Instructions

### Step 1: Access Resend Dashboard
1. Go to: **https://resend.com/domains**
2. Log in with your Resend account

### Step 2: Add Your Domain
1. Click **"Add Domain"** button
2. Enter your domain name (e.g., `yourdomain.com` or `medicarevisionai.com`)
3. Click **"Add"**

### Step 3: Verify Domain Ownership
Resend will provide DNS records you need to add to your domain:

#### Option A: If you own a domain
You'll need to add these DNS records to your domain's DNS settings:

1. **TXT Record** (for domain verification):
   - Name: `@` or your domain name
   - Value: (provided by Resend)
   - TTL: 3600

2. **DKIM Records** (for email authentication):
   - Usually 3 CNAME records
   - Names: `resend._domainkey`, `resend1._domainkey`, `resend2._domainkey`
   - Values: (provided by Resend)

3. **SPF Record** (optional but recommended):
   - Name: `@`
   - Value: `v=spf1 include:resend.com ~all`

#### Option B: If you don't have a domain
For a hackathon/demo, you can:
- Use a free subdomain service (e.g., Freenom, Namecheap)
- Or use SMTP instead (simpler for demos)

### Step 4: Wait for Verification
- DNS changes can take 5 minutes to 48 hours
- Resend will automatically verify once DNS records are detected
- You'll see a green checkmark when verified

### Step 5: Update Configuration
Once verified, update your `.env.local`:

```env
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

Replace `yourdomain.com` with your actual verified domain.

### Step 6: Test
1. Restart your server: `npm run dev:all`
2. Go to Guardian Details in the app
3. Send a test email to any recipient

## Quick Links
- **Resend Domains Dashboard**: https://resend.com/domains
- **Resend Documentation**: https://resend.com/docs
- **DNS Help**: Contact your domain registrar

## Alternative: Use SMTP (Faster for Hackathons)
If domain verification is taking too long, you can use SMTP instead:
- Set `SMTP_USER` and `SMTP_PASSWORD` in `.env.local`
- Works immediately, no domain verification needed

