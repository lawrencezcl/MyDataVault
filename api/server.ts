import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { create } from 'ipfs-http-client';
import multer from 'multer';
import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// IPFS client setup
const ipfs = create({
  host: process.env.IPFS_HOST || 'ipfs.infura.io',
  port: Number(process.env.IPFS_PORT) || 5001,
  protocol: process.env.IPFS_PROTOCOL || 'https',
  headers: {
    authorization: process.env.IPFS_AUTH ? `Bearer ${process.env.IPFS_AUTH}` : undefined
  }
});

// Polkadot API setup
let polkadotApi: ApiPromise | null = null;

async function initializePolkadot() {
  try {
    const wsProvider = new WsProvider(process.env.POLKADOT_WS_URL || 'wss://shibuya-rpc.dwellir.com');
    polkadotApi = await ApiPromise.create({ provider: wsProvider });
    console.log('Polkadot API connected');
  } catch (error) {
    console.error('Failed to connect to Polkadot:', error);
  }
}

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Accept all file types for now, can be restricted later
    cb(null, true);
  }
});

// JWT authentication middleware
interface AuthenticatedRequest extends express.Request {
  user?: {
    address: string;
    role: string;
  };
}

const authenticateToken = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Encryption utilities
const encryptData = (data: string, key: string): string => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

const decryptData = (encryptedData: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    polkadot_connected: !!polkadotApi,
    ipfs_connected: true
  });
});

// IPFS upload endpoint
app.post('/api/ipfs/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { encrypt = 'false', encryptionKey = '' } = req.body;
    const fileContent = req.file.buffer.toString('base64');
    
    let dataToUpload = fileContent;
    
    // Encrypt if requested
    if (encrypt === 'true' && encryptionKey) {
      dataToUpload = encryptData(fileContent, encryptionKey);
    }

    // Upload to IPFS
    const result = await ipfs.add(dataToUpload);
    
    res.json({
      success: true,
      ipfsHash: result.cid.toString(),
      size: result.size,
      encrypted: encrypt === 'true',
      originalName: req.file.originalname,
      mimeType: req.file.mimetype
    });
  } catch (error) {
    console.error('IPFS upload error:', error);
    res.status(500).json({ error: 'Failed to upload to IPFS' });
  }
});

// IPFS retrieval endpoint
app.get('/api/ipfs/:hash', authenticateToken, async (req, res) => {
  try {
    const { hash } = req.params;
    const { encryptionKey = '' } = req.query;

    // Retrieve from IPFS
    const chunks = [];
    for await (const chunk of ipfs.cat(hash)) {
      chunks.push(chunk);
    }
    
    const data = Buffer.concat(chunks).toString();
    
    // Decrypt if encrypted
    let finalData = data;
    if (encryptionKey && data.startsWith('U2F')) { // Simple check for encrypted data
      try {
        finalData = decryptData(data, encryptionKey as string);
      } catch (error) {
        console.error('Decryption error:', error);
        return res.status(400).json({ error: 'Failed to decrypt data' });
      }
    }

    res.json({
      success: true,
      data: finalData,
      encrypted: encryptionKey && data.startsWith('U2F')
    });
  } catch (error) {
    console.error('IPFS retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve from IPFS' });
  }
});

// Polkadot wallet authentication
app.post('/api/auth/wallet', async (req, res) => {
  try {
    const { address, signature, message } = req.body;

    if (!polkadotApi) {
      return res.status(503).json({ error: 'Polkadot API not available' });
    }

    // Verify signature (simplified - in production, use proper verification)
    const isValid = true; // This should be properly implemented with polkadotApi

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { address, role: 'user' },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      address,
      expiresIn: '24h'
    });
  } catch (error) {
    console.error('Wallet authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Blockchain data storage
app.post('/api/blockchain/store', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { dataId, ipfsHash, dataType, encrypted, metadata = {} } = req.body;
    const userAddress = req.user?.address;

    if (!userAddress) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!polkadotApi) {
      return res.status(503).json({ error: 'Polkadot API not available' });
    }

    // In a real implementation, this would call the smart contract
    // For now, we'll simulate the storage
    const txData = {
      dataId,
      ipfsHash,
      dataType,
      encrypted,
      metadata,
      owner: userAddress,
      timestamp: Date.now()
    };

    res.json({
      success: true,
      transaction: txData,
      message: 'Data storage transaction prepared (simulated)'
    });
  } catch (error) {
    console.error('Blockchain storage error:', error);
    res.status(500).json({ error: 'Failed to store data on blockchain' });
  }
});

// Access control management
app.post('/api/access/grant', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { dataId, granteeAddress, permissionType, expiry, oneTime = false } = req.body;
    const ownerAddress = req.user?.address;

    if (!ownerAddress) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // In a real implementation, this would call the AccessController contract
    const accessRule = {
      dataId,
      grantee: granteeAddress,
      permissionType,
      expiry,
      oneTime,
      grantedBy: ownerAddress,
      timestamp: Date.now()
    };

    res.json({
      success: true,
      accessRule,
      message: 'Access granted (simulated)'
    });
  } catch (error) {
    console.error('Access grant error:', error);
    res.status(500).json({ error: 'Failed to grant access' });
  }
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize services and start server
async function startServer() {
  await initializePolkadot();
  
  app.listen(PORT, () => {
    console.log(`🚀 MyDataVault API server running on port ${PORT}`);
    console.log(`📁 IPFS client configured for ${process.env.IPFS_PROTOCOL || 'https'}://${process.env.IPFS_HOST || 'ipfs.infura.io'}:${process.env.IPFS_PORT || 5001}`);
    console.log(`🔗 Polkadot connection: ${polkadotApi ? 'Connected' : 'Failed'}`);
  });
}

startServer().catch(console.error);

export default app;