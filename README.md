# Resume Builder - PDF Export Service

This is the PDF export microservice for the Resume Builder application, designed to run on Vercel as a serverless function.

## Features

- High-quality PDF generation using Puppeteer
- Optimized for Vercel serverless environment
- Professional resume formatting
- Page break optimization
- Cross-browser compatibility

## Architecture

```
pdf-export/
├── api/
│   └── export.js          # Main serverless function
├── package.json           # Dependencies
├── vercel.json           # Vercel configuration
└── README.md             # This file
```

## Dependencies

- **puppeteer-core**: Headless Chrome automation
- **@sparticuz/chromium**: Chromium binary optimized for serverless

## API Endpoint

### POST /api/export

Generates a PDF from HTML content.

**Request Body:**
```json
{
  "template": "modern",
  "data": {
    "fullName": "John Doe",
    "email": "john@example.com",
    // ... other resume data
  },
  "html": "<div class='resume-page'>...</div>"
}
```

**Response:**
- Success: PDF file download (application/pdf)
- Error: JSON error message

**Example Usage:**
```javascript
fetch('https://your-app.vercel.app/api/export', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    template: 'modern',
    data: resumeData,
    html: resumeHTML
  })
})
.then(response => response.blob())
.then(blob => {
  // Handle PDF download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'resume.pdf';
  a.click();
});
```

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

3. **Run locally:**
   ```bash
   vercel dev
   ```

4. **Test the endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/export \
     -H "Content-Type: application/json" \
     -d '{"template":"modern","data":{"fullName":"Test"},"html":"<div>Test</div>"}'
   ```

## Deployment

### Prerequisites
- GitHub account
- Vercel account (free tier works)

### Steps

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/resume-pdf-export.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import GitHub repository
   - Configure project settings
   - Deploy

3. **Get API URL:**
   After deployment, you'll get a URL like:
   `https://your-app-name.vercel.app`

## Configuration

### Environment Variables
No environment variables required - Puppeteer works out of the box on Vercel.

### Vercel Settings
The `vercel.json` file includes:
- Function timeout: 30 seconds
- Memory optimization
- CORS headers
- URL rewrites

## Performance Optimization

- Uses `@sparticuz/chromium` for smaller binary size
- Optimized PDF generation settings
- Efficient memory usage
- Fast cold start times

## Error Handling

The service includes comprehensive error handling:
- Input validation
- Puppeteer launch failures
- PDF generation errors
- Memory limitations
- Timeout handling

## Security

- CORS enabled for cross-origin requests
- Input sanitization
- No sensitive data storage
- Stateless operation

## Limitations

- Maximum function execution time: 30 seconds
- Memory limit: ~3GB
- PDF size limit: Reasonable for resumes
- Cold start latency: 1-3 seconds

## Troubleshooting

### Common Issues

1. **Function timeout:**
   - Reduce content complexity
   - Check network connectivity

2. **Memory errors:**
   - Optimize HTML/CSS
   - Reduce image sizes

3. **PDF formatting issues:**
   - Check CSS compatibility
   - Verify print styles

4. **CORS errors:**
   - Verify domain whitelist
   - Check request headers

### Debug Mode

For debugging, check Vercel function logs:
```bash
vercel logs --follow
```

## Support

For issues related to:
- PDF generation: Check Puppeteer documentation
- Vercel deployment: Check Vercel documentation
- Main application: See main project repository

## License

MIT License - See main project for details.