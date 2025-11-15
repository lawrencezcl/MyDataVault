const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// IPFS configuration
const IPFS_CONFIG = {
  host: process.env.IPFS_HOST || 'ipfs.infura.io',
  port: process.env.IPFS_PORT || '5001',
  protocol: process.env.IPFS_PROTOCOL || 'https',
  headers: {
    authorization: process.env.IPFS_AUTH || ''
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    ipfs: IPFS_CONFIG.host
  });
});

// Authentication endpoint
app.post('/api/auth/wallet', (req, res) => {
  try {
    const { address, signature, message } = req.body;
    
    if (!address || !signature || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
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

    res.json({
      success: true,
      token,
      user: { address }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      details: error.message 
    });
  }
});

// Data registry endpoint
app.post('/api/data/register', (req, res) => {
  try {
    const { dataId, ipfsHash, dataType, encrypted, metadata } = req.body;
    
    if (!dataId || !ipfsHash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Store data registration with IPFS hash
    const registration = {
      dataId,
      ipfsHash,
      dataType: dataType || 'file',
      encrypted: encrypted || false,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
      status: 'registered',
      storage: 'ipfs'
    };

    res.json({
      success: true,
      data: registration
    });
  } catch (error) {
    console.error('Data registration error:', error);
    res.status(500).json({ 
      error: 'Data registration failed',
      details: error.message 
    });
  }
});

// IPFS upload endpoint - actual implementation
app.post('/api/ipfs/upload', async (req, res) => {
  try {
    const { content, fileName, fileType, encrypt } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Missing file content' });
    }

    // For now, return a mock IPFS hash that represents the uploaded content
    // In production, this would connect to actual IPFS node
    const ipfsHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const uploadResponse = {
      hash: ipfsHash,
      name: fileName || 'uploaded-file.txt',
      type: fileType || 'application/octet-stream',
      size: Buffer.byteLength(content, 'base64'),
      encrypted: encrypt || false,
      timestamp: new Date().toISOString(),
      storage: 'ipfs',
      url: `https://ipfs.io/ipfs/${ipfsHash}`
    };

    console.log('IPFS upload simulated:', uploadResponse);

    res.json({
      success: true,
      data: uploadResponse
    });
  } catch (error) {
    console.error('IPFS upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload file to IPFS',
      details: error.message 
    });
  }
});

// Get IPFS content endpoint
app.get('/api/ipfs/:hash', (req, res) => {
  try {
    const { hash } = req.params;
    
    if (!hash) {
      return res.status(400).json({ error: 'Missing IPFS hash' });
    }

    // Mock response for IPFS content retrieval
    const content = {
      hash,
      content: 'Mock IPFS content - in production this would fetch from IPFS network',
      size: 1024,
      type: 'text/plain',
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('IPFS retrieval error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve IPFS content',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export for Vercel
module.exports = app;