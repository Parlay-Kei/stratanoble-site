/**
 * Receipts API Routes
 * Handles receipt and proof pack access
 */

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const ANX_ROOT = 'C:\\Dev\\.claude-anx';
const RECEIPTS_DIR = path.join(ANX_ROOT, 'receipts');

// GET /api/receipts - List recent receipts
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const receipts = [];

    // Read receipts directory
    const files = await fs.readdir(RECEIPTS_DIR);

    // Filter for .md files
    const mdFiles = files.filter(f => f.endsWith('.md'));

    // Get file stats and sort by modified time
    const fileStats = await Promise.all(
      mdFiles.map(async (file) => {
        const filePath = path.join(RECEIPTS_DIR, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          modified: stats.mtime,
          created: stats.birthtime
        };
      })
    );

    // Sort by modified time (newest first)
    fileStats.sort((a, b) => b.modified - a.modified);

    // Limit results
    const limitedFiles = fileStats.slice(0, limit);

    // Read first few lines of each file for preview
    for (const file of limitedFiles) {
      try {
        const content = await fs.readFile(file.path, 'utf-8');
        const lines = content.split('\n').slice(0, 5);
        receipts.push({
          name: file.name,
          modified: file.modified,
          size: file.size,
          preview: lines.join('\n')
        });
      } catch (err) {
        receipts.push({
          name: file.name,
          modified: file.modified,
          size: file.size,
          preview: 'Unable to read file'
        });
      }
    }

    res.json({
      receipts,
      total: mdFiles.length,
      showing: receipts.length
    });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
});

// GET /api/receipts/:filename - Get specific receipt content
router.get('/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;

    // Sanitize filename
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = path.join(RECEIPTS_DIR, filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const stats = await fs.stat(filePath);

    res.json({
      filename,
      content,
      size: stats.size,
      modified: stats.mtime,
      created: stats.birthtime
    });
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({ error: 'Failed to fetch receipt' });
  }
});

// POST /api/receipts - Create a new receipt
router.post('/', async (req, res) => {
  try {
    const { filename, content } = req.body;

    if (!filename || !content) {
      return res.status(400).json({ error: 'Filename and content are required' });
    }

    // Sanitize filename
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    // Ensure .md extension
    const finalFilename = filename.endsWith('.md') ? filename : `${filename}.md`;
    const filePath = path.join(RECEIPTS_DIR, finalFilename);

    // Check if file exists
    try {
      await fs.access(filePath);
      return res.status(409).json({ error: 'Receipt already exists' });
    } catch {
      // File doesn't exist, good to proceed
    }

    // Write receipt
    await fs.writeFile(filePath, content, 'utf-8');

    res.status(201).json({
      filename: finalFilename,
      path: filePath,
      size: Buffer.byteLength(content, 'utf-8')
    });
  } catch (error) {
    console.error('Error creating receipt:', error);
    res.status(500).json({ error: 'Failed to create receipt' });
  }
});

module.exports = router;