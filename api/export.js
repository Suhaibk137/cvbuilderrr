// pdf-export/api/export.js
// Vercel Serverless Function for PDF Export

import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  // Handle CORS
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
    const { template, data, html } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    // Generate PDF
    const pdfBuffer = await generatePDF(html, data);

    if (!pdfBuffer) {
      throw new Error('Failed to generate PDF');
    }

    // Set response headers for PDF download
    const filename = sanitizeFilename(data?.fullName || 'Resume') + '_Resume.pdf';
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error('PDF generation error:', error);
    return res.status(500).json({ 
      error: 'PDF generation failed', 
      details: error.message 
    });
  }
}

async function generatePDF(resumeHTML, data) {
  let browser = null;

  try {
    // Get the CSS content
    const printCSS = getPrintCSS();
    
    // Create complete HTML document
    const completeHtml = createCompleteHTML(resumeHTML, data, printCSS);

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

    // Set content and wait for fonts
    await page.setContent(completeHtml, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    });

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');

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
      timeout: 30000
    });

    return pdfBuffer;

  } catch (error) {
    console.error('Error in generatePDF:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function createCompleteHTML(resumeHTML, data, printCSS) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume - ${escapeHtml(data?.fullName || 'Resume')}</title>
    <style>
        /* Reset for consistent PDF output */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        /* Puppeteer-optimized print styles */
        ${printCSS}
        
        /* Additional PDF-specific optimizations */
        body {
            margin: 0;
            padding: 0;
            background: white;
            color: #000;
            font-family: 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.4;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        /* Ensure proper text rendering */
        * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            color: #000 !important;
        }
        
        /* Ensure borders are visible in PDF */
        .section-title {
            border-bottom: 0.5pt solid #000 !important;
        }
        
        .resume-header {
            border-bottom: 1pt solid #000 !important;
        }
    </style>
</head>
<body>
    ${resumeHTML}
</body>
</html>`;
}

function getPrintCSS() {
  // Inline the print.css content here since we can't read files easily in Vercel
  return `
/* =====================================================
   PUPPETEER-OPTIMIZED STYLES FOR PDF EXPORT
   ===================================================== */

.resume-page {
    width: 100%;
    min-height: auto;
    margin: 0;
    padding: 0;
    background: white;
    font-family: 'Times New Roman', serif;
    font-size: 11pt;
    line-height: 1.4;
    color: #000;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    orphans: 3;
    widows: 3;
}

/* PAGE BREAK CONTROL */
.avoid-break,
.resume-section,
.experience-item,
.education-item,
.project-item,
.certification-item,
.volunteer-item,
.skill-category {
    page-break-inside: avoid;
    break-inside: avoid;
    overflow: visible;
}

.section-title {
    page-break-after: avoid;
    break-after: avoid;
    orphans: 3;
}

.experience-header,
.project-header,
.education-header {
    page-break-after: avoid;
    break-after: avoid;
}

/* Resume Header */
.resume-header {
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    text-align: center;
}

.name {
    font-size: 24pt;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #000;
    letter-spacing: 0.5pt;
    text-transform: uppercase;
    line-height: 1.2;
}

.contact-info {
    font-size: 10pt;
    color: #333;
    line-height: 1.3;
}

.contact-row {
    margin-bottom: 0.25rem;
}

.contact-item {
    margin-right: 0.5rem;
}

.separator {
    margin: 0 0.5rem;
    color: #666;
}

/* Section Spacing */
.resume-section {
    margin-bottom: 1.2rem;
    margin-top: 0;
}

.section-title {
    font-size: 12pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1pt;
    margin-bottom: 0.6rem;
    margin-top: 0;
    padding-bottom: 0.2rem;
    border-bottom: 0.5pt solid #666;
    color: #000;
    line-height: 1.2;
}

.section-content {
    margin-left: 0.25rem;
}

/* Content Elements */
.summary-text {
    text-align: justify;
    font-size: 11pt;
    line-height: 1.4;
    margin-bottom: 0.5rem;
    color: #000;
}

.experience-item {
    margin-bottom: 1rem;
    margin-top: 0;
}

.job-title {
    font-weight: bold;
    font-size: 11pt;
    color: #000;
    line-height: 1.2;
}

.company-info {
    font-size: 10pt;
    color: #333;
    margin-top: 0.2rem;
    overflow: hidden;
}

.company-name {
    font-style: italic;
    margin-right: 1rem;
    float: left;
}

.date-location {
    float: right;
    text-align: right;
}

.experience-description {
    clear: both;
    margin-top: 0.3rem;
}

.experience-description ul {
    margin-left: 1rem;
    padding-left: 0;
    list-style-type: disc;
    margin-bottom: 0;
}

.experience-description li {
    margin-bottom: 0.2rem;
    font-size: 10pt;
    line-height: 1.3;
    color: #000;
}

/* Education Items */
.education-item {
    margin-bottom: 0.8rem;
    margin-top: 0;
}

.degree-title {
    font-weight: bold;
    font-size: 11pt;
    color: #000;
    line-height: 1.2;
}

.school-info {
    font-size: 10pt;
    color: #333;
    margin-top: 0.2rem;
    overflow: hidden;
}

.school-name {
    font-style: italic;
    margin-right: 1rem;
    float: left;
}

.education-year {
    float: right;
}

.education-details {
    clear: both;
    margin-top: 0.2rem;
    font-size: 10pt;
    color: #555;
}

/* Skills Section */
.skill-category {
    margin-bottom: 0.4rem;
    font-size: 10pt;
    line-height: 1.3;
}

.skill-category-name {
    font-weight: bold;
    color: #000;
}

.skill-list {
    color: #333;
}

/* Projects */
.project-item {
    margin-bottom: 1rem;
    margin-top: 0;
}

.project-title {
    font-weight: bold;
    font-size: 11pt;
    color: #000;
    line-height: 1.2;
}

.project-tech {
    font-size: 9pt;
    color: #666;
    font-style: italic;
    margin-top: 0.1rem;
    line-height: 1.2;
}

.project-description {
    margin: 0.3rem 0;
    font-size: 10pt;
    line-height: 1.3;
    color: #000;
}

.project-highlights ul {
    margin-left: 1rem;
    padding-left: 0;
    list-style-type: disc;
    margin-bottom: 0;
}

.project-highlights li {
    margin-bottom: 0.2rem;
    font-size: 10pt;
    line-height: 1.3;
    color: #000;
}

/* Optional Sections */
.certification-item,
.language-item,
.volunteer-item {
    margin-bottom: 0.3rem;
    font-size: 10pt;
    color: #000;
}

.languages-list {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.volunteer-role {
    font-weight: bold;
    color: #000;
}

.volunteer-org {
    font-style: italic;
    color: #333;
}

.volunteer-period {
    font-size: 9pt;
    color: #666;
    margin-bottom: 0.2rem;
}

.volunteer-description {
    font-size: 10pt;
    line-height: 1.3;
    color: #000;
}
`;
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