#!/usr/bin/env node

// Emergency build fix - replaces API config with production version
const fs = require('fs');
const path = require('path');

console.log('🚨 EMERGENCY BUILD FIX RUNNING...');

// Check if we're in production/Vercel environment
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV === 'production';

console.log('Build environment:', {
  NODE_ENV: process.env.NODE_ENV,
  VERCEL: process.env.VERCEL,
  VERCEL_ENV: process.env.VERCEL_ENV,
  isProduction,
  isVercel
});

if (isProduction || isVercel) {
  console.log('🚨 PRODUCTION DETECTED - Applying emergency API fix');
  
  const originalApiFile = path.join(__dirname, '../src/config/api.ts');
  const emergencyApiFile = path.join(__dirname, '../src/config/api.emergency.ts');
  const backupApiFile = path.join(__dirname, '../src/config/api.backup.ts');
  
  try {
    // Backup original file
    if (fs.existsSync(originalApiFile)) {
      console.log('Backing up original api.ts');
      fs.copyFileSync(originalApiFile, backupApiFile);
    }
    
    // Replace with emergency version
    if (fs.existsSync(emergencyApiFile)) {
      console.log('Replacing api.ts with emergency version');
      fs.copyFileSync(emergencyApiFile, originalApiFile);
      console.log('✅ Emergency API fix applied');
    } else {
      console.log('❌ Emergency API file not found');
    }
  } catch (error) {
    console.error('❌ Error applying emergency fix:', error);
  }
} else {
  console.log('Development environment - no emergency fix needed');
}

console.log('🚨 EMERGENCY BUILD FIX COMPLETED');