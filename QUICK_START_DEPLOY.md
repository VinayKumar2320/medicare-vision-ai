# Quick Start: Deploy to Railway (5 Minutes)

This is the fastest way to get your app live!

## Step 1: Prepare Your Repository

Make sure all your code is committed and pushed to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Step 2: Deploy on Railway

1. **Go to Railway**: https://railway.app
2. **Sign up** with your GitHub account
3. **Click "New Project"** → **"Deploy from GitHub repo"**
4. **Select your repository**: `medicare-vision-ai`
5. **Wait for Railway to detect** your project (it will auto-detect Node.js)

## Step 3: Add Environment Variables

Click on your project → **Variables** tab → **+ New Variable**

Add these variables:

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | ✅ Yes |
| `GEMINI_API_KEY` | Your Gemini API key | ✅ Yes |
| `JWT_SECRET` | Generate with: `openssl rand -base64 32` | ✅ Yes |
| `RESEND_API_KEY` | Your Resend API key | ❌ Optional |
| `RESEND_FROM_EMAIL` | Your verified email | ❌ Optional |

**To generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

## Step 4: Deploy!

1. Railway will automatically start building and deploying
2. Wait 2-3 minutes for the build to complete
3. Click on your service → **Settings** → **Generate Domain**
4. Your app is now live! 🎉

## Step 5: Test Your Deployment

Visit your Railway URL (e.g., `https://medicare-vision-ai.up.railway.app`)

Test:
- ✅ User registration
- ✅ Login
- ✅ Upload prescription
- ✅ Upload blood report
- ✅ Generate meal plan

## Troubleshooting

**Build fails?**
- Check the build logs in Railway
- Make sure all dependencies are in `package.json`
- Verify Node.js version (should be 18+)

**App doesn't load?**
- Check the deployment logs
- Verify all environment variables are set
- Make sure `GEMINI_API_KEY` is correct

**API calls fail?**
- Check browser console for errors
- Verify CORS settings (should work automatically on Railway)

## Next Steps

- **Custom Domain**: Add your own domain in Railway Settings
- **Database Backup**: Railway provides automatic backups
- **Monitoring**: Check Railway dashboard for logs and metrics

## Need Help?

- Railway Docs: https://docs.railway.app
- Check `DEPLOYMENT.md` for other hosting options
- Open an issue on GitHub

---

**That's it! Your app should be live in under 5 minutes.** 🚀

