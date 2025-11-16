import express from 'express';
import { randomUUID } from 'crypto';
import Tesseract from 'tesseract.js';
import { upload } from '../config/multer.js';
import { verifyToken } from '../middleware/auth.js';
import { getPrescriptionsByUserId, createPrescription, deletePrescription, createPrescriptionDetailed } from '../config/database.js';
import { parsePrescriptionText } from '../services/ocr.js';

const router = express.Router();

// Middleware to verify token
const authenticate = (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, error: 'Not authenticated' });

  const payload = verifyToken(token);
  if (!payload || !payload.id) return res.status(401).json({ success: false, error: 'Invalid token' });

  req.user = payload;
  next();
};

// Get all prescriptions for authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const prescriptions = getPrescriptionsByUserId(req.user.id);
    console.log('📋 API: Returning prescriptions for user:', req.user.id);
    console.log('📋 API: Prescriptions data:', prescriptions);
    prescriptions.forEach((p, idx) => {
      console.log(`  ${idx + 1}. ${p.name} - Morning: ${p.Morning}, Evening: ${p.Evening}, Night: ${p.Night}`);
    });
    return res.json({ success: true, data: prescriptions });
  } catch (err) {
    console.error('Get prescriptions error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Add a new prescription for authenticated user
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, dosage, frequency } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Medication name is required' });

    const prescriptionId = randomUUID();
    createPrescription(prescriptionId, req.user.id, name, dosage, frequency);

    return res.json({ 
      success: true, 
      data: { 
        id: prescriptionId, 
        userId: req.user.id, 
        name, 
        dosage, 
        frequency, 
        createdAt: new Date().toISOString() 
      } 
    });
  } catch (err) {
    console.error('Add prescription error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Delete a prescription
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const prescriptionId = req.params.id;
    deletePrescription(prescriptionId);

    return res.json({ success: true, data: { id: prescriptionId } });
  } catch (err) {
    console.error('Delete prescription error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Upload prescription image and extract text with OCR
router.post('/upload', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No image provided' });

    const imagePath = req.file.path;
    const imageUrl = `/uploads/${req.file.filename}`;

    let text = '';
    
    // Try to run OCR on the image, but handle gracefully if Tesseract isn't available
    try {
      console.log('📸 Starting OCR on image:', req.file.filename);
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
    } catch (ocrErr) {
      console.error('❌ OCR failed:', ocrErr.message);
      console.warn('⚠️ Continuing without text extraction');
      text = '';
    }

    // Parse the extracted text to find medications and dosages
    const parsed = parsePrescriptionText(text);
    console.log('📋 Parsed prescription data:', parsed);

    // Create prescription record
    const prescriptionId = randomUUID();
    createPrescriptionDetailed(
      prescriptionId,
      req.user.id,
      parsed.medicationName || 'Prescription from Image',
      parsed.dosage || '',
      parsed.frequency || '',
      parsed.Morning || '0',
      parsed.Evening || '0',
      parsed.Night || '0',
      parsed.doctorName || '',
      parsed.prescriptionDate || new Date().toISOString().split('T')[0],
      parsed.notes || '',
      imageUrl,
      text
    );

    return res.json({
      success: true,
      data: {
        id: prescriptionId,
        medicationName: parsed.medicationName || 'Prescription from Image',
        dosage: parsed.dosage,
        frequency: parsed.frequency,
        Morning: parsed.Morning,
        Evening: parsed.Evening,
        Night: parsed.Night,
        doctorName: parsed.doctorName,
        prescriptionDate: parsed.prescriptionDate,
        notes: parsed.notes,
        imageUrl: imageUrl,
        extractedText: text,
        ocrAvailable: text.length > 0,
        // Include raw parsed data for debugging
        rawParsed: parsed
      }
    });
  } catch (err) {
    console.error('Upload prescription error:', err);
    res.status(500).json({ success: false, error: 'Failed to process image: ' + err.message });
  }
});

export default router;

