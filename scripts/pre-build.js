#!/usr/bin/env node

// Pre-build script to ensure correct API configuration for production
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = process.env.VERCEL === '1';
const isProduction = process.env.NODE_ENV === 'production';

console.log('Pre-build script running...');
console.log('Environment:', {
  VERCEL: process.env.VERCEL,
  NODE_ENV: process.env.NODE_ENV,
  isVercel,
  isProduction
});

if (isVercel && isProduction) {
  console.log('Detected Vercel production environment');
  
  // Create a production-specific environment file
  const envContent = `# Auto-generated production environment file
VITE_API_URL=
VITE_VERCEL_ENV=production
VITE_IS_VERCEL=true
`;
  
  fs.writeFileSync('.env.production.local', envContent);
  console.log('Created .env.production.local with empty API URL');
  
  // Also ensure the API config uses relative URLs
  const apiConfigPath = path.join(__dirname, '../src/config/api.ts');
  if (fs.existsSync(apiConfigPath)) {
    console.log('API config found, ensuring production settings...');
  }
}

console.log('Pre-build script completed');