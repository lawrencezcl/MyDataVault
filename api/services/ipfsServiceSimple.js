// Simplified Polkadot IPFS service for serverless functions (no external dependencies)
// This version uses mock IPFS functionality for demo purposes

// W3Auth IPFS gateway configuration for Polkadot
const W3AUTH_IPFS_CONFIG = {
  host: 'ipfs.w3auth.io',
  port: 443,
  protocol: 'https',
  headers: {
    'Authorization': `Bearer polkadot-${Date.now()}`,
    'X-Network': 'polkadot'
  }
};

// Alternative IPFS gateways that support Polkadot
const IPFS_GATEWAYS = [
  'https://ipfs.w3auth.io',
  'https://gateway.ipfs.io',
  'https://cloudflare-ipfs.com',
  'https://ipfs.infura.io'
];

// Generate mock IPFS hash
function generateMockHash() {
  return 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// IPFS service class with Polkadot integration (simplified version)
class PolkadotIPFSService {
  constructor() {
    this.gatewayIndex = 0;
  }

  // Upload file to IPFS with Polkadot metadata (mock implementation)
  async uploadFile(content, metadata = {}) {
    try {
      // Generate mock IPFS hash
      const mockHash = generateMockHash();
      
      const fileData = {
        content: content,
        metadata: {
          ...metadata,
          network: 'polkadot',
          uploadedAt: new Date().toISOString(),
          version: '1.0.0',
          hash: mockHash
        }
      };

      // Simulate IPFS upload delay
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('Mock IPFS upload successful:', mockHash);
      
      return {
        hash: mockHash,
        size: Buffer.byteLength(content.toString()),
        path: mockHash,
        url: `${IPFS_GATEWAYS[0]}/ipfs/${mockHash}`,
        gatewayUrls: IPFS_GATEWAYS.map(gateway => `${gateway}/ipfs/${mockHash}`),
        metadata: fileData.metadata,
        status: 'success',
        note: 'Mock IPFS upload for demo purposes'
      };
    } catch (error) {
      console.error('IPFS upload error:', error);
      
      // Fallback: generate mock IPFS hash for demo
      const mockHash = generateMockHash();
      
      return {
        hash: mockHash,
        size: Buffer.byteLength(content.toString()),
        path: mockHash,
        url: `${IPFS_GATEWAYS[0]}/ipfs/${mockHash}`,
        gatewayUrls: IPFS_GATEWAYS.map(gateway => `${gateway}/ipfs/${mockHash}`),
        metadata: {
          ...metadata,
          network: 'polkadot',
          uploadedAt: new Date().toISOString(),
          version: '1.0.0',
          note: 'Mock IPFS hash for demo purposes'
        },
        status: 'fallback'
      };
    }
  }

  // Upload file with Polkadot wallet integration
  async uploadFileWithWallet(content, walletAddress, metadata = {}) {
    const walletMetadata = {
      ...metadata,
      walletAddress,
      signature: `polkadot-${Date.now()}`, // In real implementation, this would be actual wallet signature
      authenticated: true,
      uploadType: 'wallet-authenticated'
    };

    return this.uploadFile(content, walletMetadata);
  }

  // Retrieve file from IPFS (mock implementation)
  async getFile(hash) {
    try {
      // Simulate IPFS retrieval delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        content: 'Mock IPFS content - in production this would fetch from IPFS network',
        metadata: {
          hash,
          retrievedAt: new Date().toISOString(),
          note: 'Mock data for demo purposes',
          network: 'polkadot'
        }
      };
    } catch (error) {
      console.error('IPFS retrieval error:', error);
      
      return {
        content: 'Error retrieving content',
        metadata: {
          hash,
          error: error.message,
          retrievedAt: new Date().toISOString(),
          note: 'Mock data for demo purposes'
        }
      };
    }
  }

  // Get file from multiple gateways (redundancy)
  async getFileFromGateways(hash) {
    const results = [];
    
    for (const gateway of IPFS_GATEWAYS) {
      try {
        // Mock successful response from first gateway
        if (results.length === 0) {
          results.push({
            gateway,
            success: true,
            data: {
              content: 'Mock gateway content',
              hash,
              gateway
            }
          });
        } else {
          results.push({
            gateway,
            success: false,
            error: 'Gateway timeout (mock)'
          });
        }
      } catch (error) {
        results.push({
          gateway,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Pin content to IPFS (make it persistent)
  async pinContent(hash) {
    try {
      // Simulate pinning delay
      await new Promise(resolve => setTimeout(resolve, 50));
      
      console.log('Mock IPFS pinning successful:', hash);
      
      return {
        success: true,
        hash,
        pinnedAt: new Date().toISOString(),
        note: 'Mock pinning for demo purposes'
      };
    } catch (error) {
      console.error('IPFS pinning error:', error);
      return {
        success: false,
        hash,
        error: error.message
      };
    }
  }

  // Get IPFS node info
  async getNodeInfo() {
    return {
      id: 'polkadot-mock-node-' + Math.random().toString(36).substring(2, 8),
      addresses: ['https://ipfs.w3auth.io'],
      agentVersion: 'polkadot-ipfs/1.0.0',
      protocolVersion: 'ipfs/0.6.0',
      network: 'polkadot',
      note: 'Mock IPFS node for demo purposes'
    };
  }
}

// Export singleton instance
const ipfsService = new PolkadotIPFSService();

// Helper functions for direct use
const uploadToIPFS = (content, metadata) => {
  return ipfsService.uploadFile(content, metadata);
};

const uploadToIPFSWithWallet = (content, walletAddress, metadata) => {
  return ipfsService.uploadFileWithWallet(content, walletAddress, metadata);
};

const getFromIPFS = (hash) => {
  return ipfsService.getFile(hash);
};

const pinToIPFS = (hash) => {
  return ipfsService.pinContent(hash);
};

export {
  PolkadotIPFSService,
  ipfsService,
  uploadToIPFS,
  uploadToIPFSWithWallet,
  getFromIPFS,
  pinToIPFS,
  IPFS_GATEWAYS,
  W3AUTH_IPFS_CONFIG
};