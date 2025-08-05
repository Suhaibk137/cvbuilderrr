export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Always return JSON (never PDF)
  return res.status(200).json({
    status: 'API is working!',
    method: req.method,
    timestamp: new Date().toISOString(),
    message: 'This should appear as JSON, not download a PDF'
  });
}
