// API Configuration
const getApiBaseUrl = (): string => {
  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV;
  
  // Check if we're in Vercel production (no localhost in URL)
  const isVercelProduction = !isDevelopment && !window.location.hostname.includes('localhost');
  
  if (isDevelopment) {
    // In development, use the local server
    return import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }
  
  if (isVercelProduction) {
    // In Vercel production, use relative URLs (same origin)
    return '';
  }
  
  // Fallback for other production environments
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