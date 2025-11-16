import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Modal } from './components/Modal';
import { DashboardView } from './views/DashboardView';
import { MonitoringView } from './views/MonitoringView';
import { MealPlanView } from './views/MealPlanView';
import { PrescriptionsView } from './views/PrescriptionsView';
import { GuardianView } from './views/GuardianView';
import { VoiceAssistantView } from './views/VoiceAssistantView';
import { BloodReportsView } from './views/BloodReportsView';
import { LoginPage } from './views/LoginPage';
import { PrescriptionService } from './services/prescriptionService';
import { BloodReportService } from './services/bloodReportService';
import { GeminiService } from './services/geminiService';
import { EmailService } from './services/emailService';
import { MealPlanService } from './services/mealPlanService';
import { useSpeech } from './hooks/useSpeech';
import { AuthService } from './services/authService';
import { UI_COLORS, MONITORING_INTERVAL, MOCK_HEALTH_CONDITIONS } from './constants';
import { styles } from './styles';
import type { View, Activity, MedicationLog, Prescription, Symptom, Alert, MealPlan, HealthIssue, BloodReport } from './types';

const MainApp = ({ user, token, onLogout }: { user: any; token: string; onLogout: () => void }) => {
  const [view, setView] = useState<View>('DASHBOARD');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [healthIssues, setHealthIssues] = useState<HealthIssue[]>([
    {
      id: 'hi-1',
      name: 'High Blood Pressure',
      description: 'Hypertension - requires regular monitoring and medication',
      diagnosedDate: '2023-01-15',
      severity: 'High'
    },
    {
      id: 'hi-2',
      name: 'Type 2 Diabetes',
      description: 'Diabetes mellitus type 2 - managed with medication and diet',
      diagnosedDate: '2022-06-20',
      severity: 'High'
    }
  ]);
  const [bloodReports, setBloodReports] = useState<BloodReport[]>([]);
  const [modal, setModal] = useState<{type: string | null, data: any}>({type: null, data: null});
  const [isLoading, setIsLoading] = useState(false);
  const [guardianEmail, setGuardianEmail] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const monitoringIntervalRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  const { speak } = useSpeech();

  // Function to generate health issues from abnormal blood reports
  const generateHealthIssuesFromBloodReports = useCallback((reports: BloodReport[]) => {
    // Filter for abnormal reports (status !== 'Normal')
    const abnormalReports = reports.filter(r => r.status !== 'Normal');
    
    if (abnormalReports.length === 0) {
      return [];
    }

    // Group by test name and get the most recent abnormal result for each test
    const latestAbnormalByTest = abnormalReports
      .sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime())
      .reduce((acc, report) => {
        // Use test name as key, only keep the most recent one
        if (!acc[report.testName]) {
          acc[report.testName] = report;
        }
        return acc;
      }, {} as Record<string, BloodReport>);

    // Convert to health issues
    const healthIssuesFromReports: HealthIssue[] = Object.values(latestAbnormalByTest).map(report => {
      // Map blood report status to health issue severity
      const severity: 'Low' | 'Medium' | 'High' = 
        report.status === 'Critical' ? 'High' :
        report.status === 'High' || report.status === 'Low' ? 'Medium' :
        'Medium';

      // Create descriptive name and description
      const statusText = report.status === 'High' ? 'Elevated' : 
                        report.status === 'Low' ? 'Low' : 
                        report.status === 'Critical' ? 'Critical' : 'Abnormal';
      
      const description = `${statusText} ${report.testName}: ${report.value} ${report.unit} (Normal: ${report.normalRange || 'N/A'}). Detected from blood test on ${new Date(report.testDate).toLocaleDateString()}.`;

      return {
        id: `blood-${report.id}`,
        name: `${report.testName} (${statusText})`,
        description: description,
        diagnosedDate: report.testDate,
        severity: severity
      };
    });

    return healthIssuesFromReports;
  }, []);

  // Function to load blood reports from API
  const loadBloodReports = useCallback(async () => {
    if (token) {
      try {
        const fetchedReports = await BloodReportService.getBloodReports(token);
        setBloodReports(fetchedReports);
        
        // Generate health issues from abnormal blood reports
        const healthIssuesFromReports = generateHealthIssuesFromBloodReports(fetchedReports);
        
        // Merge with existing health issues, avoiding duplicates
        setHealthIssues(prev => {
          // Keep existing health issues that are not from blood reports
          const existingNonBloodIssues = prev.filter(issue => !issue.id.startsWith('blood-'));
          
          // Combine with new blood report health issues
          const allIssues = [...existingNonBloodIssues, ...healthIssuesFromReports];
          
          // Remove duplicates based on name (in case same test appears multiple times)
          const uniqueIssues = allIssues.reduce((acc, issue) => {
            const existing = acc.find(i => i.name === issue.name);
            if (!existing) {
              acc.push(issue);
            } else {
              // If duplicate exists, keep the one with higher severity or more recent date
              const existingIndex = acc.indexOf(existing);
              const severityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
              const existingSeverity = severityOrder[existing.severity || 'Low'] || 0;
              const newSeverity = severityOrder[issue.severity || 'Low'] || 0;
              
              if (newSeverity > existingSeverity || 
                  (newSeverity === existingSeverity && 
                   issue.diagnosedDate && existing.diagnosedDate &&
                   new Date(issue.diagnosedDate) > new Date(existing.diagnosedDate))) {
                acc[existingIndex] = issue;
              }
            }
            return acc;
          }, [] as HealthIssue[]);
          
          return uniqueIssues;
        });
      } catch (err) {
        console.error('Failed to load blood reports:', err);
      }
    }
  }, [token, generateHealthIssuesFromBloodReports]);

  // Function to load prescriptions from API
  const loadPrescriptions = useCallback(async () => {
    if (token) {
      try {
        const fetchedPrescriptions = await PrescriptionService.getPrescriptions(token);
        console.log('📋 Reloaded prescriptions from API (raw):', JSON.stringify(fetchedPrescriptions, null, 2));
        console.log('📋 Number of prescriptions:', fetchedPrescriptions.length);
        if (fetchedPrescriptions.length > 0) {
          console.log('📋 Full first prescription object:', fetchedPrescriptions[0]);
          console.log('📋 First prescription keys:', Object.keys(fetchedPrescriptions[0]));
          console.log('📋 First prescription Morning value:', fetchedPrescriptions[0].Morning, 'type:', typeof fetchedPrescriptions[0].Morning);
          console.log('📋 First prescription Evening value:', fetchedPrescriptions[0].Evening, 'type:', typeof fetchedPrescriptions[0].Evening);
          console.log('📋 First prescription Night value:', fetchedPrescriptions[0].Night, 'type:', typeof fetchedPrescriptions[0].Night);
        }
        setPrescriptions(fetchedPrescriptions.map(p => {
          // Log the raw values before mapping
          console.log(`  Raw API data for ${p.name}:`, {
            Morning: p.Morning,
            Evening: p.Evening,
            Night: p.Night,
            MorningType: typeof p.Morning,
            EveningType: typeof p.Evening,
            NightType: typeof p.Night
          });
          
          // Preserve the actual values from database, don't convert to string if they're numbers
          const result = {
            ...p,
            lastTaken: null,
            // Keep original values, but ensure they exist (don't convert 0 to '0')
            Morning: p.Morning !== null && p.Morning !== undefined ? String(p.Morning) : '0',
            Evening: p.Evening !== null && p.Evening !== undefined ? String(p.Evening) : '0',
            Night: p.Night !== null && p.Night !== undefined ? String(p.Night) : '0'
          };
          console.log(`  Mapped prescription: ${p.name}, Morning: ${result.Morning}, Evening: ${result.Evening}, Night: ${result.Night}`);
          return result;
        }));
      } catch (err) {
        console.error('Failed to reload prescriptions:', err);
      }
    }
  }, [token]);

  // Load from localStorage and API on initial render
  useEffect(() => {
    const savedEmail = localStorage.getItem('guardianEmail');
    if (savedEmail) {
      setGuardianEmail(savedEmail);
    }
    // Load prescriptions and blood reports from API
    loadPrescriptions();
    loadBloodReports();
  }, [loadPrescriptions, loadBloodReports]);

  const addActivity = (description: string, isAlert: boolean = false) => {
    const newActivity = { id: `act-${Date.now()}`, timestamp: new Date(), description, isAlert };
    setActivities(prev => [newActivity, ...prev]);
  };

  const addAlert = (message: string, type: Alert['type'], source: string) => {
    const newAlert = { id: `al-${Date.now()}`, timestamp: new Date(), message, type };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleAddPrescription = async ({ name, dosage, frequency }: { name: string; dosage: string; frequency: string }) => {
    try {
      const newPrescription = await PrescriptionService.addPrescription(token, name, dosage, frequency);
      // Reload all prescriptions to get the latest data from database
      await loadPrescriptions();
      speak(`${name} has been added to your prescriptions.`);
    } catch (err: any) {
      speak('Failed to add prescription.');
      console.error('Add prescription error:', err);
    }
  };

  const handleSaveGuardianEmail = (email: string) => {
    setGuardianEmail(email);
    localStorage.setItem('guardianEmail', email);
    speak("Guardian email has been updated.");
    setModal({ type: 'info', data: { title: 'Success', message: 'Guardian email saved successfully.' }});
  };

  const handleTestEmail = async (email: string) => {
    setIsLoading(true);
    const subject = 'Test Email - Medicare Vision AI';
    const textBody = `This is a test email from Medicare Vision AI.\n\nIf you receive this email, the email integration is working correctly!\n\nTime: ${new Date().toLocaleString()}`;
    const htmlBody = `
      <h2>Test Email - Medicare Vision AI</h2>
      <p>This is a test email from Medicare Vision AI.</p>
      <p>If you receive this email, the <strong>email integration is working correctly!</strong></p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <hr>
      <p style="color: #666; font-size: 12px;">This is an automated test email from Medicare Vision AI.</p>
    `;
    
    const result = await EmailService.sendEmail(email, subject, textBody, htmlBody);
    
    if (result.success) {
      setModal({ type: 'info', data: { title: 'Test Email Sent', message: 'Test email sent successfully! Please check the guardian\'s inbox.' }});
      speak("Test email sent successfully.");
    } else {
      const errorMsg = result.error || 'Unknown error occurred';
      setModal({ type: 'error', data: { title: 'Email Failed', message: `Failed to send test email: ${errorMsg}` }});
      speak("Failed to send test email.");
      console.error('Email error details:', errorMsg);
    }
    setIsLoading(false);
  };
  
  const captureFrameAsBase64 = useCallback(() => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg').split(',')[1];
    }
    return null;
  }, []);

  const handleMedicationScan = useCallback(async () => {
    speak("Please hold the medication steady.");
    setIsLoading(true);
    setModal({type: 'loading', data: {title: 'Scanning Medication', message: 'Analyzing medication label...'}});
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // wait for user to be ready
    const imageBase64 = captureFrameAsBase64();
    
    if (imageBase64) {
      const result = await GeminiService.verifyMedication(imageBase64);
      const extractedMedName = result.name || "Unknown";
      const extractedMedDosage = result.dosage || "";
      const fullExtractedMed = `${extractedMedName} ${extractedMedDosage}`.trim();

      const matchedPrescription = prescriptions.find(p =>
        extractedMedName !== 'Unknown' &&
        (extractedMedName.toLowerCase().includes(p.name.toLowerCase()) ||
         p.name.toLowerCase().includes(extractedMedName.toLowerCase()))
      );
      const isVerified = !!matchedPrescription;
      
      const newLog: MedicationLog = { 
        id: `med-${Date.now()}`, 
        timestamp: new Date(), 
        medication: fullExtractedMed, 
        status: isVerified ? 'Verified' : 'Unverified' 
      };

      setMedicationLogs(prev => [newLog, ...prev]);
      
      if (isVerified && matchedPrescription) {
        setPrescriptions(prev => {
          const updated = prev.map(p => p.id === matchedPrescription.id ? { ...p, lastTaken: new Date() } : p);
          return updated;
        });
        speak(`${matchedPrescription.name} verified and logged.`);
      } else {
        const alertMessage = `Unverified medication taken: ${fullExtractedMed}`;
        addAlert(alertMessage, 'Medication', 'Medication');
        speak(`Warning: ${fullExtractedMed} is not on your prescription list.`);
        
        if (guardianEmail) {
          const subject = `Medication Alert: Unverified Medication Taken`;
          const textBody = `An unverified medication was scanned at ${new Date().toLocaleString()}.\n\nDetails:\nMedication: ${fullExtractedMed}\n\nPlease check in immediately.`;
          const htmlBody = `
            <h2>Medication Alert: Unverified Medication Detected</h2>
            <p>An unverified medication was scanned at <strong>${new Date().toLocaleString()}</strong>.</p>
            <h3>Details:</h3>
            <p><strong>Medication:</strong> ${fullExtractedMed}</p>
            <p style="color: #dc3545; font-weight: bold;">Please check in immediately.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">This is an automated alert from Medicare Vision AI.</p>
          `;
          
          speak("Sending alert email to your guardian.");
          const result = await EmailService.sendEmail(guardianEmail, subject, textBody, htmlBody);
          
          if (result.success) {
            speak("Alert email has been sent to your guardian.");
          } else {
            const errorMsg = result.error || 'Unknown error';
            console.error('Failed to send alert email:', errorMsg);
            speak("Failed to send email. Please contact your guardian directly.");
          }
        }
      }
      setModal({type: 'medication_result', data: {...newLog, matchedPrescription }});

    } else {
      speak("Could not capture image from camera.");
      setModal({type: 'error', data: {title: 'Camera Error', message: 'Could not capture image.'}});
    }
    setIsLoading(false);
  }, [captureFrameAsBase64, speak, prescriptions, guardianEmail]);
  
  const handleSymptomReport = useCallback(async (symptomText: string) => {
    setIsLoading(true);
    setModal({type: 'loading', data: {title: 'Analyzing Symptom', message: 'Please wait...'}});
    
    const result = await GeminiService.analyzeSymptom(symptomText);
    setSymptoms(prev => [result, ...prev]);
    
    speak(`Symptom logged. Severity is ${result.severity}. Recommendation: ${result.recommendation}`);
    if (result.severity === 'Urgent') {
      const alertMessage = `Urgent symptom reported: ${result.description}`;
      addAlert(alertMessage, 'Symptom', 'Symptom');
      speak(`Alert: ${alertMessage}`);
    }

    setModal({type: 'symptom_result', data: result});
    setIsLoading(false);
  }, [speak]);

  // Voice command setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase().trim();
      processCommand(command);
    };
    speechRecognitionRef.current = recognition;
  }, []);

  // Function to generate and speak today's medication summary
  const speakTodayTablets = useCallback(() => {
    // Calculate today's tablets from prescriptions
    const todayTablets = prescriptions.reduce((total, prescription) => {
      const morningVal = prescription.Morning;
      const eveningVal = prescription.Evening;
      const nightVal = prescription.Night;
      
      const morning = (morningVal !== null && morningVal !== undefined && morningVal !== '') 
        ? (typeof morningVal === 'number' ? morningVal : parseInt(String(morningVal), 10) || 0)
        : 0;
      const evening = (eveningVal !== null && eveningVal !== undefined && eveningVal !== '') 
        ? (typeof eveningVal === 'number' ? eveningVal : parseInt(String(eveningVal), 10) || 0)
        : 0;
      const night = (nightVal !== null && nightVal !== undefined && nightVal !== '') 
        ? (typeof nightVal === 'number' ? nightVal : parseInt(String(nightVal), 10) || 0)
        : 0;
      
      return total + morning + evening + night;
    }, 0);

    // Get today's verified medication logs
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVerifiedLogs = medicationLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime() && log.status === 'Verified';
    });

    // Helper function to match medication log name with prescription name
    const matchesMedication = (logMedication: string, prescriptionName: string): boolean => {
      const logLower = logMedication.toLowerCase();
      const prescLower = prescriptionName.toLowerCase();
      const logClean = logLower.replace(/\s*(tablets?|mg|ml|mcg|g|drops?|capsules?)\s*/gi, '').trim();
      const prescClean = prescLower.trim();
      return logLower.includes(prescLower) || 
             prescLower.includes(logLower) ||
             logClean.includes(prescClean) ||
             prescClean.includes(logClean);
    };

    // Create a list of today's medications with timing
    const todayMedications: Array<{ name: string; timing: string; count: number; taken?: boolean }> = [];
    prescriptions.forEach(prescription => {
      const morningVal = prescription.Morning;
      const eveningVal = prescription.Evening;
      const nightVal = prescription.Night;
      
      const morning = (morningVal !== null && morningVal !== undefined && morningVal !== '') 
        ? (typeof morningVal === 'number' ? morningVal : parseInt(String(morningVal), 10) || 0)
        : 0;
      const evening = (eveningVal !== null && eveningVal !== undefined && eveningVal !== '') 
        ? (typeof eveningVal === 'number' ? eveningVal : parseInt(String(eveningVal), 10) || 0)
        : 0;
      const night = (nightVal !== null && nightVal !== undefined && nightVal !== '') 
        ? (typeof nightVal === 'number' ? nightVal : parseInt(String(nightVal), 10) || 0)
        : 0;
      
      const verifiedToday = todayVerifiedLogs.some(log => 
        matchesMedication(log.medication, prescription.name)
      );
      
      if (morning > 0) {
        todayMedications.push({ name: prescription.name, timing: 'Morning', count: morning, taken: verifiedToday });
      }
      if (evening > 0) {
        todayMedications.push({ name: prescription.name, timing: 'Evening', count: evening, taken: verifiedToday });
      }
      if (night > 0) {
        todayMedications.push({ name: prescription.name, timing: 'Night', count: night, taken: verifiedToday });
      }
    });

    if (todayTablets === 0) {
      speak("You have no tablets scheduled for today.");
      return;
    }

    let summary = `You have ${todayTablets} tablet${todayTablets > 1 ? 's' : ''} to take today. `;
    
    // Group medications by name
    const medGroups: { [key: string]: { timings: string[], count: number, taken: boolean } } = {};
    todayMedications.forEach(med => {
      if (!medGroups[med.name]) {
        medGroups[med.name] = { timings: [], count: 0, taken: med.taken || false };
      }
      medGroups[med.name].timings.push(med.timing);
      medGroups[med.name].count += med.count;
      if (med.taken) {
        medGroups[med.name].taken = true;
      }
    });

    // Build summary for each medication
    const medSummaries: string[] = [];
    Object.entries(medGroups).forEach(([name, info]) => {
      const timingText = info.timings.length === 1 
        ? info.timings[0].toLowerCase()
        : info.timings.slice(0, -1).join(', ').toLowerCase() + ' and ' + info.timings[info.timings.length - 1].toLowerCase();
      
      const countText = info.count === 1 ? '1 tablet' : `${info.count} tablets`;
      const statusText = info.taken ? 'already taken' : 'to be taken';
      
      medSummaries.push(`${countText} of ${name} ${statusText} in the ${timingText}`);
    });

    summary += medSummaries.join('. ') + '.';
    
    // Add summary of what's remaining
    const remaining = todayMedications.filter(m => !m.taken);
    if (remaining.length > 0 && remaining.length < todayMedications.length) {
      const remainingCount = remaining.reduce((sum, m) => sum + m.count, 0);
      summary += ` You still have ${remainingCount} tablet${remainingCount > 1 ? 's' : ''} remaining to take.`;
    } else if (remaining.length === 0 && todayMedications.length > 0) {
      summary += " All medications have been taken for today.";
    }

    speak(summary);
  }, [prescriptions, medicationLogs, speak]);

  const processCommand = (command: string) => {
    console.log("Command received:", command);
    if (command.includes("start monitoring") || command.includes("check on me")) {
      setView('MONITORING');
      startMonitoring();
      speak("Starting live monitoring.");
    } else if (command.includes("stop monitoring")) {
      stopMonitoring();
      speak("Stopping live monitoring.");
    } else if (command.includes("report symptom") || command.includes("not feeling well")) {
      speak("Please describe your symptom after the beep.");
      setTimeout(() => {
        setModal({type: 'symptom_input', data: null});
        speak("Listening for symptom.");
      }, 2000);
    } else if (command.includes("medication") || command.includes("pill")) {
      setView('MONITORING');
      handleMedicationScan();
    } else if (command.includes("meal plan") || command.includes("meal recommendation")) {
      setView('MEAL_PLAN');
      speak("Navigating to the meal planner.");
    } else if (command.includes("dashboard") || command.includes("home")) {
      setView('DASHBOARD');
      speak("Showing dashboard.");
    } else if (command.includes("prescription")) {
      setView('PRESCRIPTIONS');
      speak("Showing your prescriptions.");
    } else if (command.includes("guardian")) {
      setView('GUARDIAN');
      speak("Showing guardian details.");
    } else if (command.includes("today's tablets") || command.includes("today tablets") || 
               command.includes("what tablets") || command.includes("tell me about tablets") ||
               command.includes("medication summary") || command.includes("tablet summary")) {
      setView('DASHBOARD');
      // Small delay to ensure dashboard is rendered before speaking
      setTimeout(() => {
        speakTodayTablets();
      }, 100);
    } else {
      speak("Sorry, I didn't understand that command.");
    }
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    if (monitoringIntervalRef.current) clearInterval(monitoringIntervalRef.current);
    
    monitoringIntervalRef.current = window.setInterval(async () => {
      const imageBase64 = captureFrameAsBase64();
      if (imageBase64) {
        const result = await GeminiService.analyzeActivity(imageBase64);
        const classification = (result.match(/Classification: (.*?)\./) || [])[1] || "Unknown";
        const description = (result.match(/Description: (.*?)$/) || [])[1] || result;

        const isAlert = classification === "Fallen" || classification === "In Distress";
        if (isAlert) {
          const alertMessage = `Possible ${classification.toLowerCase()} detected.`;
          addAlert(alertMessage, classification as Alert['type'], 'Activity');
          speak(`Alert: ${alertMessage}`);
        }
        addActivity(description, isAlert);
      }
    }, MONITORING_INTERVAL);
  };
  
  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
  };

  const handleGenerateMealPlan = async () => {
    setIsLoading(true);
    speak("Generating your personalized meal plan.");
    const plan = await GeminiService.generateMealPlan(MOCK_HEALTH_CONDITIONS);
    setMealPlan(plan);
    setIsLoading(false);
    speak("Your meal plan is ready.");
  };

  const handleGenerateMealPlanFromReport = async (file: File) => {
    setIsLoading(true);
    speak("Analyzing your patient report and generating a personalized meal plan.");
    try {
      const plan = await MealPlanService.generateMealPlanFromReport(token, file);
      setMealPlan(plan);
      speak("Your personalized meal plan based on your patient report is ready.");
    } catch (error: any) {
      speak("Failed to generate meal plan from report.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Setup camera when monitoring view is active
  useEffect(() => {
    const setupCamera = async () => {
      if (view === 'MONITORING') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          alert("Could not access the camera. Please ensure it is not in use by another application and that you have granted permission.");
        }
      }
    };

    setupCamera();
    
    // Cleanup when component unmounts or view changes
    return () => {
      stopMonitoring();
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [view]);
  

  const renderView = () => {
    // Calculate today's tablets from prescriptions
    console.log('🔍 Calculating today\'s tablets from prescriptions:', prescriptions);
    console.log('🔍 Prescription count:', prescriptions.length);
    
    const todayTablets = prescriptions.reduce((total, prescription) => {
      // Handle both string and number values, and null/undefined
      // Check the actual value type first
      const morningVal = prescription.Morning;
      const eveningVal = prescription.Evening;
      const nightVal = prescription.Night;
      
      console.log(`  Prescription: ${prescription.name}`);
      console.log(`    Raw values - Morning: "${morningVal}" (type: ${typeof morningVal}), Evening: "${eveningVal}" (type: ${typeof eveningVal}), Night: "${nightVal}" (type: ${typeof nightVal})`);
      
      // Convert to number, handling null, undefined, empty string, and string "0"
      // Handle both number and string types
      const morning = (morningVal !== null && morningVal !== undefined && morningVal !== '') 
        ? (typeof morningVal === 'number' ? morningVal : parseInt(String(morningVal), 10) || 0)
        : 0;
      const evening = (eveningVal !== null && eveningVal !== undefined && eveningVal !== '') 
        ? (typeof eveningVal === 'number' ? eveningVal : parseInt(String(eveningVal), 10) || 0)
        : 0;
      const night = (nightVal !== null && nightVal !== undefined && nightVal !== '') 
        ? (typeof nightVal === 'number' ? nightVal : parseInt(String(nightVal), 10) || 0)
        : 0;
      
      console.log(`    Parsed values - M:${morning}, E:${evening}, N:${night}, Total for this med: ${morning + evening + night}`);
      return total + morning + evening + night;
    }, 0);

    // Create a list of today's medications with timing
    const todayMedications: Array<{ name: string; timing: string; count: number; taken?: boolean }> = [];
    // Get today's verified medication logs
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVerifiedLogs = medicationLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime() && log.status === 'Verified';
    });

    // Helper function to match medication log name with prescription name
    const matchesMedication = (logMedication: string, prescriptionName: string): boolean => {
      const logLower = logMedication.toLowerCase();
      const prescLower = prescriptionName.toLowerCase();
      // Remove common suffixes like "tablets", "mg", etc. for better matching
      const logClean = logLower.replace(/\s*(tablets?|mg|ml|mcg|g|drops?|capsules?)\s*/gi, '').trim();
      const prescClean = prescLower.trim();
      return logLower.includes(prescLower) || 
             prescLower.includes(logLower) ||
             logClean.includes(prescClean) ||
             prescClean.includes(logClean);
    };

    prescriptions.forEach(prescription => {
      // Use the same parsing logic as above
      const morningVal = prescription.Morning;
      const eveningVal = prescription.Evening;
      const nightVal = prescription.Night;
      
      // Use the same parsing logic as in reduce
      const morning = (morningVal !== null && morningVal !== undefined && morningVal !== '') 
        ? (typeof morningVal === 'number' ? morningVal : parseInt(String(morningVal), 10) || 0)
        : 0;
      const evening = (eveningVal !== null && eveningVal !== undefined && eveningVal !== '') 
        ? (typeof eveningVal === 'number' ? eveningVal : parseInt(String(eveningVal), 10) || 0)
        : 0;
      const night = (nightVal !== null && nightVal !== undefined && nightVal !== '') 
        ? (typeof nightVal === 'number' ? nightVal : parseInt(String(nightVal), 10) || 0)
        : 0;
      
      // Check if this medication was verified today
      const verifiedToday = todayVerifiedLogs.some(log => 
        matchesMedication(log.medication, prescription.name)
      );
      
      if (morning > 0) {
        todayMedications.push({ 
          name: prescription.name, 
          timing: 'Morning', 
          count: morning,
          taken: verifiedToday // Mark as taken if verified today
        });
      }
      if (evening > 0) {
        todayMedications.push({ 
          name: prescription.name, 
          timing: 'Evening', 
          count: evening,
          taken: verifiedToday
        });
      }
      if (night > 0) {
        todayMedications.push({ 
          name: prescription.name, 
          timing: 'Night', 
          count: night,
          taken: verifiedToday
        });
      }
    });

    // Sort medications by timing: Morning, Evening, Night
    const timingOrder = { 'Morning': 1, 'Evening': 2, 'Night': 3 };
    todayMedications.sort((a, b) => {
      const orderA = timingOrder[a.timing as keyof typeof timingOrder] || 999;
      const orderB = timingOrder[b.timing as keyof typeof timingOrder] || 999;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      // If same timing, sort by name
      return a.name.localeCompare(b.name);
    });

    console.log('📊 Today\'s tablets calculated:', { todayTablets, todayMedications });

    const dashboardStats = {
      alertsToday: alerts.filter(a => new Date(a.timestamp).toDateString() === new Date().toDateString()).length,
      lastActivity: activities[0]?.description || 'No activity recorded',
      isMonitoring,
      todayTablets,
      todayMedications
    };

    switch (view) {
      case 'MONITORING':
        return <MonitoringView activities={activities} isMonitoring={isMonitoring} onToggleMonitoring={() => isMonitoring ? stopMonitoring() : startMonitoring()} onMedicationScan={handleMedicationScan} videoRef={videoRef} />;
      case 'MEAL_PLAN':
        return <MealPlanView mealPlan={mealPlan} onGenerate={handleGenerateMealPlan} onGenerateFromReport={handleGenerateMealPlanFromReport} isLoading={isLoading} token={token}/>;
      case 'PRESCRIPTIONS':
        return <PrescriptionsView prescriptions={prescriptions} onAddPrescription={handleAddPrescription} onPrescriptionAdded={loadPrescriptions} />;
      case 'GUARDIAN':
        return <GuardianView email={guardianEmail} onSaveEmail={handleSaveGuardianEmail} onTestEmail={handleTestEmail} />;
      case 'VOICE_ASSISTANT':
        return <VoiceAssistantView 
          prescriptions={prescriptions} 
          medicationLogs={medicationLogs}
          mealPlan={mealPlan}
          onSpeak={speak}
          onNavigateToScan={() => setView('MONITORING')}
          onTriggerMedicationScan={handleMedicationScan}
          onNavigateToMealPlan={() => setView('MEAL_PLAN')}
          onGenerateMealPlan={handleGenerateMealPlan}
        />;
      case 'BLOOD_REPORTS':
        return <BloodReportsView bloodReports={bloodReports} onBloodReportsUpdated={loadBloodReports} token={token} />;
      case 'DASHBOARD':
      default:
        return <DashboardView stats={dashboardStats} activities={activities} medicationLogs={medicationLogs} symptoms={symptoms} prescriptions={prescriptions} healthIssues={healthIssues} bloodReports={bloodReports} onSpeakTodayTablets={speakTodayTablets} />;
    }
  };

  const renderModalContent = () => {
    const {type, data} = modal;
    switch(type) {
      case 'loading':
        return <div style={{textAlign: 'center'}}><h3>{data.title}</h3><p>{data.message}</p><div className="spinner"></div></div>;
      case 'error':
      case 'info':
        return (
          <div>
            <h3>{data.title}</h3>
            <p>{data.message}</p>
            <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 20}}>
              <button 
                onClick={() => setModal({type: null, data: null})} 
                style={{...styles.actionButton, backgroundColor: UI_COLORS.secondary}}
              >
                Close
              </button>
            </div>
          </div>
        );
      case 'medication_result':
        return (
          <div>
            <h3>Medication Scan Result</h3>
            <p><strong>Medication Scanned:</strong> {data.medication}</p>
            <p><strong>Status:</strong> <span style={{color: data.status === 'Verified' ? UI_COLORS.success : UI_COLORS.danger}}>{data.status}</span></p>
            {data.status !== 'Verified' ? 
              <p>This does not match any medication on your prescription list.</p> :
              <p>Matched prescription: <strong>{data.matchedPrescription.name} {data.matchedPrescription.dosage}</strong>. Last taken time has been updated.</p>
            }
          </div>
        );
      case 'symptom_input':
        return (
          <div>
            <h3>Report a Symptom</h3>
            <p>Please describe your symptom in the text box below.</p>
            <form onSubmit={e => {
              e.preventDefault();
              const symptomText = (e.target as HTMLFormElement).elements.namedItem('symptom') as HTMLTextAreaElement;
              if(symptomText?.value) handleSymptomReport(symptomText.value);
            }}>
              <textarea name="symptom" style={styles.textarea} rows={4}></textarea>
              <button type="submit" style={styles.actionButton}>Submit Symptom</button>
            </form>
          </div>
        );
      case 'symptom_result':
        return (
          <div>
            <h3>Symptom Analysis</h3>
            <p><strong>Symptom:</strong> {data.description}</p>
            <p><strong>Severity:</strong> <span style={{color: data.severity === 'Urgent' ? UI_COLORS.danger : data.severity === 'Medium' ? UI_COLORS.warning : UI_COLORS.text}}>{data.severity}</span></p>
            <p><strong>Recommendation:</strong> {data.recommendation}</p>
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <>
    <style>{`
      .spinner {
        border: 4px solid rgba(0,0,0,0.1);
        border-left-color: ${UI_COLORS.primary};
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 1s linear infinite;
        margin: 20px auto;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
    <div style={styles.appContainer}>
      <Header onCommand={() => speechRecognitionRef.current?.start()} isListening={isListening} user={user} onLogout={onLogout} />
      <div style={styles.mainLayout}>
        <Sidebar currentView={view} setView={setView} />
        <main style={styles.content}>
          {renderView()}
        </main>
      </div>
      <Modal show={modal.type !== null} onClose={() => setModal({type: null, data: null})} title="System Message">
        {renderModalContent()}
      </Modal>
    </div>
    </>
  );
};

// Root App Component (Auth Wrapper)
export const App = () => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      AuthService.getMe(savedToken)
        .then((userData: any) => {
          setUser(userData);
          setToken(savedToken);
        })
        .catch((err: any) => {
          console.error('Failed to verify token:', err);
          localStorage.removeItem('authToken');
          setUser(null);
          setToken('');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (userData: any, authToken: string) => {
    setUser(userData);
    setToken(authToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setToken('');
  };

  if (isLoading) {
    return (
      <div style={{...styles.loginContainer}}>
        <div style={{textAlign: 'center'}}>
          <div className="spinner"></div>
          <p style={{color: UI_COLORS.textSecondary}}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <MainApp user={user} token={token} onLogout={handleLogout} />;
};

