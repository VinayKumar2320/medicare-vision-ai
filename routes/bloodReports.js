import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../config/multer.js';
import { getBloodReportsByUserId, createBloodReport, deleteBloodReport } from '../config/database.js';
import { parseBloodReportText } from '../services/bloodReportParser.js';
import Tesseract from 'tesseract.js';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Get all blood reports for the authenticated user
router.get('/', authenticateToken, (req, res) => {
  try {
    const reports = getBloodReportsByUserId(req.user.id);
    res.json({ success: true, data: reports });
  } catch (err) {
    console.error('Get blood reports error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch blood reports' });
  }
});

// Upload blood report document and extract data with OCR
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file provided' });

    const filePath = req.file.path;
    const fileUrl = `/uploads/${req.file.filename}`;
    const isPDF = req.file.mimetype === 'application/pdf';

    let text = '';
    let imagePath = filePath;
    
    // Convert PDF to image if needed (Tesseract doesn't support PDFs directly)
    if (isPDF) {
      try {
        console.log('📄 PDF file detected. Converting first page to image...');
        const imageOutputPath = join(__dirname, '..', 'uploads', `${req.file.filename}-page1.png`);
        
        // Convert first page of PDF to PNG
        await sharp(filePath, { pages: 1 })
          .png()
          .toFile(imageOutputPath);
        
        imagePath = imageOutputPath;
        console.log('✅ PDF converted to image:', imageOutputPath);
      } catch (pdfErr) {
        console.error('❌ PDF conversion failed:', pdfErr.message);
        console.warn('⚠️ PDF conversion not available. File will be stored without OCR extraction.');
        // Continue without OCR for PDFs if conversion fails
      }
    }
    
    // Try to run OCR on the image
    if (!isPDF || (isPDF && imagePath !== filePath)) {
      try {
        console.log('📸 Starting OCR on blood report:', req.file.filename);
        const { data: { text: ocrText } } = await Tesseract.recognize(imagePath, 'eng', {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        });
        text = ocrText;
        console.log('✅ OCR completed. Extracted text length:', text.length);
        console.log('📄 Extracted text preview:', text.substring(0, 500));
        
        // Clean up temporary converted image if it was a PDF
        if (isPDF && imagePath !== filePath && fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('🧹 Cleaned up temporary converted image');
        }
      } catch (ocrErr) {
        console.error('❌ OCR failed:', ocrErr.message);
        console.warn('⚠️ Continuing without text extraction');
        text = '';
        
        // Clean up temporary converted image on error
        if (isPDF && imagePath !== filePath && fs.existsSync(imagePath)) {
          try {
            fs.unlinkSync(imagePath);
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      }
    } else {
      console.log('📄 PDF file detected but conversion failed. File will be stored for manual review.');
    }

    // Parse the extracted text to find blood test results
    const parsed = parseBloodReportText(text);
    console.log('📋 Parsed blood report data:', parsed);

    // Create blood report records for each test found
    const createdReports = [];
    if (parsed.tests && parsed.tests.length > 0) {
      for (const test of parsed.tests) {
        const reportId = randomUUID();
        createBloodReport(
          reportId,
          req.user.id,
          parsed.testDate,
          test.testName,
          test.value,
          test.unit,
          test.normalRange,
          test.status,
          fileUrl,
          text
        );
        createdReports.push({
          id: reportId,
          testDate: parsed.testDate,
          testName: test.testName,
          value: test.value,
          unit: test.unit,
          normalRange: test.normalRange,
          status: test.status,
          fileUrl: fileUrl
        });
      }
    } else {
      // If no tests were parsed, create a single record with the file
      const reportId = randomUUID();
      createBloodReport(
        reportId,
        req.user.id,
        parsed.testDate,
        'Blood Report',
        'See document',
        '',
        '',
        'Normal',
        fileUrl,
        text
      );
      createdReports.push({
        id: reportId,
        testDate: parsed.testDate,
        testName: 'Blood Report',
        value: 'See document',
        unit: '',
        normalRange: '',
        status: 'Normal',
        fileUrl: fileUrl
      });
    }

    return res.json({
      success: true,
      data: {
        reports: createdReports,
        extractedText: text,
        ocrAvailable: text.length > 0,
        testsFound: parsed.tests?.length || 0
      }
    });
  } catch (err) {
    console.error('Upload blood report error:', err);
    res.status(500).json({ success: false, error: 'Failed to process file: ' + err.message });
  }
});

// Delete a blood report
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    deleteBloodReport(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete blood report error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete blood report' });
  }
});

export default router;

