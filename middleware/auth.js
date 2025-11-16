import jwt from 'jsonwebtoken';

function signToken(payload) {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

function verifyToken(token) {
  try {
    const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
    return jwt.verify(token, secret);
  } catch (e) {
    return null;
  }
}

function authenticateToken(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  const payload = verifyToken(token);
  if (!payload || !payload.id) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  req.user = payload;
  next();
}

export { signToken, verifyToken, authenticateToken };

