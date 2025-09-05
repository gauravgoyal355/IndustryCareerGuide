// import fs from 'fs';
// import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Temporary fix for Vercel deployment - using demo users
// TODO: Replace with database (Vercel KV, PostgreSQL, etc.)
const DEMO_USERS = [
  {
    id: '1',
    email: 'demo@example.com',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    name: 'Demo User',
    createdAt: '2024-01-01T00:00:00.000Z'
  }
];

const getUsers = () => {
  return DEMO_USERS;
};

const saveUsers = (users) => {
  // No-op for demo - in production use database
  console.log('saveUsers called (demo mode)');
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = getUsers();
    
    // Find user by email
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Update last login (demo mode - not persisted)
    user.lastLogin = new Date().toISOString();
    // saveUsers(users); // Disabled for Vercel deployment

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}