import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../config/multer.js';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import { GoogleGenAI, Type } from '@google/genai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const router = express.Router();

// Initialize Gemini AI
let ai;
try {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
  } else {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (err) {
  console.error('❌ Failed to initialize Gemini AI:', err);
}

// Generate meal plan from patient report
router.post('/generate', authenticateToken, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      // Handle multer errors (file type, size, etc.)
      return res.status(400).json({ 
        success: false, 
        error: err.message || 'File upload error' 
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    // Check if Gemini API is initialized
    if (!ai) {
      return res.status(500).json({ 
        success: false, 
        error: 'Gemini API is not configured. Please set GEMINI_API_KEY in your environment variables.' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    // Validate file type
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedMimes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid file type. Please upload a JPEG, PNG image or PDF file.' 
      });
    }

    const filePath = req.file.path;
    const isPDF = req.file.mimetype === 'application/pdf';
    const isImage = ['image/jpeg', 'image/jpg', 'image/png'].includes(req.file.mimetype);
    let text = '';
    let imagePath = filePath;

    // Convert PDF to image if needed
    if (isPDF) {
      try {
        console.log('📄 PDF file detected. Converting first page to image...');
        const imageOutputPath = join(__dirname, '..', 'uploads', `${req.file.filename}-page1.png`);
        
        await sharp(filePath, { pages: 1 })
          .png()
          .toFile(imageOutputPath);
        
        imagePath = imageOutputPath;
        console.log('✅ PDF converted to image:', imageOutputPath);
      } catch (pdfErr) {
        console.error('❌ PDF conversion failed:', pdfErr.message);
        return res.status(500).json({ 
          success: false, 
          error: `Failed to process PDF file: ${pdfErr.message}` 
        });
      }
    } else if (isImage) {
      console.log('📸 Image file detected:', req.file.mimetype);
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Unsupported file type. Please upload a JPEG, PNG image or PDF file.' 
      });
    }

    // Extract text using OCR
    try {
      console.log('📸 Starting OCR on patient report:', req.file.filename);
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
      return res.status(500).json({ success: false, error: 'Failed to extract text from document' });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'No text could be extracted from the document' });
    }

    // Use Gemini API to analyze the report and generate meal plan
    try {
      console.log('🤖 Sending report to Gemini API for meal plan generation...');
      
      const prompt = `You are a nutritionist analyzing a patient's medical report. Based on the following patient report, generate a personalized one-day meal plan.

Patient Report:
${text}

Please analyze the report and identify:
1. Any health conditions mentioned
2. Any abnormal test results
3. Any medications or treatments
4. Any dietary restrictions or recommendations

Then generate a comprehensive meal plan with:
- Breakfast (detailed meal with ingredients and portions)
- Lunch (detailed meal with ingredients and portions)
- Dinner (detailed meal with ingredients and portions)
- Snacks (optional, if needed)
- Dietary tips and recommendations based on the patient's condition

Format your response as JSON with the following structure:
{
  "breakfast": "detailed breakfast description",
  "lunch": "detailed lunch description",
  "dinner": "detailed dinner description",
  "snacks": "optional snacks description",
  "tips": "dietary tips and recommendations based on the patient's condition"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              breakfast: { type: Type.STRING, description: 'Detailed breakfast meal plan' },
              lunch: { type: Type.STRING, description: 'Detailed lunch meal plan' },
              dinner: { type: Type.STRING, description: 'Detailed dinner meal plan' },
              snacks: { type: Type.STRING, description: 'Optional snacks' },
              tips: { type: Type.STRING, description: 'Dietary tips and recommendations' },
            },
            required: ['breakfast', 'lunch', 'dinner', 'tips'],
          },
        },
      });

      const mealPlan = JSON.parse(response.text);
      console.log('✅ Meal plan generated successfully');

      return res.json({
        success: true,
        data: {
          mealPlan: {
            breakfast: mealPlan.breakfast || 'Meal plan not available',
            lunch: mealPlan.lunch || 'Meal plan not available',
            dinner: mealPlan.dinner || 'Meal plan not available',
            snacks: mealPlan.snacks || '',
            tips: mealPlan.tips || 'No specific dietary tips available',
          },
          extractedText: text.substring(0, 1000), // Return first 1000 chars for reference
        }
      });
    } catch (geminiErr) {
      console.error('❌ Gemini API error:', geminiErr);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to generate meal plan. Please check your Gemini API key.' 
      });
    }
  } catch (err) {
    console.error('Generate meal plan error:', err);
    // Ensure we always return JSON, even on unexpected errors
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to process file: ' + (err.message || 'Unknown error occurred') 
      });
    }
  }
});

// Error handling middleware for this router (must have 4 parameters)
router.use((err, req, res, next) => {
  console.error('Meal plan router error:', err);
  if (!res.headersSent) {
    res.status(500).json({ 
      success: false, 
      error: err.message || 'An error occurred while processing your request' 
    });
  }
});

export default router;

