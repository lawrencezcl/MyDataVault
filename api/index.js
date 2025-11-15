// Simple Vercel serverless function
module.exports = (req, res) => {
  res.status(200).json({ 
    message: 'MyDataVault API is working!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
};