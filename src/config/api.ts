// API Configuration
const getApiBaseUrl = (): string => {
  // Force production mode for Vercel deployments
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  const isVercel = hostname.includes('vercel.app') || hostname.includes('vercel.dev');
  
  // Check if we're in development mode (Vite dev server)
  const isDevelopment = import.meta.env.DEV;
  
  console.log('API Config Debug:', {
    hostname,
    isLocalhost,
    isVercel,
    isDevelopment,
    env: import.meta.env
  });
  
  if (isDevelopment || isLocalhost) {
    // In development or localhost, use the local server
    return import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }
  
  if (isVercel) {
    // In Vercel production, use relative URLs (same origin)
    console.log('Using relative URLs for Vercel production');
    return '';
  }
  
  // Fallback for other production environments
  console.log('Using relative URLs for production');
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
    // Always recalculate base URL to ensure fresh detection
    const baseUrl = getApiBaseUrl();
    const fullUrl = baseUrl ? `${baseUrl}${endpoint}` : endpoint;
    console.log(`API URL for ${endpoint}: ${fullUrl}`);
    return fullUrl;
  }
};

// Runtime override for emergency fixes
export const setApiBaseUrl = (url: string) => {
  (API_CONFIG as any).baseUrl = url;
  console.log('API base URL overridden to:', url);
};