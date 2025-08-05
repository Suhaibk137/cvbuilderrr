# Add Puppeteer Back - Generate Real PDFs

## 🎉 Great Progress!
- ✅ API connection working
- ✅ File downloading as "John Doe_Resume.pdf"
- 🔧 Need to generate actual PDF instead of JSON

## 📝 Update export.js with Real PDF Generation

Go back to GitHub and replace your `api/export.js` with this complete version:

```javascript
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export default async function handler(req, res) {
  console.log('PDF Export function called:', req.method);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Use POST to generate PDF'
    });
  }

  let browser = null;

  try {
    console.log('Processing PDF request...');
    
    const { template, data, html } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    // Create complete HTML document with embedded CSS
    const completeHtml = createCompleteHTML(html, data);

    console.log('Launching browser...');
    
    // Launch browser with Vercel-optimized settings
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 1
    });

    console.log('Setting page content...');
    
    // Set content and wait for fonts
    await page.setContent(completeHtml, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 25000
    });

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');

    console.log('Generating PDF...');

    // Generate PDF with professional settings
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      margin: {
        top: '0.75in',
        right: '0.75in',
        bottom: '0.75in',
        left: '0.75in'
      },
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: false,
      scale: 1.0,
      omitBackground: false,
      timeout: 25000
    });

    await browser.close();
    browser = null;

    console.log('PDF generated successfully, size:', pdfBuffer.length);

    // Set response headers for PDF download
    const filename = sanitizeFilename(data?.fullName || 'Resume') + '_Resume.pdf';
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error('PDF generation error:', error);
    
    if (browser) {
      await browser.close();
    }
    
    return res.status(500).json({ 
      error: 'PDF generation failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

function createCompleteHTML(resumeHTML, data) {
  const printCSS = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      color: #000 !important;
    }
    
    body {
      font-family: 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #000;
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .resume-page {
      width: 100%;
      min-height: auto;
      margin: 0;
      padding: 0;
      background: white;
    }
    
    .resume-header {
      text-align: center;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1pt solid #000;
    }
    
    .name {
      font-size: 24pt;
      font-weight: bold;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
    }
    
    .contact-info {
      font-size: 10pt;
      color: #333;
      line-height: 1.3;
    }
    
    .contact-row {
      margin-bottom: 0.25rem;
    }
    
    .separator {
      margin: 0 0.5rem;
    }
    
    .resume-section {
      margin-bottom: 1.2rem;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1pt;
      margin-bottom: 0.6rem;
      padding-bottom: 0.2rem;
      border-bottom: 0.5pt solid #666;
      page-break-after: avoid;
    }
    
    .section-content {
      margin-left: 0.25rem;
    }
    
    .summary-text {
      text-align: justify;
      font-size: 11pt;
      line-height: 1.4;
      margin-bottom: 0.5rem;
    }
    
    .experience-item, .project-item, .education-item {
      margin-bottom: 1rem;
      page-break-inside: avoid;
    }
    
    .job-title, .project-title, .degree-title {
      font-weight: bold;
      font-size: 11pt;
      color: #000;
    }
    
    .company-info, .school-info {
      font-size: 10pt;
      color: #333;
      margin-top: 0.2rem;
    }
    
    .company-name, .school-name {
      font-style: italic;
      margin-right: 1rem;
      float: left;
    }
    
    .date-location, .education-year {
      float: right;
    }
    
    .experience-description, .education-details {
      clear: both;
      margin-top: 0.3rem;
    }
    
    ul {
      margin-left: 1rem;
      padding-left: 0;
      list-style-type: disc;
    }
    
    li {
      margin-bottom: 0.2rem;
      font-size: 10pt;
      line-height: 1.3;
    }
    
    .skill-category {
      margin-bottom: 0.4rem;
      font-size: 10pt;
    }
    
    .skill-category-name {
      font-weight: bold;
    }
    
    .project-tech {
      font-size: 9pt;
      color: #666;
      font-style: italic;
      margin-top: 0.1rem;
    }
    
    .certification-item, .language-item, .volunteer-item {
      margin-bottom: 0.3rem;
      font-size: 10pt;
    }
    
    .languages-list {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .volunteer-role {
      font-weight: bold;
    }
    
    .volunteer-org {
      font-style: italic;
      color: #333;
    }
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume - ${escapeHtml(data?.fullName || 'Resume')}</title>
    <style>${printCSS}</style>
</head>
<body>
    ${resumeHTML}
</body>
</html>`;
}

function sanitizeFilename(filename) {
  if (!filename) return 'Resume';
  return filename.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || 'Resume';
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

## 🔄 Update Steps

1. **Go to GitHub** - your cvbuilderrr repository
2. **Switch to pdf-export branch**
3. **Navigate to api/export.js**
4. **Click Edit**
5. **Replace ALL content** with the code above
6. **Commit message:** "Add Puppeteer PDF generation - full version"
7. **Commit changes**
8. **Wait 2-3 minutes** for deployment
9. **Test PDF export** in your app

## 🎯 Expected Result

Now you should get a **real, properly formatted PDF** that opens correctly in your PDF viewer!

The PDF will have:
- ✅ Professional formatting
- ✅ Proper fonts and spacing  
- ✅ Clean layout
- ✅ All resume content
