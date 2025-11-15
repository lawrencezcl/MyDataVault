// Vercel serverless function for wallet authentication
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '0b4a93420a6f31368a64a96554616387cac18b7fb71f553e3aa34a1339f7f3249b194178ab299524fe0b3b8b584027959e10d7682068ea2bd0e84310b86b7aef';

export default async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed: ['POST', 'OPTIONS']
    });
  }
  
  try {
    const { address, signature, message } = req.body;
    
    if (!address || !signature || !message) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields',
        details: 'address, signature, and message are required'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        address, 
        message,
        timestamp: Date.now()
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: { address },
      message: 'Authentication successful'
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Authentication failed',
      details: error.message 
    });
  }
};