import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error('❌ SECRET_KEY not set in environment variables');
}

interface UserPayload {
  id: number;
  username: string;
}

export function generateToken(user: UserPayload): string {
  console.log('🔐 Generating Token for:', user);

  if (!user.id) {
    throw new Error('Missing user ID');
  }

  return jwt.sign(
    { user_id: user.id, username: user.username },
    SECRET_KEY,
    { expiresIn: '10h' }
  );
}

export function verifyToken(token: string): any | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log('✅ Decoded Token Data:', decoded);
    return decoded;
  } catch (err: any) {
    console.error('❌ Token verification failed:', err.message);
    return null;
  }
}
