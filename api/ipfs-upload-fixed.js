// Vercel serverless function for IPFS upload
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { content, fileName, fileType, encrypt } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Missing file content' });
    }

    // Generate IPFS hash (mock implementation)
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

    return res.status(200).json({
      success: true,
      data: uploadResponse
    });
  } catch (error) {
    console.error('IPFS upload error:', error);
    return res.status(500).json({ 
      error: 'Failed to upload file to IPFS',
      details: error.message 
    });
  }
};