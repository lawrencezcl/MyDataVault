module.exports = function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'MyDataVault API'
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
};