// Parse blood report text extracted from OCR
export function parseBloodReportText(text) {
  console.log('🔍 Parsing blood report text:', text.substring(0, 300));
  
  const tests = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Common blood test patterns
  const testPatterns = [
    // Glucose patterns
    { pattern: /(?:glucose|blood.?sugar|bs|fbs|fasting.?glucose)[\s:]*(\d+\.?\d*)\s*(mg\/dl|mg\/dL|mmol\/l|mmol\/L)/i, name: 'Blood Glucose (Fasting)', unit: 'mg/dL', normalRange: '70-100 mg/dL' },
    { pattern: /(?:hba1c|hb.?a1c|glycated.?hemoglobin)[\s:]*(\d+\.?\d*)\s*%/i, name: 'HbA1c', unit: '%', normalRange: '< 5.7%' },
    
    // Blood Pressure
    { pattern: /(?:blood.?pressure|bp)[\s:]*(\d+)\s*\/\s*(\d+)\s*(?:mmhg|mm.?hg)?/i, name: 'Blood Pressure', unit: 'mmHg', normalRange: '< 120/80 mmHg', isBP: true },
    
    // Cholesterol
    { pattern: /(?:total.?cholesterol|cholesterol.?total)[\s:]*(\d+\.?\d*)\s*(mg\/dl|mg\/dL)/i, name: 'Cholesterol (Total)', unit: 'mg/dL', normalRange: '< 200 mg/dL' },
    { pattern: /(?:hdl|hdl.?cholesterol|high.?density)[\s:]*(\d+\.?\d*)\s*(mg\/dl|mg\/dL)/i, name: 'HDL Cholesterol', unit: 'mg/dL', normalRange: '> 40 mg/dL' },
    { pattern: /(?:ldl|ldl.?cholesterol|low.?density)[\s:]*(\d+\.?\d*)\s*(mg\/dl|mg\/dL)/i, name: 'LDL Cholesterol', unit: 'mg/dL', normalRange: '< 100 mg/dL' },
    { pattern: /(?:triglycerides|tg)[\s:]*(\d+\.?\d*)\s*(mg\/dl|mg\/dL)/i, name: 'Triglycerides', unit: 'mg/dL', normalRange: '< 150 mg/dL' },
    
    // Complete Blood Count (CBC)
    { pattern: /(?:hemoglobin|hb|hgb)[\s:]*(\d+\.?\d*)\s*(g\/dl|g\/dL|gm\/dl)/i, name: 'Hemoglobin', unit: 'g/dL', normalRange: '12-16 g/dL (Female), 14-18 g/dL (Male)' },
    { pattern: /(?:hematocrit|hct|pcv)[\s:]*(\d+\.?\d*)\s*%/i, name: 'Hematocrit', unit: '%', normalRange: '36-46% (Female), 40-54% (Male)' },
    { pattern: /(?:wbc|white.?blood.?cell|white.?cell.?count)[\s:]*(\d+\.?\d*)\s*(?:\/\s*)?(?:ul|mcL|×10³\/μL)?/i, name: 'White Blood Cell Count', unit: '/μL', normalRange: '4,000-11,000 /μL' },
    { pattern: /(?:rbc|red.?blood.?cell|red.?cell.?count)[\s:]*(\d+\.?\d*)\s*(?:\/\s*)?(?:ul|mcL|×10⁶\/μL)?/i, name: 'Red Blood Cell Count', unit: '×10⁶/μL', normalRange: '4.0-5.5 ×10⁶/μL (Female), 4.5-6.0 ×10⁶/μL (Male)' },
    { pattern: /(?:platelet|plt|platelet.?count)[\s:]*(\d+\.?\d*)\s*(?:\/\s*)?(?:ul|mcL|×10³\/μL)?/i, name: 'Platelet Count', unit: '/μL', normalRange: '150,000-450,000 /μL' },
    
    // Kidney function
    { pattern: /(?:creatinine|creat)[\s:]*(\d+\.?\d*)\s*(mg\/dl|mg\/dL|μmol\/l)/i, name: 'Creatinine', unit: 'mg/dL', normalRange: '0.6-1.2 mg/dL (Male), 0.5-1.1 mg/dL (Female)' },
    { pattern: /(?:bun|blood.?urea.?nitrogen|urea)[\s:]*(\d+\.?\d*)\s*(mg\/dl|mg\/dL)/i, name: 'Blood Urea Nitrogen', unit: 'mg/dL', normalRange: '7-20 mg/dL' },
    
    // Liver function
    { pattern: /(?:alt|sgot|alanine.?aminotransferase)[\s:]*(\d+\.?\d*)\s*(u\/l|iu\/l)/i, name: 'ALT (SGPT)', unit: 'U/L', normalRange: '< 40 U/L' },
    { pattern: /(?:ast|sgpt|aspartate.?aminotransferase)[\s:]*(\d+\.?\d*)\s*(u\/l|iu\/l)/i, name: 'AST (SGOT)', unit: 'U/L', normalRange: '< 40 U/L' },
  ];
  
  // Extract date
  const datePatterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    /(?:date|test.?date|report.?date)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
  ];
  
  let testDate = new Date().toISOString().split('T')[0]; // Default to today
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        const dateStr = match[1];
        // Try to parse the date
        const parts = dateStr.split(/[\/\-]/);
        if (parts.length === 3) {
          let year = parseInt(parts[2]);
          if (year < 100) year += 2000; // Convert 2-digit year
          const month = parts[0].padStart(2, '0');
          const day = parts[1].padStart(2, '0');
          testDate = `${year}-${month}-${day}`;
          break;
        }
      } catch (e) {
        // Keep default date
      }
    }
  }
  
  // Extract tests
  for (const testPattern of testPatterns) {
    const matches = [...text.matchAll(new RegExp(testPattern.pattern.source, 'gi'))];
    for (const match of matches) {
      let value, status;
      
      if (testPattern.isBP) {
        // Blood pressure has two values
        const systolic = parseFloat(match[1]);
        const diastolic = parseFloat(match[2]);
        value = `${systolic}/${diastolic}`;
        status = (systolic >= 140 || diastolic >= 90) ? 'High' : 
                 (systolic >= 120 || diastolic >= 80) ? 'High' : 'Normal';
      } else {
        value = match[1];
        const numValue = parseFloat(value);
        
        // Determine status based on normal range
        if (testPattern.normalRange) {
          if (testPattern.normalRange.includes('>')) {
            const threshold = parseFloat(testPattern.normalRange.match(/>\s*(\d+\.?\d*)/)?.[1] || '0');
            status = numValue >= threshold ? 'Normal' : 'Low';
          } else if (testPattern.normalRange.includes('<')) {
            const threshold = parseFloat(testPattern.normalRange.match(/<\s*(\d+\.?\d*)/)?.[1] || '999');
            status = numValue <= threshold ? 'Normal' : 'High';
          } else {
            // Range like "70-100"
            const rangeMatch = testPattern.normalRange.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
            if (rangeMatch) {
              const min = parseFloat(rangeMatch[1]);
              const max = parseFloat(rangeMatch[2]);
              status = (numValue >= min && numValue <= max) ? 'Normal' : 
                       (numValue < min) ? 'Low' : 'High';
            } else {
              status = 'Normal';
            }
          }
        } else {
          status = 'Normal';
        }
      }
      
      tests.push({
        testName: testPattern.name,
        value: value,
        unit: testPattern.unit || '',
        normalRange: testPattern.normalRange || '',
        status: status
      });
    }
  }
  
  console.log('✅ Parsed blood report:', { testDate, testsCount: tests.length });
  
  return {
    testDate,
    tests
  };
}

