/**
 * PDF Generation Instructions for Developer Compensation Documentation
 *
 * This file provides instructions and utilities for converting the markdown
 * documentation to PDF format for investor data rooms and board presentations.
 *
 * Directory: C:\Dev\.claude-anx\Direct-Cuts-Artifacts\mobile_parity_v1\
 *
 * Documents to convert:
 * - DEVELOPER_COMPENSATION_MEMO.md (Full 10-page memorandum)
 * - DEVELOPER_COMPENSATION_EXECUTIVE_SUMMARY.md (1-page summary)
 * - DEVELOPER_COMPENSATION_DATA_ROOM_TABLE.md (Financial tables)
 */

// =============================================================================
// OPTION 1: VS Code Extensions (Recommended for Quick Conversion)
// =============================================================================

/**
 * VS Code Markdown PDF Extension
 *
 * 1. Install extension: "Markdown PDF" by yzane
 *    - Open VS Code Extensions (Ctrl+Shift+X)
 *    - Search "Markdown PDF"
 *    - Install the extension by yzane
 *
 * 2. Open a markdown file in VS Code
 *
 * 3. Right-click in the editor and select:
 *    - "Markdown PDF: Export (pdf)" for single file
 *    - Or use Command Palette (Ctrl+Shift+P) -> "Markdown PDF: Export (pdf)"
 *
 * 4. PDF will be generated in the same directory
 *
 * Settings (add to VS Code settings.json):
 * {
 *   "markdown-pdf.displayHeaderFooter": true,
 *   "markdown-pdf.headerTemplate": "<div style='font-size:8px;margin-left:1cm;'>Direct Cuts - Confidential</div>",
 *   "markdown-pdf.footerTemplate": "<div style='font-size:8px;margin-left:1cm;'><span class='pageNumber'></span>/<span class='totalPages'></span></div>",
 *   "markdown-pdf.margin.top": "2cm",
 *   "markdown-pdf.margin.bottom": "2cm",
 *   "markdown-pdf.margin.left": "2cm",
 *   "markdown-pdf.margin.right": "2cm"
 * }
 */

// =============================================================================
// OPTION 2: Pandoc (Command Line - Professional Quality)
// =============================================================================

/**
 * Pandoc Installation:
 *
 * Windows (using Chocolatey):
 *   choco install pandoc
 *   choco install miktex  # For PDF generation via LaTeX
 *
 * Windows (using Winget):
 *   winget install pandoc
 *
 * Manual: Download from https://pandoc.org/installing.html
 */

// Pandoc commands to run in terminal:
const pandocCommands = {
  memo: `pandoc "C:\\Dev\\.claude-anx\\Direct-Cuts-Artifacts\\mobile_parity_v1\\DEVELOPER_COMPENSATION_MEMO.md" -o "C:\\Dev\\.claude-anx\\Direct-Cuts-Artifacts\\mobile_parity_v1\\DEVELOPER_COMPENSATION_MEMO.pdf" --pdf-engine=xelatex -V geometry:margin=1in -V documentclass=report --toc`,

  summary: `pandoc "C:\\Dev\\.claude-anx\\Direct-Cuts-Artifacts\\mobile_parity_v1\\DEVELOPER_COMPENSATION_EXECUTIVE_SUMMARY.md" -o "C:\\Dev\\.claude-anx\\Direct-Cuts-Artifacts\\mobile_parity_v1\\DEVELOPER_COMPENSATION_EXECUTIVE_SUMMARY.pdf" --pdf-engine=xelatex -V geometry:margin=1in`,

  tables: `pandoc "C:\\Dev\\.claude-anx\\Direct-Cuts-Artifacts\\mobile_parity_v1\\DEVELOPER_COMPENSATION_DATA_ROOM_TABLE.md" -o "C:\\Dev\\.claude-anx\\Direct-Cuts-Artifacts\\mobile_parity_v1\\DEVELOPER_COMPENSATION_DATA_ROOM_TABLE.pdf" --pdf-engine=xelatex -V geometry:margin=0.75in -V fontsize=10pt`,

  // Combined document
  combined: `pandoc "C:\\Dev\\.claude-anx\\Direct-Cuts-Artifacts\\mobile_parity_v1\\DEVELOPER_COMPENSATION_EXECUTIVE_SUMMARY.md" "C:\\Dev\\.claude-anx\\Direct-Cuts-Artifacts\\mobile_parity_v1\\DEVELOPER_COMPENSATION_MEMO.md" "C:\\Dev\\.claude-anx\\Direct-Cuts-Artifacts\\mobile_parity_v1\\DEVELOPER_COMPENSATION_DATA_ROOM_TABLE.md" -o "C:\\Dev\\.claude-anx\\Direct-Cuts-Artifacts\\mobile_parity_v1\\DEVELOPER_COMPENSATION_COMPLETE.pdf" --pdf-engine=xelatex -V geometry:margin=1in --toc`
};

// =============================================================================
// OPTION 3: Online Tools (No Installation Required)
// =============================================================================

/**
 * Recommended Online Converters:
 *
 * 1. Dillinger (https://dillinger.io/)
 *    - Paste markdown content
 *    - Export -> PDF
 *    - Free, no signup required
 *
 * 2. StackEdit (https://stackedit.io/)
 *    - Import markdown file
 *    - Export as PDF
 *    - Better formatting options
 *
 * 3. MD2PDF (https://md2pdf.netlify.app/)
 *    - Upload .md file directly
 *    - Instant PDF download
 *
 * 4. Markdown to PDF (https://www.markdowntopdf.com/)
 *    - Simple drag-and-drop interface
 *    - No signup required
 *
 * CAUTION: For confidential documents, consider using local tools
 * (VS Code or Pandoc) instead of online converters.
 */

// =============================================================================
// OPTION 4: Node.js Script (Automated)
// =============================================================================

/**
 * For automated PDF generation, install md-to-pdf:
 *
 *   npm install -g md-to-pdf
 *
 * Then run:
 *   md-to-pdf DEVELOPER_COMPENSATION_MEMO.md
 *   md-to-pdf DEVELOPER_COMPENSATION_EXECUTIVE_SUMMARY.md
 *   md-to-pdf DEVELOPER_COMPENSATION_DATA_ROOM_TABLE.md
 */

// Automated script using md-to-pdf
async function generatePDFs() {
  const { mdToPdf } = require('md-to-pdf');
  const path = require('path');

  const baseDir = 'C:\\Dev\\.claude-anx\\Direct-Cuts-Artifacts\\mobile_parity_v1';

  const files = [
    'DEVELOPER_COMPENSATION_MEMO.md',
    'DEVELOPER_COMPENSATION_EXECUTIVE_SUMMARY.md',
    'DEVELOPER_COMPENSATION_DATA_ROOM_TABLE.md'
  ];

  const options = {
    stylesheet: [],
    css: `
      body { font-family: 'Segoe UI', Arial, sans-serif; }
      table { border-collapse: collapse; width: 100%; margin: 1em 0; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f5f5f5; }
      h1 { color: #333; border-bottom: 2px solid #333; }
      h2 { color: #444; }
      code { background-color: #f5f5f5; padding: 2px 4px; }
    `,
    pdf_options: {
      format: 'Letter',
      margin: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div style="font-size:8px;margin-left:1cm;">Direct Cuts - Confidential</div>',
      footerTemplate: '<div style="font-size:8px;margin-left:1cm;"><span class="pageNumber"></span> of <span class="totalPages"></span></div>'
    }
  };

  for (const file of files) {
    const inputPath = path.join(baseDir, file);
    const outputPath = inputPath.replace('.md', '.pdf');

    console.log(`Converting: ${file}`);

    try {
      await mdToPdf({ path: inputPath }, options).then(pdf => {
        require('fs').writeFileSync(outputPath, pdf.content);
        console.log(`  -> Created: ${outputPath}`);
      });
    } catch (error) {
      console.error(`  -> Error: ${error.message}`);
    }
  }

  console.log('\nPDF generation complete!');
}

// =============================================================================
// BATCH SCRIPT (Windows)
// =============================================================================

/**
 * Create a batch file (generate-pdfs.bat) with:
 *
 * @echo off
 * echo Generating PDFs for Developer Compensation Documentation...
 *
 * cd /d "C:\Dev\.claude-anx\Direct-Cuts-Artifacts\mobile_parity_v1"
 *
 * echo Converting DEVELOPER_COMPENSATION_MEMO.md...
 * pandoc DEVELOPER_COMPENSATION_MEMO.md -o DEVELOPER_COMPENSATION_MEMO.pdf --pdf-engine=xelatex -V geometry:margin=1in --toc
 *
 * echo Converting DEVELOPER_COMPENSATION_EXECUTIVE_SUMMARY.md...
 * pandoc DEVELOPER_COMPENSATION_EXECUTIVE_SUMMARY.md -o DEVELOPER_COMPENSATION_EXECUTIVE_SUMMARY.pdf --pdf-engine=xelatex -V geometry:margin=1in
 *
 * echo Converting DEVELOPER_COMPENSATION_DATA_ROOM_TABLE.md...
 * pandoc DEVELOPER_COMPENSATION_DATA_ROOM_TABLE.md -o DEVELOPER_COMPENSATION_DATA_ROOM_TABLE.pdf --pdf-engine=xelatex -V geometry:margin=0.75in -V fontsize=10pt
 *
 * echo.
 * echo PDF generation complete!
 * pause
 */

// =============================================================================
// USAGE INSTRUCTIONS
// =============================================================================

console.log(`
===============================================================================
DEVELOPER COMPENSATION DOCUMENTATION - PDF GENERATION
===============================================================================

Source Files (Markdown):
  - DEVELOPER_COMPENSATION_MEMO.md           (Full memorandum)
  - DEVELOPER_COMPENSATION_EXECUTIVE_SUMMARY.md (1-page summary)
  - DEVELOPER_COMPENSATION_DATA_ROOM_TABLE.md   (Financial tables)

Location: C:\\Dev\\.claude-anx\\Direct-Cuts-Artifacts\\mobile_parity_v1\\

CONVERSION OPTIONS:

1. VS Code (Easiest):
   - Install "Markdown PDF" extension
   - Open file -> Right-click -> "Markdown PDF: Export (pdf)"

2. Pandoc (Best Quality):
   - Install: choco install pandoc miktex
   - Run: pandoc [input.md] -o [output.pdf] --pdf-engine=xelatex

3. Online Tools:
   - https://dillinger.io/ (paste content)
   - https://md2pdf.netlify.app/ (upload file)

4. Node.js (Automated):
   - npm install -g md-to-pdf
   - md-to-pdf [filename.md]

RECOMMENDED FOR INVESTOR DATA ROOM:
  Use Pandoc or VS Code for confidential documents.
  Generate all three PDFs and include in data room folder.

===============================================================================
`);

// Export for programmatic use
module.exports = { generatePDFs, pandocCommands };
