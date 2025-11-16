# Medicare Vision AI - Running

## ✅ All Services Active

### Backend Server
- **Port**: 3001
- **Status**: Running ✅
- **URL**: http://localhost:3001
- **Command**: `node server.js`
- **Features**:
  - User registration with bcryptjs password hashing
  - User login with JWT token generation
  - Protected user profile endpoint
  - SQLite database storage (`data/database.sqlite`)
  - Email service (Resend + SMTP fallback)

### Frontend Server
- **Port**: 3000
- **Status**: Running ✅
- **URL**: http://localhost:3000
- **Command**: `npm run dev`
- **Features**:
  - Login/Register page with form toggle
  - Token-based authentication
  - localStorage persistence
  - Protected routes (main app only shows if logged in)
  - User profile display in header
  - Logout button

## 📝 How to Use

### 1. Open the App
Navigate to: **http://localhost:3000**

### 2. Create an Account
- Click "Register"
- Enter email, password, and name
- Click "Create Account"
- You'll be automatically logged in

### 3. Login with Existing Account
- Enter email and password
- Click "Sign In"
- You'll be redirected to the main app dashboard

### 4. Logout
- Click the "Logout" button in the top right (next to your name)

## 🗄️ Database

Users are stored in SQLite at: `data/database.sqlite`

### Users Table Schema
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  passwordHash TEXT NOT NULL,
  createdAt TEXT NOT NULL
)
```

### Test Users
- Email: `demo@medicare.com`
- Password: `Demo123!`
- Name: `Demo User`

## 🔐 Authentication

- **Algorithm**: JWT (HS256)
- **Token Expiry**: 7 days
- **Default Secret**: `dev_jwt_secret` (from `.env.local`)
- **Storage**: localStorage (`authToken` key)

## ⚙️ Configuration

### Environment Variables (`.env.local`)
```
RESEND_API_KEY=your_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
JWT_SECRET=your_secure_secret
```

## 🚀 Quick Start (One Command)

To run everything at once:
```powershell
cd 'C:\Users\DELL\OneDrive\Desktop\Hackathon\medicare-vision-ai'
npm run dev:all
```

This starts both the backend and frontend servers concurrently.

## 📚 API Endpoints

### POST `/api/register`
Register a new user.
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

### POST `/api/login`
Login user and get JWT token.
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### GET `/api/me`
Get authenticated user profile.
```
Headers: Authorization: Bearer <jwt_token>
```

## 🐛 Troubleshooting

### Port Already in Use
If port 3001 or 3000 is already in use:
```powershell
# Find and kill process on port 3001
Get-NetTCPConnection -LocalPort 3001 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }

# Find and kill process on port 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### Frontend Not Compiling
If you see TypeScript errors, ensure all dependencies are installed:
```powershell
npm install
```

### Database Issues
To reset the database, delete `data/database.sqlite` and restart the server.

---

**Last Updated**: November 15, 2025  
**Version**: 1.0.0
