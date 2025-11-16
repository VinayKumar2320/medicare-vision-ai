# Blood Report Upload Format Guide

## Expected Blood Report Format

The OCR system can extract blood test results from uploaded images or PDFs. Here's what format works best:

### ✅ **Recommended Format:**

```
BLOOD TEST REPORT
Date: 01/15/2024
Patient: John Doe

Test Name              Value      Unit      Normal Range
--------------------------------------------------------
Blood Glucose (Fasting)  95      mg/dL     70-100 mg/dL
HbA1c                     6.8     %         < 5.7%
Blood Pressure           135/85   mmHg       < 120/80 mmHg
Cholesterol (Total)       185      mg/dL     < 200 mg/dL
HDL Cholesterol          45       mg/dL     > 40 mg/dL
LDL Cholesterol          120      mg/dL     < 100 mg/dL
```

### ✅ **Alternative Formats That Work:**

**Format 1: Simple List**
```
Blood Test Results - January 15, 2024

Glucose: 95 mg/dL (Normal: 70-100)
HbA1c: 6.8% (Normal: < 5.7%)
Blood Pressure: 135/85 mmHg (Normal: < 120/80)
Total Cholesterol: 185 mg/dL (Normal: < 200)
HDL: 45 mg/dL (Normal: > 40)
LDL: 120 mg/dL (Normal: < 100)
```

**Format 2: Table Format**
```
LABORATORY REPORT
Test Date: 15-01-2024

| Test                | Result | Unit  | Reference Range |
|---------------------|--------|-------|----------------|
| Fasting Glucose    | 95     | mg/dL | 70-100         |
| HbA1c              | 6.8    | %     | < 5.7          |
| Blood Pressure     | 135/85 | mmHg  | < 120/80       |
| Total Cholesterol  | 185    | mg/dL | < 200          |
```

**Format 3: Doctor's Report**
```
Blood Test Report
Date: 01/15/2024

Fasting Blood Sugar: 95 mg/dL (Normal range: 70-100 mg/dL)
Hemoglobin A1c: 6.8% (Target: < 5.7%)
Blood Pressure Reading: 135/85 mmHg (Normal: < 120/80)
Total Cholesterol: 185 mg/dL (Normal: < 200 mg/dL)
HDL: 45 mg/dL (Good: > 40 mg/dL)
LDL: 120 mg/dL (Optimal: < 100 mg/dL)
```

### 📋 **What Gets Extracted:**

The system recognizes and extracts the following common blood tests:

#### **Diabetes Tests:**
- **Blood Glucose (Fasting)**: Looks for "glucose", "blood sugar", "FBS", "fasting glucose"
- **HbA1c**: Looks for "HbA1c", "Hb A1c", "glycated hemoglobin", "A1C"

#### **Blood Pressure:**
- **Blood Pressure**: Looks for "BP", "blood pressure" with format like "135/85" or "135 / 85"

#### **Cholesterol Tests:**
- **Total Cholesterol**: Looks for "total cholesterol", "cholesterol total"
- **HDL Cholesterol**: Looks for "HDL", "HDL cholesterol", "high density"
- **LDL Cholesterol**: Looks for "LDL", "LDL cholesterol", "low density"
- **Triglycerides**: Looks for "triglycerides", "TG"

#### **Complete Blood Count (CBC):**
- **Hemoglobin**: Looks for "hemoglobin", "Hb", "HGB"
- **Hematocrit**: Looks for "hematocrit", "HCT", "PCV"
- **White Blood Cell Count**: Looks for "WBC", "white blood cell", "white cell count"
- **Red Blood Cell Count**: Looks for "RBC", "red blood cell", "red cell count"
- **Platelet Count**: Looks for "platelet", "PLT", "platelet count"

#### **Kidney Function:**
- **Creatinine**: Looks for "creatinine", "creat"
- **Blood Urea Nitrogen**: Looks for "BUN", "blood urea nitrogen", "urea"

#### **Liver Function:**
- **ALT (SGPT)**: Looks for "ALT", "SGOT", "alanine aminotransferase"
- **AST (SGOT)**: Looks for "AST", "SGPT", "aspartate aminotransferase"

### ⚠️ **Tips for Best Results:**

1. **Clear Image**: Make sure the blood report image is clear and well-lit
2. **Good Contrast**: Black text on white background works best
3. **Straight Text**: Avoid angled or rotated images
4. **High Resolution**: Higher quality images = better OCR results
5. **Plain Text**: Handwritten reports may not work as well as printed ones
6. **Complete Information**: Include test names, values, units, and normal ranges when possible

### 📸 **Image Quality Guidelines:**

- **Minimum Resolution**: 300 DPI or higher
- **File Formats**: JPEG, PNG, or PDF
- **File Size**: Up to 10MB (larger files may take longer to process)
- **Orientation**: Portrait or landscape (system will try to auto-rotate)

### 🔍 **Example of What Works Well:**

```
╔══════════════════════════════════════════════════╗
║         MEDICAL LABORATORY REPORT                ║
║  Date: January 15, 2024                          ║
║  Patient: John Doe                               ║
╠══════════════════════════════════════════════════╣
║ Test Name              Result    Unit    Range   ║
╠══════════════════════════════════════════════════╣
║ Blood Glucose          95        mg/dL   70-100  ║
║ HbA1c                  6.8       %       < 5.7   ║
║ Blood Pressure         135/85    mmHg    < 120/80║
║ Total Cholesterol      185       mg/dL   < 200   ║
║ HDL Cholesterol        45        mg/dL   > 40    ║
║ LDL Cholesterol        120       mg/dL   < 100   ║
╚══════════════════════════════════════════════════╝
```

### 🔍 **Troubleshooting:**

If the upload isn't working or results aren't being extracted:

1. **Check Console**: Look at browser console and server logs for errors
2. **Verify Image Format**: Only JPG, JPEG, PNG, and PDF are accepted
3. **Check Image Quality**: Blurry or low-resolution images may not extract well
4. **Test Names**: Make sure test names are clearly visible and match common names
5. **Manual Entry**: If OCR fails, you can manually add test results (feature coming soon)

### 💡 **What Happens After Upload:**

1. **File Upload**: Your blood report file is saved securely
2. **OCR Processing**: The system extracts text from the image/PDF
3. **Data Parsing**: Test results are automatically identified and parsed
4. **Status Detection**: Each test is marked as Normal, High, Low, or Critical
5. **Storage**: Results are saved to your account and displayed on the dashboard

### 📝 **Notes:**

- The system will attempt to extract as many test results as possible
- If a test isn't recognized, the file will still be saved for your reference
- You can view the original document anytime by clicking "View Document"
- Multiple tests from the same report will be stored as separate entries

