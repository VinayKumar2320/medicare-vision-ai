# Deployment Guide

This guide will help you deploy the Medicare Vision AI application to various hosting platforms.

## Prerequisites

- GitHub repository with your code
- API keys:
  - `GEMINI_API_KEY` (required)
  - `JWT_SECRET` (required - can be auto-generated)
  - `RESEND_API_KEY` (optional, for email features)
  - `RESEND_FROM_EMAIL` (optional)

## Environment Variables

Set these environment variables in your hosting platform:

```env
NODE_ENV=production
PORT=3001  # Or use the port provided by your hosting platform
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_here  # Generate a random string
RESEND_API_KEY=your_resend_api_key_here  # Optional
RESEND_FROM_EMAIL=noreply@yourdomain.com  # Optional
FRONTEND_URL=https://your-frontend-url.com  # Optional - for CORS if frontend/backend are separate
VITE_API_URL=https://your-backend-url.com  # For frontend builds (if deploying separately)
```

## Deployment Options

### Option 1: Railway (Recommended - Easiest)

Railway is the easiest option for full-stack deployment with SQLite support.

#### Steps:

1. **Sign up**: Go to [railway.app](https://railway.app) and sign up with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Environment Variables**:
   - Go to your project → Variables tab
   - Add all required environment variables:
     - `NODE_ENV=production`
     - `GEMINI_API_KEY=your_key_here`
     - `JWT_SECRET=your_secret_here` (generate with: `openssl rand -base64 32`)
     - `RESEND_API_KEY=your_key` (optional)
     - `RESEND_FROM_EMAIL=your_email` (optional)
   - Railway will automatically set `PORT` - you don't need to set it manually

4. **Deploy**:
   - Railway will automatically detect the `railway.json` configuration
   - It will build and deploy your app
   - Your app will be live at `https://your-app-name.up.railway.app`

5. **Set Custom Domain** (Optional):
   - Go to Settings → Domains
   - Add your custom domain

**Note**: Railway provides a free tier with $5 credit per month.

---

### Option 2: Render

Render is another great option with a free tier.

#### Steps:

1. **Sign up**: Go to [render.com](https://render.com) and sign up with GitHub

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Settings**:
   - **Name**: `medicare-vision-ai` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

4. **Add Environment Variables**:
   - Scroll down to "Environment Variables"
   - Add all required variables:
     - `NODE_ENV=production`
     - `PORT=10000` (Render uses port 10000)
     - `GEMINI_API_KEY=your_key`
     - `JWT_SECRET=your_secret`
     - `RESEND_API_KEY=your_key` (optional)
     - `RESEND_FROM_EMAIL=your_email` (optional)

5. **Deploy**:
   - Click "Create Web Service"
   - Render will build and deploy your app
   - Your app will be live at `https://your-app-name.onrender.com`

**Note**: Free tier services on Render spin down after 15 minutes of inactivity.

---

### Option 3: Vercel (Frontend) + Railway/Render (Backend)

This option separates frontend and backend for better scalability.

#### Backend Deployment (Railway or Render):

Follow Option 1 or 2 above, but note your backend URL.

#### Frontend Deployment (Vercel):

1. **Sign up**: Go to [vercel.com](https://vercel.com) and sign up with GitHub

2. **Import Project**:
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Configure Build Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**:
   - Go to Settings → Environment Variables
   - Add:
     - `VITE_API_URL=https://your-backend-url.com`
     - `VITE_GEMINI_API_KEY=your_key` (if needed in frontend)

5. **Deploy**:
   - Click "Deploy"
   - Your frontend will be live at `https://your-app-name.vercel.app`

**Note**: Update your backend CORS settings to allow your Vercel domain.

---

### Option 4: DigitalOcean App Platform

1. **Sign up**: Go to [digitalocean.com](https://digitalocean.com)

2. **Create App**:
   - Go to App Platform
   - Click "Create App"
   - Connect your GitHub repository

3. **Configure**:
   - Select your repository and branch
   - App Platform will auto-detect Node.js
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`

4. **Add Environment Variables**:
   - Add all required environment variables

5. **Deploy**:
   - Review and create
   - Your app will be live at `https://your-app-name.ondigitalocean.app`

---

## Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Test prescription upload and OCR
- [ ] Test blood report upload
- [ ] Test meal plan generation
- [ ] Test voice assistant (if applicable)
- [ ] Verify email notifications (if configured)
- [ ] Check file uploads are working
- [ ] Test on mobile devices
- [ ] Set up custom domain (optional)
- [ ] Configure SSL certificate (usually automatic)

## Troubleshooting

### Build Fails

- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### API Calls Fail

- Verify `VITE_API_URL` is set correctly in frontend
- Check CORS settings in `server.js`
- Ensure backend URL is accessible

### Database Issues

- SQLite files are stored in the `data/` directory
- On some platforms, you may need persistent storage
- Consider migrating to PostgreSQL for production (future enhancement)

### File Uploads Not Working

- Verify `uploads/` directory exists and is writable
- Check file size limits in `config/multer.js`
- Ensure proper permissions on uploads directory

### Environment Variables Not Working

- Restart your service after adding environment variables
- Verify variable names match exactly (case-sensitive)
- Check for typos in variable values

## Production Best Practices

1. **Security**:
   - Use strong `JWT_SECRET` (generate with: `openssl rand -base64 32`)
   - Enable HTTPS (usually automatic on hosting platforms)
   - Regularly update dependencies

2. **Performance**:
   - Enable gzip compression
   - Use CDN for static assets
   - Optimize images before upload

3. **Monitoring**:
   - Set up error tracking (e.g., Sentry)
   - Monitor API response times
   - Track user analytics

4. **Backup**:
   - Regularly backup SQLite database
   - Backup uploaded files
   - Keep environment variables secure

## Support

For issues specific to hosting platforms:
- Railway: [docs.railway.app](https://docs.railway.app)
- Render: [render.com/docs](https://render.com/docs)
- Vercel: [vercel.com/docs](https://vercel.com/docs)

For application-specific issues, check the main README.md or open an issue on GitHub.

