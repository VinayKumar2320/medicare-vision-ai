# Prescription Upload Format Guide

## Expected Prescription Format

The OCR system can extract information from prescription images. Here's what format works best:

### ✅ **Recommended Format:**

```
Rx: Lisinopril 10mg
Morning: 1 tablet
Evening: 0 tablet
Night: 0 tablet
Frequency: Once daily
Dr. John Smith
Date: 12/25/2024
```

### ✅ **Alternative Formats That Work:**

**Format 1:**
```
Medicine: Metformin 500mg
Morning: 1 tablet
Evening: 1 tablet
Night: 0 tablet
Once daily
Dr. Jane Doe
12-25-2024
```

**Format 2:**
```
Medication: Aspirin 100mg
Morning: 1 tablet
Evening: 0 tablet
Night: 0 tablet
Daily
Doctor: John Smith
Date: 12/25/2024
```

**Format 3:**
```
Rx: Amlodipine 5mg
Morning: 1 tablet
Evening: 0 tablet
Night: 0 tablet
Twice daily
Dr. Smith
25-12-2024
```

### 📋 **What Gets Extracted:**

1. **Medication Name**: Looks for text after "Rx:", "Medicine:", or "Medication:"
2. **Dosage**: Numbers with units (mg, ml, mcg) - e.g., "10mg", "500mg"
3. **Frequency**: Words like "once", "twice", "daily", "bd", "od", "tid", "qid"
4. **Morning Tablets**: "Morning: 1 tablet" or "morning 1 tab"
5. **Evening Tablets**: "Evening: 2 tablets" or "evening 2 tab"
6. **Night Tablets**: "Night: 1 tablet" or "night 1 tab"
7. **Doctor Name**: After "Dr." or "Doctor"
8. **Date**: Formats like "12/25/2024", "12-25-2024", "25/12/2024"

### ⚠️ **Tips for Best Results:**

1. **Clear Image**: Make sure the prescription image is clear and well-lit
2. **Good Contrast**: Black text on white background works best
3. **Straight Text**: Avoid angled or rotated images
4. **High Resolution**: Higher quality images = better OCR results
5. **Plain Text**: Handwritten prescriptions may not work as well as printed ones

### 🔍 **Troubleshooting:**

If the upload isn't working:

1. **Check Console**: Look at browser console and server logs for errors
2. **Verify Image Format**: Only JPG, JPEG, and PNG are accepted
3. **Check Authentication**: Make sure you're logged in
4. **OCR Issues**: If OCR fails, the system will still save the image but with default values
5. **Text Extraction**: Check the server logs to see what text was extracted

### 📝 **Example Prescription Text (What OCR Should Extract):**

```
Rx: Lisinopril 10mg
Morning: 1 tablet
Evening: 0 tablet  
Night: 0 tablet
Frequency: Once daily
Dr. John Smith
Date: 12/25/2024
```

This should extract:
- Medication: Lisinopril
- Dosage: 10mg
- Frequency: Once daily
- Morning: 1
- Evening: 0
- Night: 0
- Doctor: John Smith
- Date: 12/25/2024

