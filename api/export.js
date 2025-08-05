// Debug version - Test Puppeteer imports
export default async function handler(req, res) {
  console.log('Function started');
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Testing imports...');
    
    // Test import puppeteer-core
    const puppeteer = await import('puppeteer-core');
    console.log('Puppeteer imported successfully');
    
    // Test import chromium
    const chromium = await import('@sparticuz/chromium');
    console.log('Chromium imported successfully');
    
    // Test getting executable path
    const executablePath = await chromium.default.executablePath();
    console.log('Executable path:', executablePath);
    
    return res.status(200).json({
      success: true,
      message: 'All imports working!',
      puppeteer: !!puppeteer,
      chromium: !!chromium,
      executablePath: executablePath ? 'Found' : 'Not found',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Import error:', error);
    return res.status(500).json({
      error: 'Import failed',
      details: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}
