// API Configuration
const getApiBaseUrl = (): string => {
  // Force production mode for Vercel deployments
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  const isVercel = hostname.includes('vercel.app') || hostname.includes('vercel.dev');
  
  // Check if we're in development mode (Vite dev server)
  const isDevelopment = import.meta.env.DEV;
  
  // Check for production environment variables
  const viteApiUrl = import.meta.env.VITE_API_URL;
  const isVercelEnv = import.meta.env.VERCEL === '1';
  
  console.log('API Config Debug:', {
    hostname,
    isLocalhost,
    isVercel,
    isDevelopment,
    viteApiUrl,
    isVercelEnv,
    env: import.meta.env
  });
  
  // Force relative URLs in production
  if (!isDevelopment && !isLocalhost) {
    console.log('Production environment detected - using relative URLs');
    return '';
  }
  
  if (isDevelopment || isLocalhost) {
    // In development or localhost, use the local server
    return viteApiUrl || 'http://localhost:3001';
  }
  
  // Fallback - should not reach here due to production check above
  console.log('Fallback - using relative URLs');
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