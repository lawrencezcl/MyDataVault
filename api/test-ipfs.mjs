import { PolkadotIPFSService } from './services/ipfsServiceSimple.js';

async function testIPFSUpload() {
  console.log('Testing Polkadot IPFS Service...');
  
  try {
    const ipfsService = new PolkadotIPFSService();
    
    const testContent = JSON.stringify({
      test: 'data',
      timestamp: new Date().toISOString(),
      network: 'polkadot'
    });
    
    console.log('Uploading test content...');
    const result = await ipfsService.uploadFile(testContent, {
      test: true,
      purpose: 'verification'
    });
    
    console.log('Upload successful:', result);
    
    // Test wallet upload
    console.log('Testing wallet upload...');
    const walletResult = await ipfsService.uploadFileWithWallet(
      testContent,
      '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      { test: true, wallet: true }
    );
    
    console.log('Wallet upload successful:', walletResult);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run test
testIPFSUpload();