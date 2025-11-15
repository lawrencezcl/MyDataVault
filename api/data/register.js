export default function handler(req, res) {
  if (req.method === 'POST') {
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

      res.status(200).json({
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
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}