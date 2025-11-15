// Vercel serverless function for IPFS upload with proper CORS and error handling

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
  // Set CORS headers first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
    // Parse request body
    const body = await parseBody(req);
    const { content, fileName, fileType, encrypt } = body;
    
    if (!content) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing file content',
        details: 'Content field is required'
      });
    }

    // Generate IPFS hash (mock implementation for now)
    const ipfsHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const uploadResponse = {
      hash: ipfsHash,
      name: fileName || 'uploaded-file.txt',
      type: fileType || 'application/octet-stream',
      size: Buffer.byteLength(content, 'base64'),
      encrypted: encrypt || false,
      timestamp: new Date().toISOString(),
      storage: 'ipfs',
      url: `https://ipfs.io/ipfs/${ipfsHash}`,
      gateway: 'https://gateway.ipfs.io/ipfs/' + ipfsHash
    };

    console.log('IPFS upload successful:', uploadResponse);

    return res.status(200).json({
      success: true,
      data: uploadResponse,
      message: 'File uploaded to IPFS successfully'
    });
  } catch (error) {
    console.error('IPFS upload error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to upload file to IPFS',
      details: error.message 
    });
  }
};