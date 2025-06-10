import { Request, Response } from 'express';
import { User } from '../models';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwtService';
import validator from 'validator';

// Register User
export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, msg: 'Missing required fields' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ success: false, msg: 'Invalid email format' });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, msg: 'This email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashedPassword });

    return res.status(201).json({ success: true, msg: 'User registered successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, msg: 'Server error during registration', error: err.message });
  }
};

// Login User
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, msg: 'Missing required fields' });
  }

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ success: false, msg: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, msg: 'Incorrect password' });
    }

    const token = generateToken(user);
    return res.json({ success: true, msg: 'Login successful', token });
  } catch (err: any) {
    return res.status(500).json({ success: false, msg: 'Server error during login', error: err.message });
  }
};

// Logout User
export const logout = (_req: Request, res: Response) => {
  return res.status(200).json({ success: true, msg: 'Logout successful. Token discarded on the client side.' });
};
