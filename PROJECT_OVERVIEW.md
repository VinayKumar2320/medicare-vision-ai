# Medicare Vision AI - Project Overview

## 🎯 What Has Been Built

### 1. **Database Structure** (SQLite - `data/database.sqlite`)

#### Users Table
```
id              - UUID (Primary Key)
email           - User email (UNIQUE)
name            - User's name
passwordHash    - Bcrypt hashed password (10 salt rounds)
createdAt       - Account creation timestamp
```

#### Prescriptions Table
```
id              - UUID (Primary Key)
userId          - Foreign Key linking to users.id
name            - Medication name
dosage          - Dosage amount (e.g., "10mg")
frequency       - How often to take (e.g., "Once daily")
createdAt       - When prescription was added
```

---

### 2. **Backend API Endpoints** (Express.js on port 3001)

#### Authentication Endpoints
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/register` | Create new user account | ❌ No |
| POST | `/api/login` | Login & get JWT token | ❌ No |
| GET | `/api/me` | Get current user profile | ✅ Yes |

#### Prescription Endpoints
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/prescriptions` | Get all user prescriptions | ✅ Yes |
| POST | `/api/prescriptions` | Add new prescription | ✅ Yes |
| DELETE | `/api/prescriptions/:id` | Delete a prescription | ✅ Yes |

#### Email Endpoint
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/send-email` | Send email (Resend or SMTP) |

---

### 3. **Frontend Features** (React/TypeScript on port 3000)

✅ **User Authentication**
- Register new account
- Login with email/password
- Logout functionality
- JWT token storage (localStorage)
- Auto-login on page refresh

✅ **Prescription Management**
- View all prescriptions
- Add new prescription (name, dosage, frequency)
- Delete prescriptions
- Real-time data sync with database

✅ **User Interface**
- Clean, responsive design
- Login/Register toggle
- Prescription form
- Prescription list display
- Error handling & notifications

---

### 4. **Security Features**

🔒 **Authentication**
- JWT (JSON Web Tokens) with 7-day expiry
- Bearer token in Authorization header
- Bcryptjs password hashing (10 salt rounds)

🔒 **Database**
- Foreign Key constraints (prescriptions → users)
- Unique email constraint
- Password stored as hash (never in plaintext)

🔒 **API**
- CORS enabled for localhost:3000
- Token validation on protected routes
- Input validation on endpoints

---

### 5. **Project Files Structure**

```
medicare-vision-ai/
├── server.js                 # Express backend
├── index.tsx                 # React frontend (main component)
├── index.html                # HTML entry point
├── index.css                 # Styling
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript config
├── package.json             # Dependencies
├── .env.local               # Environment variables
├── data/
│   └── database.sqlite      # SQLite database file
├── node_modules/            # Dependencies
└── dist/                    # Build output (generated)
```

---

### 6. **Dependencies Installed**

**Backend:**
- express
- bcryptjs (password hashing)
- jsonwebtoken (JWT auth)
- better-sqlite3 (database)
- nodemailer (email)
- resend (email service)
- cors
- dotenv

**Frontend:**
- react 19
- react-dom
- typescript
- @vitejs/plugin-react

---

### 7. **How to Use the App**

#### Step 1: Start Servers
```bash
# Terminal 1: Backend
node server.js

# Terminal 2: Frontend
npm run dev
```

#### Step 2: Access the App
```
http://localhost:3000
```

#### Step 3: Register Account
- Click "Don't have an account? Register"
- Enter email, password, name
- Click Register

#### Step 4: Login
- Enter your email & password
- Click Login

#### Step 5: Manage Prescriptions
- Click "Add Prescription"
- Enter medication name, dosage, frequency
- Click "Save Prescription"
- View all your prescriptions
- Delete prescriptions with delete button

#### Step 6: Data Persists
- Logout
- Login again with same credentials
- All prescriptions are still there! ✅

---

### 8. **Testing the API with curl/PowerShell**

#### Register User
```bash
$body = @{
    email = "user@example.com"
    password = "SecurePass123"
    name = "John Doe"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/api/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

#### Login
```bash
$body = @{
    email = "user@example.com"
    password = "SecurePass123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3001/api/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$token = ($response.Content | ConvertFrom-Json).data.token
Write-Host "Token: $token"
```

#### Add Prescription (with token)
```bash
$token = "your_jwt_token_here"

$body = @{
    name = "Lisinopril"
    dosage = "10mg"
    frequency = "Once daily"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/api/prescriptions" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body $body
```

#### Get All Prescriptions
```bash
$token = "your_jwt_token_here"

Invoke-WebRequest -Uri "http://localhost:3001/api/prescriptions" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $token" }
```

---

### 9. **Environment Variables** (.env.local)

```
# API Keys
GEMINI_API_KEY=your_key_here
MAILJET_API_KEY=your_key_here
MAILJET_SECRET_KEY=your_key_here
MAILJET_FROM_EMAIL=noreply@medicarevisionai.com

# JWT
JWT_SECRET=dev_jwt_secret

# Resend (Email)
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=onboarding@resend.dev

# SMTP (Email Fallback)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=your_email@gmail.com
SMTP_SECURE=false
```

---

### 10. **Current Status** ✅

| Feature | Status |
|---------|--------|
| User Authentication | ✅ Working |
| Database (SQLite) | ✅ Working |
| User Registration | ✅ Working |
| User Login | ✅ Working |
| Prescription Storage | ✅ Working |
| Add Prescription | ✅ Working |
| View Prescriptions | ✅ Working |
| Delete Prescription | ✅ Working |
| Data Persistence | ✅ Working |
| Password Hashing | ✅ Working |
| JWT Tokens | ✅ Working |
| Frontend UI | ✅ Working |
| Backend API | ✅ Working |

---

## 📊 Quick Stats

- **Total API Endpoints**: 7
- **Database Tables**: 2 (users, prescriptions)
- **Authentication Methods**: JWT + Password Hashing
- **Frontend Pages**: 1 (Login/Register + Dashboard)
- **Lines of Code**: ~1,400+ (backend + frontend)

---

## 🚀 Next Steps

1. **Test the app thoroughly**
   - Register multiple accounts
   - Add/delete prescriptions
   - Verify data persists

2. **Enhance features**
   - Add medication reminders
   - Add dosage history
   - Add doctor notes
   - Add refill tracking

3. **Deploy**
   - Deploy backend to cloud (Heroku, Railway, Render)
   - Deploy frontend to Vercel or Netlify
   - Use production database

---

For any issues or questions, check:
- Browser Console (F12)
- Backend Terminal output
- Frontend Terminal output
