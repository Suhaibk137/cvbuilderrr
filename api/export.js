// Simplified PDF Export Function
export default async function handler(req, res) {
  console.log('PDF Export function called:', req.method);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests for PDF generation
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      method: req.method,
      message: 'Use POST to generate PDF'
    });
  }

  try {
    console.log('Processing PDF request...');
    
    // For now, return success without generating PDF (test mode)
    return res.status(200).json({ 
      success: true,
      message: 'PDF service is working!',
      timestamp: new Date().toISOString(),
      note: 'Test mode - Puppeteer disabled temporarily'
    });
    
  } catch (error) {
    console.error('PDF Export Error:', error);
    return res.status(500).json({ 
      error: 'PDF generation failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
