export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('Testing Puppeteer imports...');
    
    // Test dynamic imports
    const puppeteer = await import('puppeteer-core');
    const chromium = await import('@sparticuz/chromium');
    
    console.log('Puppeteer imported:', !!puppeteer.default);
    console.log('Chromium imported:', !!chromium.default);
    
    // Test executable path
    const executablePath = await chromium.default.executablePath();
    console.log('Executable path found:', !!executablePath);
    
    return res.status(200).json({
      success: true,
      message: 'Puppeteer imports working!',
      puppeteer: !!puppeteer.default,
      chromium: !!chromium.default,
      executablePath: !!executablePath,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Import error:', error);
    return res.status(200).json({
      success: false,
      error: 'Import failed',
      details: error.message,
      stack: error.stack?.substring(0, 500),
      timestamp: new Date().toISOString()
    });
  }
}
