// Vercel serverless function for blockchain storage
module.exports = async (req, res) => {
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
    const { dataId, ipfsHash, metadata } = req.body;
    
    if (!dataId || !ipfsHash) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields',
        details: 'dataId and ipfsHash are required'
      });
    }

    // Mock blockchain storage response
    const blockchainResponse = {
      dataId,
      ipfsHash,
      metadata: metadata || {},
      transactionHash: '0x' + Math.random().toString(36).substring(2, 15),
      blockNumber: Math.floor(Math.random() * 1000000),
      timestamp: new Date().toISOString(),
      status: 'confirmed',
      network: 'polkadot',
      contract: 'data_registry'
    };

    return res.status(200).json({
      success: true,
      data: blockchainResponse,
      message: 'Data stored on blockchain successfully'
    });
  } catch (error) {
    console.error('Blockchain storage error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Blockchain storage failed',
      details: error.message 
    });
  }
};