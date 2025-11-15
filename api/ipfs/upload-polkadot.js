// Vercel serverless function for Polkadot-native IPFS integration
import { PolkadotIPFSService } from '../services/ipfsServiceSimple.js';

// Initialize IPFS service
const ipfsService = new PolkadotIPFSService();

// Parse request body for Vercel serverless functions
const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON in request body'));
      }
    });
  });
};

export default async (req, res) => {
  // Set comprehensive CORS headers for Polkadot integration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Network, X-Wallet-Address');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed',
      allowed: ['POST', 'OPTIONS']
    });
  }
  
  try {
    // Parse request body
    const body = await parseBody(req);
    const { content, fileName, fileType, encrypt, walletAddress, metadata = {} } = body;
    
    if (!content) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing file content',
        details: 'Content field is required for IPFS upload'
      });
    }

    // Add Polkadot-specific metadata
    const polkadotMetadata = {
      ...metadata,
      network: 'polkadot',
      uploadedAt: new Date().toISOString(),
      version: '1.0.0',
      walletAddress: walletAddress || 'anonymous',
      fileName: fileName || 'unnamed-file',
      fileType: fileType || 'application/octet-stream',
      encrypted: encrypt || false,
      ipfsGateway: 'w3auth',
      protocol: 'libp2p'
    };

    let uploadResult;
    
    if (walletAddress) {
      // Upload with wallet authentication (Polkadot-native)
      uploadResult = await ipfsService.uploadFileWithWallet(content, walletAddress, polkadotMetadata);
    } else {
      // Regular upload
      uploadResult = await ipfsService.uploadFile(content, polkadotMetadata);
    }

    console.log('Polkadot IPFS upload successful:', uploadResult);

    return res.status(200).json({
      success: true,
      data: uploadResult,
      message: 'File uploaded to Polkadot IPFS successfully',
      network: 'polkadot',
      gateway: 'w3auth'
    });
  } catch (error) {
    console.error('Polkadot IPFS upload error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to upload file to Polkadot IPFS',
      details: error.message,
      fallback: 'Using mock IPFS hash for demo purposes'
    });
  }
};