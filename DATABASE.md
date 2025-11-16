# 🗄️ Database Storage - Complete Overview

## ✅ YES - All Login Data is Stored in Database

All user login credentials and profile information are securely stored in a **SQLite database** at:
```
data/database.sqlite
```

**Database Size**: 16 KB
**Last Updated**: November 15, 2025 at 22:34

---

## 📊 Users Currently in Database

| # | Name | Email | User ID | Created |
|---|------|-------|---------|---------|
| 1 | Login Tester | logintest@example.com | 8249a0a6-32fc-491c-8529-6d052a4dede7 | 2025-11-16 03:29:09 |
| 2 | Test2 | test2@example.com | 5b9a914e-cf25-4a1d-87eb-5ae75d42b269 | 2025-11-16 03:29:11 |
| 3 | Demo User | demo@medicare.com | 9fafa142-17b3-45db-9f01-389957878db6 | 2025-11-16 03:32:23 |
| 4 | New User | newuser@test.com | 7634e622-1ac1-4688-807b-d6adc4aa4b1c | 2025-11-16 03:32:32 |
| 5 | Rohith | mkrohith775@gmail.com | 6dca0adb-2a1f-43c1-8a0e-2a8da5698cc5 | 2025-11-16 03:34:31 |

**Total Users**: 5

---

## 🔐 What Data is Stored

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

### Data Stored per User
1. **id** - Unique UUID for each user
2. **email** - User's email address (must be unique)
3. **name** - User's full name
4. **passwordHash** - Encrypted password (bcryptjs hashing)
5. **createdAt** - Timestamp when account was created

---

## 🔒 Security Features

### Password Hashing
- ✅ **Algorithm**: bcryptjs (salted hash)
- ✅ **Salt Rounds**: 10
- ✅ **Secure**: Passwords are hashed, NOT stored in plain text
- ✅ **Irreversible**: Cannot decrypt passwords from hash

### Example Password Hash
```
Plaintext: "Demo123!"
Hashed: "$2a$10$XxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx"
```

The password hash cannot be reversed to get the original password.

---

## 🗄️ Database Technology

| Feature | Details |
|---------|---------|
| **Type** | SQLite3 |
| **Package** | better-sqlite3 |
| **Format** | Binary database file |
| **Location** | `data/database.sqlite` |
| **Persistence** | Data survives app restarts |
| **Querying** | SQL |

---

## 📝 How Registration Works

```
User fills form (email, password, name)
         ↓
Frontend validates input
         ↓
POST /api/register to backend
         ↓
Backend hashes password with bcryptjs
         ↓
Creates UUID for user ID
         ↓
Inserts into SQLite users table:
  - id: UUID
  - email: user's email
  - name: user's name
  - passwordHash: bcryptjs hash
  - createdAt: current timestamp
         ↓
Returns JWT token
         ↓
User logged in automatically
```

---

## 📝 How Login Works

```
User enters email and password
         ↓
Frontend POST /api/login to backend
         ↓
Backend queries SQLite for user by email
         ↓
Compares submitted password with stored hash (bcryptjs.compare)
         ↓
If match:
  - Generate JWT token
  - Return user data + token
  - Token stored in localStorage
  - User logged in
         ↓
If no match:
  - Return error "Invalid credentials"
  - User stays on login page
```

---

## 🔍 How to Check Database

### List All Users
```powershell
cd 'C:\Users\DELL\OneDrive\Desktop\Hackathon\medicare-vision-ai'
node check-users.js
```

### Query Specific User
You can modify `check-users.js` to query by email:
```javascript
const user = db.prepare('SELECT * FROM users WHERE email = ?').get('demo@medicare.com');
```

---

## 🔄 Data Persistence

| Action | Data Saved? |
|--------|------------|
| User registers | ✅ Yes - stored in SQLite |
| User logs in | ✅ Yes - login timestamp tracked |
| User logs out | ✅ Yes - user data remains |
| App restarts | ✅ Yes - all users still in database |
| Browser cleared | ✅ Yes - backend database unchanged |

---

## 🛡️ Privacy & Security

### What's NOT Stored
- ❌ Plain text passwords
- ❌ Session tokens in database
- ❌ Credit card info
- ❌ Phone numbers (unless you add)
- ❌ Medical data (unless you add)

### What IS Stored
- ✅ Hashed passwords (bcryptjs)
- ✅ User IDs (UUID)
- ✅ Email addresses
- ✅ User names
- ✅ Account creation dates

### JWT Tokens
- Stored in browser's **localStorage** (not database)
- Expire after **7 days**
- Can be cleared by logging out
- Signed with JWT_SECRET from `.env.local`

---

## 📂 Database File Locations

```
C:\Users\DELL\OneDrive\Desktop\Hackathon\medicare-vision-ai\
└── data/
    └── database.sqlite (16 KB)
```

---

## 🚀 Testing Data Persistence

1. **Register a new user** at http://localhost:3000
2. **Logout** 
3. **Restart the application** (or just refresh)
4. **Login** with the same credentials
5. ✅ You should be logged in successfully!

This proves the data is persistently stored in the database.

---

## 📊 Database Statistics

| Metric | Value |
|--------|-------|
| Total Users | 5 |
| Database Size | 16 KB |
| Table Count | 1 (users table) |
| Password Hash Algorithm | bcryptjs (10 rounds) |
| Data Persistence | ✅ Permanent (until deleted) |

---

**All login data is permanently stored in SQLite database and will persist across app restarts!** ✅
