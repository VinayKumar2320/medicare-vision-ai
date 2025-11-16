import express from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { createUserInDb, getUserByEmail, getUserById } from '../config/database.js';
import { signToken, verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Missing email or password' });

    const existing = getUserByEmail(email);
    if (existing) return res.status(400).json({ success: false, error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = randomUUID();
    createUserInDb({ id: userId, email: email.toLowerCase(), name: name || '', passwordHash });

    const token = signToken({ id: userId, email: email.toLowerCase() });
    return res.json({ success: true, data: { user: { id: userId, email: email.toLowerCase(), name: name || '' }, token } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Missing email or password' });

    const user = getUserByEmail(email);
    if (!user) return res.status(400).json({ success: false, error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ success: false, error: 'Invalid credentials' });

    const token = signToken({ id: user.id, email: user.email });
    return res.json({ success: true, data: { user: { id: user.id, email: user.email, name: user.name }, token } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, error: 'Not authenticated' });

    const payload = verifyToken(token);
    if (!payload || !payload.id) return res.status(401).json({ success: false, error: 'Invalid token' });

    const user = getUserById(payload.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    return res.json({ success: true, data: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt } });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;

