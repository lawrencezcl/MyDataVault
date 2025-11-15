// Emergency API Configuration - Forces relative URLs in production
// This file overrides the regular api.ts during build to fix localhost issues

const getApiBaseUrl = (): string => {
  // AGGRESSIVE PRODUCTION DETECTION
  try {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const protocol = typeof window !== 'undefined' ? window.location.protocol : '';
    
    // FORCE RELATIVE URLS FOR ANY NON-LOCALHOST ENVIRONMENT
    if (hostname && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
      console.log('🚨 EMERGENCY: Forcing relative URLs for hostname:', hostname);
      return '';
    }
    
    // Only use localhost for actual localhost
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      console.log('Development environment detected - using localhost');
      return 'http://localhost:3001';
    }
    
    console.log('🚨 EMERGENCY: Fallback - forcing relative URLs');
    return '';
  } catch (error) {
    console.log('🚨 EMERGENCY ERROR in getApiBaseUrl, forcing relative URLs:', error);
    return '';
  }
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
    const fullUrl = baseUrl ? `${baseUrl}${endpoint}` : endpoint;
    console.log(`🚨 EMERGENCY API URL for ${endpoint}: ${fullUrl}`);
    return fullUrl;
  }
};

// Emergency override function
export const setApiBaseUrl = (url: string) => {
  console.log('🚨 EMERGENCY OVERRIDE: Setting API base URL to:', url);
  (API_CONFIG as any).baseUrl = url;
};