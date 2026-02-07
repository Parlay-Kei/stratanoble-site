const fs = require('fs');
const path = require('path');

// Try multiple PDF generation approaches
async function generatePDF() {
  const mdPath = path.join(__dirname, '..', 'docs', 'Strata_Noble_Elite_Business_Plan.md');
  const pdfPath = path.join(__dirname, '..', 'docs', 'Strata_Noble_Elite_Business_Plan.pdf');
  const htmlPath = path.join(__dirname, '..', 'docs', 'Strata_Noble_Elite_Business_Plan.html');

  const markdown = fs.readFileSync(mdPath, 'utf-8');

  // Convert markdown to styled HTML
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Strata Noble Consulting - Elite Business Plan</title>
  <style>
    @page {
      margin: 0.75in;
      size: letter;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 20px;
      font-size: 11pt;
    }
    h1 {
      color: #1a365d;
      border-bottom: 3px solid #2c5282;
      padding-bottom: 10px;
      font-size: 28pt;
      text-align: center;
      margin-top: 0;
    }
    h2 {
      color: #2c5282;
      border-bottom: 2px solid #4299e1;
      padding-bottom: 5px;
      margin-top: 30px;
      font-size: 16pt;
    }
    h3 {
      color: #2b6cb0;
      margin-top: 20px;
      font-size: 13pt;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 10pt;
    }
    th, td {
      border: 1px solid #cbd5e0;
      padding: 10px 12px;
      text-align: left;
    }
    th {
      background-color: #2c5282;
      color: white;
      font-weight: 600;
    }
    tr:nth-child(even) {
      background-color: #f7fafc;
    }
    tr:hover {
      background-color: #edf2f7;
    }
    strong {
      color: #1a365d;
    }
    ul, ol {
      margin: 10px 0;
      padding-left: 25px;
    }
    li {
      margin: 5px 0;
    }
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 20px 0;
    }
    p {
      margin: 10px 0;
    }
    .header-info {
      text-align: center;
      color: #4a5568;
      margin-bottom: 30px;
    }
    code {
      background-color: #edf2f7;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 10pt;
    }
    em {
      color: #4a5568;
    }
  </style>
</head>
<body>
${convertMarkdownToHTML(markdown)}
</body>
</html>`;

  // Write HTML file
  fs.writeFileSync(htmlPath, html);
  console.log('HTML generated:', htmlPath);

  // Try to generate PDF using available tools
  try {
    // Method 1: Try puppeteer
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: pdfPath,
      format: 'Letter',
      margin: { top: '0.75in', right: '0.75in', bottom: '0.75in', left: '0.75in' },
      printBackground: true
    });
    await browser.close();
    console.log('PDF generated with Puppeteer:', pdfPath);
    return pdfPath;
  } catch (e) {
    console.log('Puppeteer not available, trying alternative...');
  }

  try {
    // Method 2: Try markdown-pdf
    const markdownpdf = require('markdown-pdf');
    await new Promise((resolve, reject) => {
      markdownpdf()
        .from(mdPath)
        .to(pdfPath, (err) => {
          if (err) reject(err);
          else resolve();
        });
    });
    console.log('PDF generated with markdown-pdf:', pdfPath);
    return pdfPath;
  } catch (e) {
    console.log('markdown-pdf not available');
  }

  // Method 3: Use Windows print to PDF via PowerShell
  console.log('\\nHTML file ready for manual PDF conversion.');
  console.log('Open in browser and use Print > Save as PDF:');
  console.log(htmlPath);

  return htmlPath;
}

function convertMarkdownToHTML(md) {
  let html = md;

  // Headers
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr>');

  // Tables
  html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
    const cells = content.split('|').map(c => c.trim());
    if (cells.every(c => /^[-:]+$/.test(c))) {
      return ''; // Skip separator row
    }
    const isHeader = !html.includes('<tbody>') && cells.some(c => c.startsWith('**'));
    const cellTag = isHeader ? 'th' : 'td';
    const cellsHtml = cells.map(c => `<${cellTag}>${c.replace(/\*\*/g, '')}</${cellTag}>`).join('');
    return `<tr>${cellsHtml}</tr>`;
  });

  // Wrap tables
  html = html.replace(/(<tr>[\s\S]*?<\/tr>\n)+/g, (match) => {
    return `<table>${match}</table>`;
  });

  // Lists
  html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
  html = html.replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>');
  html = html.replace(/(<li>.*<\/li>\n)+/g, (match) => {
    if (match.includes('1.')) {
      return `<ol>${match}</ol>`;
    }
    return `<ul>${match}</ul>`;
  });

  // Paragraphs (lines that aren't already wrapped)
  html = html.split('\n').map(line => {
    if (line.trim() &&
        !line.startsWith('<') &&
        !line.match(/^\s*$/)) {
      return `<p>${line}</p>`;
    }
    return line;
  }).join('\n');

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
}

generatePDF().catch(console.error);
