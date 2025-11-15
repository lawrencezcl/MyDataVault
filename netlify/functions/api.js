// Simple Netlify function for API endpoints
export const handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const path = event.path.replace('/.netlify/functions/api', '/api');
  
  try {
    if (path === '/api/health' && event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'OK',
          timestamp: new Date().toISOString()
        })
      };
    }

    if (path === '/api/auth/wallet' && event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { address, signature, message } = body;
      
      if (!address || !signature || !message) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing required fields' })
        };
      }

      // Mock JWT token creation
      const token = Buffer.from(JSON.stringify({
        address,
        message,
        timestamp: Date.now()
      })).toString('base64');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          token,
          user: { address }
        })
      };
    }

    if (path === '/api/data/register' && event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { dataId, ipfsHash, dataType, encrypted, metadata } = body;
      
      if (!dataId || !ipfsHash) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing required fields' })
        };
      }

      const registration = {
        dataId,
        ipfsHash,
        dataType: dataType || 'file',
        encrypted: encrypted || false,
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
        status: 'registered'
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: registration
        })
      };
    }

    if (path === '/api/ipfs/upload' && event.httpMethod === 'POST') {
      // Mock IPFS upload response
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            hash: 'Qm' + Math.random().toString(36).substring(2, 15),
            name: 'mock-file.txt',
            type: 'text/plain',
            size: 1024,
            encrypted: false,
            timestamp: new Date().toISOString()
          }
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route not found' })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message
      })
    };
  }
};