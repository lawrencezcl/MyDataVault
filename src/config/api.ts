// API Configuration
const getApiBaseUrl = (): string => {
  // In development, use the local server
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }
  
  // In production, use the current domain (same origin)
  // This works for Vercel deployments where frontend and API are on the same domain
  return '';
};

export const API_CONFIG = {
  baseUrl: getApiBaseUrl(),
  endpoints: {
    ipfsUpload: '/api/ipfs/upload',
    authWallet: '/api/auth/wallet',
    blockchainStore: '/api/blockchain/store',
    health: '/api/health',
  },
  getFullUrl: (endpoint: string): string => {
    const baseUrl = getApiBaseUrl();
    return baseUrl ? `${baseUrl}${endpoint}` : endpoint;
  }
};