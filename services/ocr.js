// Helper function to parse prescription text
export function parsePrescriptionText(text) {
  console.log('🔍 Parsing prescription text:', text.substring(0, 200)); // Log first 200 chars
  
  const lines = text.split('\n');
  const parsed = {
    medicationName: '',
    dosage: '',
    frequency: '',
    Morning: '0',
    Evening: '0',
    Night: '0',
    doctorName: '',
    prescriptionDate: new Date().toISOString().split('T')[0],
    notes: ''
  };

  // Simple parsing logic - can be enhanced
  let fullText = text.toLowerCase();

  // Extract medication name - improved patterns
  // Pattern 1: After "Rx:", "Medicine:", "Medication:"
  let rxMatch = text.match(/(?:Rx|medicine|medication)[:\s]+([A-Za-z\s]+?)(?=\d+|morning|evening|night|bd|od|tid|$)/i);
  if (rxMatch) {
    parsed.medicationName = rxMatch[1].trim();
  } else {
    // Pattern 2: Look for common medication names at start of lines
    const medLine = lines.find(line => {
      const upperLine = line.toUpperCase();
      return upperLine.includes('MG') || upperLine.includes('ML') || upperLine.includes('MCG');
    });
    if (medLine) {
      // Extract text before dosage
      const medMatch = medLine.match(/^([A-Za-z\s]+?)(?=\d+\s*(?:mg|ml|mcg))/i);
      if (medMatch) parsed.medicationName = medMatch[1].trim();
    }
  }

  // Extract tablets count for morning - improved patterns
  let morningMatch = fullText.match(/morning[:\s]+(\d+)\s*(?:tablet|tab|pills?)?/i);
  if (!morningMatch) {
    morningMatch = fullText.match(/m[:\s]+(\d+)\s*(?:tablet|tab|pills?)?/i);
  }
  if (morningMatch) parsed.Morning = morningMatch[1];

  // Extract tablets count for evening - improved patterns
  let eveningMatch = fullText.match(/evening[:\s]+(\d+)\s*(?:tablet|tab|pills?)?/i);
  if (!eveningMatch) {
    eveningMatch = fullText.match(/e[:\s]+(\d+)\s*(?:tablet|tab|pills?)?/i);
  }
  if (eveningMatch) parsed.Evening = eveningMatch[1];

  // Extract tablets count for night - improved patterns
  let nightMatch = fullText.match(/night[:\s]+(\d+)\s*(?:tablet|tab|pills?)?/i);
  if (!nightMatch) {
    nightMatch = fullText.match(/n[:\s]+(\d+)\s*(?:tablet|tab|pills?)?/i);
  }
  if (nightMatch) parsed.Night = nightMatch[1];

  // Extract dosage (e.g., "10mg", "500mg", "5 ml") - improved
  const dosageMatch = text.match(/(\d+(?:\.\d+)?)\s*(mg|ml|mcg|g)\b/i);
  if (dosageMatch) {
    parsed.dosage = `${dosageMatch[1]}${dosageMatch[2]}`;
  }

  // Extract doctor name - improved patterns
  let doctorMatch = text.match(/(?:Dr\.|Doctor|Dr\s)[:\s]+([A-Za-z\s]+?)(?=\n|,|$|Date)/i);
  if (!doctorMatch) {
    doctorMatch = text.match(/Doctor[:\s]+([A-Za-z\s]+?)(?=\n|,|$)/i);
  }
  if (doctorMatch) parsed.doctorName = doctorMatch[1].trim();

  // Extract date - improved patterns (handles various formats)
  let dateMatch = text.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/);
  if (!dateMatch) {
    dateMatch = text.match(/(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/); // YYYY-MM-DD format
  }
  if (dateMatch) parsed.prescriptionDate = dateMatch[1];

  // Frequency - improved patterns
  const frequencyMatch = text.match(/(?:once|twice|thrice|daily|bd|od|tid|qid|one|two|three)\s*(?:a\s*)?(?:day|daily)?/i);
  if (frequencyMatch) {
    const freq = frequencyMatch[0].toLowerCase();
    if (freq.includes('once') || freq.includes('one') || freq.includes('od')) {
      parsed.frequency = 'Once daily';
    } else if (freq.includes('twice') || freq.includes('two') || freq.includes('bd')) {
      parsed.frequency = 'Twice daily';
    } else if (freq.includes('thrice') || freq.includes('three') || freq.includes('tid')) {
      parsed.frequency = 'Thrice daily';
    } else if (freq.includes('qid')) {
      parsed.frequency = 'Four times daily';
    } else {
      parsed.frequency = frequencyMatch[0];
    }
  }

  console.log('✅ Parsed result:', parsed);
  return parsed;
}

