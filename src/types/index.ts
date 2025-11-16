export type View = 'DASHBOARD' | 'MONITORING' | 'MEAL_PLAN' | 'PRESCRIPTIONS' | 'GUARDIAN' | 'VOICE_ASSISTANT' | 'BLOOD_REPORTS';

export type Activity = {
  id: string;
  timestamp: Date;
  description: string;
  isAlert: boolean;
};

export type MedicationLog = {
  id: string;
  timestamp: Date;
  medication: string;
  status: 'Verified' | 'Unverified';
};

export type Prescription = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  lastTaken: Date | null;
  Morning?: string;
  Evening?: string;
  Night?: string;
  doctorName?: string;
  prescriptionDate?: string;
  notes?: string;
  imageUrl?: string;
  ocrText?: string;
};

export type Symptom = {
  id: string;
  timestamp: Date;
  description: string;
  severity: 'Low' | 'Medium' | 'Urgent';
  recommendation: string;
};

export type Alert = {
  id: string;
  timestamp: Date;
  message: string;
  type: 'Fall' | 'Distress' | 'Symptom' | 'Medication';
};

export type MealPlan = {
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks?: string;
  tips: string;
};

export type HealthIssue = {
  id: string;
  name: string;
  description?: string;
  diagnosedDate?: string;
  severity?: 'Low' | 'Medium' | 'High';
};

export type BloodReport = {
  id: string;
  testDate: string;
  testName: string;
  value: string;
  unit: string;
  normalRange: string;
  status: 'Normal' | 'Low' | 'High' | 'Critical';
  fileUrl?: string;
  ocrText?: string;
};

