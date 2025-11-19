import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import authRoutes from './routes/auth.js';
import prescriptionRoutes from './routes/prescriptions.js';
import emailRoutes from './routes/email.js';
import bloodReportRoutes from './routes/bloodReports.js';
import mealPlanRoutes from './routes/mealPlans.js';

// Initialize database (this will run the setup)
import './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
// CORS configuration - allow requests from frontend
// In production, if frontend and backend are on same domain, allow all origins
// Otherwise, use FRONTEND_URL environment variable
const corsOptions = {
  origin: process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',')  // Support multiple origins
    : (NODE_ENV === 'production' ? true : 'http://localhost:4000'),  // In production, allow all if same domain
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// API Routes - must come before static file serving
app.use('/api', authRoutes);
app.use('/api', emailRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/blood-reports', bloodReportRoutes);
app.use('/api/meal-plans', mealPlanRoutes);

// Serve uploaded files with absolute path
const uploadsPath = join(__dirname, 'uploads');
// Ensure uploads directory exists
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, path) => {
    // Set proper content type for PDFs
    if (path.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));

// Serve static files from React app in production (must come after API routes)
if (NODE_ENV === 'production') {
  const distPath = join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    // Handle React routing - return all requests to React app
    app.get('*', (req, res) => {
      // Don't serve index.html for API routes or uploads
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.sendFile(join(distPath, 'index.html'));
    });
  }
}

console.log('Auth routes registered: /api/register, /api/login, /api/me');
console.log('Prescription routes registered: /api/prescriptions (GET, POST, DELETE), /api/prescriptions/upload (POST with OCR)');
console.log('Blood Report routes registered: /api/blood-reports (GET), /api/blood-reports/upload (POST), /api/blood-reports/:id (DELETE)');
console.log('Meal Plan routes registered: /api/meal-plans/generate (POST with file upload)');

// Debug: list registered routes
try {
  const routes = [];
  app._router.stack.forEach(layer => {
    if (layer.route && layer.route.path) {
      const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
      routes.push(`${methods} ${layer.route.path}`);
    }
  });
  console.log('Registered routes:\n', routes.join('\n'));
} catch (e) {
  // ignore
}

// Simple debug endpoint to list routes
app.get('/__routes', (req, res) => {
  try {
    const routes = [];
    app._router.stack.forEach(layer => {
      if (layer.route && layer.route.path) {
        const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
        routes.push({ path: layer.route.path, methods: methods.split(',') });
      }
    });
    res.json({ routes });
  } catch (err) {
    res.status(500).json({ error: 'failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (${NODE_ENV} mode)`);
  if (NODE_ENV === 'production') {
    console.log(`📦 Serving static files from /dist`);
  }
  console.log('\n📧 Email Configuration:');
  if (process.env.RESEND_API_KEY) {
    console.log('  ✅ Resend API configured');
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    if (fromEmail === 'onboarding@resend.dev') {
      console.log('  ⚠️  Using default Resend email (limited to your verified email)');
      console.log('  💡 To send to any email: Verify domain at https://resend.com/domains');
      console.log('     Then set RESEND_FROM_EMAIL=noreply@yourdomain.com in .env.local');
    } else {
      console.log(`  ✅ Using verified domain: ${fromEmail}`);
      console.log('  ✅ Can send to any email address!');
    }
  } else {
    console.log('  ⚠️  Resend API not configured');
    console.log('  💡 Get free API key: https://resend.com/api-keys');
  }
  if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    console.log('  ✅ SMTP configured (fallback)');
  } else {
    console.log('  ⚠️  SMTP not configured');
  }
  console.log('\n💡 Domain verification guide: See RESEND_DOMAIN_SETUP.md');
});

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
