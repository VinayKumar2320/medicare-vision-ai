import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { MicIcon } from '../components/Icons';
import { UI_COLORS } from '../constants';
import { styles } from '../styles';
import type { Prescription, MedicationLog, MealPlan } from '../types';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface VoiceAssistantViewProps {
  prescriptions: Prescription[];
  medicationLogs: MedicationLog[];
  mealPlan: MealPlan | null;
  onSpeak: (text: string) => void;
  onNavigateToScan?: () => void;
  onTriggerMedicationScan?: () => void;
  onNavigateToMealPlan?: () => void;
  onGenerateMealPlan?: () => Promise<void>;
}

export const VoiceAssistantView = ({ 
  prescriptions = [], 
  medicationLogs = [], 
  mealPlan, 
  onSpeak, 
  onNavigateToScan, 
  onTriggerMedicationScan, 
  onNavigateToMealPlan, 
  onGenerateMealPlan 
}: VoiceAssistantViewProps) => {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'assistant',
      text: "Hello! I'm your voice assistant. I can help you with questions about your medications and meal planning. Try asking: 'What tablets do I need to take today?', 'What are my remaining tablets?', 'What can I eat today?', or say 'I am taking a tablet' to verify your medication.",
      timestamp: new Date()
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handleQuestionRef = useRef<((question: string) => void) | null>(null);
  const onSpeakRef = useRef<((text: string) => void) | null>(null);

  const scrollToBottom = useCallback(() => {
    try {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error scrolling:', error);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Calculate today's tablets
  const getTodayTablets = useCallback(() => {
    try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
      const todayVerifiedLogs = (medicationLogs || []).filter(log => {
        try {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime() && log.status === 'Verified';
        } catch {
          return false;
        }
    });

    const matchesMedication = (logMedication: string, prescriptionName: string): boolean => {
        const logLower = (logMedication || '').toLowerCase();
        const prescLower = (prescriptionName || '').toLowerCase();
      const logClean = logLower.replace(/\s*(tablets?|mg|ml|mcg|g|drops?|capsules?)\s*/gi, '').trim();
      const prescClean = prescLower.trim();
      return logLower.includes(prescLower) || 
             prescLower.includes(logLower) ||
             logClean.includes(prescClean) ||
             prescClean.includes(logClean);
    };

    const todayMedications: Array<{ name: string; timing: string; count: number; taken: boolean }> = [];
    let totalTablets = 0;

      (prescriptions || []).forEach(prescription => {
        try {
      const morning = parseInt(String(prescription.Morning || '0'), 10) || 0;
      const evening = parseInt(String(prescription.Evening || '0'), 10) || 0;
      const night = parseInt(String(prescription.Night || '0'), 10) || 0;
      
      totalTablets += morning + evening + night;

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
        } catch (e) {
          console.error('Error processing prescription:', e);
      }
    });

    return { totalTablets, todayMedications };
    } catch (error) {
      console.error('Error in getTodayTablets:', error);
      return { totalTablets: 0, todayMedications: [] };
    }
  }, [prescriptions, medicationLogs]);

  // Process user questions
  const handleQuestion = useCallback((question: string) => {
    try {
    setIsProcessing(true);
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: question,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

      const questionLower = (question || '').toLowerCase();
    let answer = '';

    if (questionLower.includes('tablet') && (questionLower.includes('today') || questionLower.includes('need') || questionLower.includes('take'))) {
      const { totalTablets, todayMedications } = getTodayTablets();
      
      if (totalTablets === 0) {
        answer = "You have no tablets scheduled for today.";
      } else {
        answer = `You have ${totalTablets} tablet${totalTablets > 1 ? 's' : ''} to take today. `;
        
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

        const medSummaries: string[] = [];
        Object.entries(medGroups).forEach(([name, info]) => {
          const timingText = info.timings.length === 1 
            ? info.timings[0].toLowerCase()
            : info.timings.slice(0, -1).join(', ').toLowerCase() + ' and ' + info.timings[info.timings.length - 1].toLowerCase();
          
          const countText = info.count === 1 ? '1 tablet' : `${info.count} tablets`;
          const statusText = info.taken ? 'already taken' : 'to be taken';
          
          medSummaries.push(`${countText} of ${name} ${statusText} in the ${timingText}`);
        });

        answer += medSummaries.join('. ') + '.';
      }
    } else if (questionLower.includes('remaining') || questionLower.includes('left') || questionLower.includes('still need')) {
      const { todayMedications } = getTodayTablets();
      const remaining = todayMedications.filter(m => !m.taken);
      
      if (remaining.length === 0) {
        answer = "Great! You've taken all your medications for today.";
      } else {
        const remainingCount = remaining.reduce((sum, m) => sum + m.count, 0);
        answer = `You still have ${remainingCount} tablet${remainingCount > 1 ? 's' : ''} remaining to take. `;
        
        const remainingList = remaining.map(m => `${m.count} ${m.name} in the ${m.timing.toLowerCase()}`).join(', ');
        answer += remainingList + '.';
      }
    } else if (questionLower.includes('taken') || questionLower.includes('already taken')) {
      const { todayMedications } = getTodayTablets();
      const taken = todayMedications.filter(m => m.taken);
      
      if (taken.length === 0) {
        answer = "You haven't taken any medications yet today.";
      } else {
        const takenCount = taken.reduce((sum, m) => sum + m.count, 0);
        answer = `You've taken ${takenCount} tablet${takenCount > 1 ? 's' : ''} today. `;
        
        const takenList = taken.map(m => `${m.count} ${m.name} in the ${m.timing.toLowerCase()}`).join(', ');
        answer += takenList + '.';
      }
    } else if (questionLower.includes('medication') || questionLower.includes('prescription')) {
        const safePrescriptions = prescriptions || [];
        if (safePrescriptions.length === 0) {
        answer = "You don't have any prescriptions recorded.";
      } else {
          answer = `You have ${safePrescriptions.length} prescription${safePrescriptions.length > 1 ? 's' : ''}. `;
          const medNames = safePrescriptions.map(p => p.name).join(', ');
        answer += `Your medications are: ${medNames}.`;
      }
    } else if (
      questionLower.includes('eat') || 
      questionLower.includes('food') || 
      questionLower.includes('meal') || 
      questionLower.includes('diet') ||
      questionLower.includes('breakfast') ||
      questionLower.includes('lunch') ||
      questionLower.includes('dinner') ||
      questionLower.includes('what can i eat')
    ) {
      if (mealPlan) {
          answer = `Here's your meal plan for today. For breakfast: ${mealPlan.breakfast}. For lunch: ${mealPlan.lunch}. For dinner: ${mealPlan.dinner}. Dietary tip: ${mealPlan.tips}.`;
      } else {
          answer = "I don't have a meal plan generated yet. Please go to the Meal Planner section to generate one.";
        if (onGenerateMealPlan) {
            setTimeout(async () => {
            try {
              await onGenerateMealPlan();
                if (onNavigateToMealPlan) {
                  setTimeout(() => onNavigateToMealPlan(), 1000);
                }
            } catch (error) {
                console.error('Error generating meal plan:', error);
              }
            }, 500);
        }
      }
    } else if (questionLower.includes('help') || questionLower.includes('what can you do')) {
        answer = "I can help you with questions about your medications and meal planning. You can ask me: 'What tablets do I need to take today?', 'What are my remaining tablets?', 'What medications have I taken?', 'What are my prescriptions?', 'What can I eat today?', or 'Help me plan my meals'.";
    } else if (
      (questionLower.includes('taking') || questionLower.includes('take') || questionLower.includes('about to take')) &&
      (questionLower.includes('tablet') || questionLower.includes('medicine') || questionLower.includes('medication') || questionLower.includes('pill'))
    ) {
        answer = "I'll help you verify that medication. Let me take you to the medication scanner.";
      setTimeout(() => {
        if (onNavigateToScan) {
          onNavigateToScan();
          setTimeout(() => {
            if (onTriggerMedicationScan) {
              onTriggerMedicationScan();
            }
          }, 3000);
        }
      }, 2000);
    } else {
        answer = "I'm not sure I understand that question. Try asking about your tablets for today, remaining medications, your prescriptions, or what you can eat today. You can also say 'help' to see what I can do.";
    }

      setTimeout(() => {
        try {
          const assistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            type: 'assistant',
            text: answer || "I'm sorry, I couldn't generate a response. Please try again.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, assistantMessage]);
          try {
            if (onSpeakRef.current && answer) {
              onSpeakRef.current(answer);
            }
          } catch (speakError) {
            console.error('Error speaking:', speakError);
          }
          setIsProcessing(false);
        } catch (responseError: any) {
          console.error('Error adding response:', responseError);
          setMessages(prev => [...prev, {
            id: `error-${Date.now()}`,
            type: 'assistant',
            text: "I'm sorry, I encountered an error processing your question. Please try again.",
            timestamp: new Date()
          }]);
          setIsProcessing(false);
        }
      }, 500);
    } catch (error: any) {
      console.error('Error handling question:', error);
      const errorDetails = error?.message || error?.toString() || 'Unknown error';
      console.error('Error details:', errorDetails, error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: 'assistant',
        text: `I'm sorry, I encountered an error: ${errorDetails}. Please try again or rephrase your question.`,
        timestamp: new Date()
      }]);
      setIsProcessing(false);
    }
  }, [getTodayTablets, prescriptions, mealPlan, onGenerateMealPlan, onNavigateToMealPlan, onNavigateToScan, onTriggerMedicationScan]);

  // Update refs when they change
  useEffect(() => {
    onSpeakRef.current = onSpeak || (() => {});
  }, [onSpeak]);

  useEffect(() => {
    handleQuestionRef.current = handleQuestion;
  }, [handleQuestion]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      console.log('✅ Network connection restored');
      setIsOnline(true);
      setError(null);
    };
    
    const handleOffline = () => {
      console.warn('⚠️ Network connection lost');
      setIsOnline(false);
      setError('You are currently offline. Voice recognition requires an internet connection.');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check initial status
    setIsOnline(navigator.onLine);
    if (!navigator.onLine) {
      setError('You are currently offline. Voice recognition requires an internet connection.');
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
        return;
      }
      
      // Check if online before initializing
      if (!navigator.onLine) {
        setError('You are currently offline. Voice recognition requires an internet connection.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setRetryCount(0); // Reset retry count on successful start
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error, event);
        console.error('Full error event:', JSON.stringify(event, null, 2));
        setIsListening(false);
        setIsProcessing(false);
        let errorMsg = "I encountered an error. Please try again.";
        
        if (event.error === 'no-speech') {
          errorMsg = "I didn't hear anything. Please try again.";
        } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          errorMsg = "Microphone access was denied. Please allow microphone access in your browser settings and try again.";
        } else if (event.error === 'audio-capture') {
          errorMsg = "I couldn't access your microphone. Please check your microphone settings.";
        } else if (event.error === 'network') {
          // Network error - this means the browser can't reach Google's speech recognition servers
          console.error('Network error details:', {
            online: navigator.onLine,
            userAgent: navigator.userAgent,
            language: navigator.language,
            retryCount: retryCount
          });
          
          if (!navigator.onLine) {
            errorMsg = "You appear to be offline. Please check your internet connection and try again. You can also use the text input option below to type your questions.";
          } else {
            const currentRetry = retryCount;
            setRetryCount(prev => prev + 1);
            
            if (currentRetry < 2) {
              errorMsg = `Network error: Unable to connect to the speech recognition service (attempt ${currentRetry + 1}/3). This could be due to firewall, VPN, or network restrictions.\n\n` +
                        "💡 Solution: Click 'Type Your Question Instead' button below to use text input instead. The assistant will work perfectly with text input!";
              
              // Note: Auto-retry removed - user should manually retry or use text input
              // The network issue is likely persistent and requires user action
            } else {
              errorMsg = "Network error: Unable to connect to the speech recognition service after multiple attempts. This is likely due to:\n\n" +
                        "• Firewall blocking Google's services\n" +
                        "• VPN blocking speech recognition\n" +
                        "• Corporate network restrictions\n" +
                        "• Regional restrictions\n\n" +
                        "✅ Good news: The text input option works perfectly! Click 'Type Your Question Instead' to continue using the assistant.";
            }
          }
        } else if (event.error === 'aborted') {
          errorMsg = "Listening was interrupted. Please try again.";
        } else if (event.error === 'service-not-allowed') {
          errorMsg = "Speech recognition service is not allowed. Please check your browser settings and allow speech recognition.";
        } else {
          errorMsg = `Error: ${event.error || 'Unknown error'}. Please try again.`;
        }
        
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          type: 'assistant',
          text: errorMsg,
          timestamp: new Date()
        }]);
        try {
          if (onSpeakRef.current) {
            onSpeakRef.current(errorMsg);
          }
        } catch (e) {
          console.error('Error speaking error message:', e);
        }
      };

      recognition.onresult = (event: any) => {
        try {
          console.log('Speech recognition result received:', event);
          if (!event.results || event.results.length === 0) {
            console.warn('No results in speech recognition event');
            setIsListening(false);
            return;
          }
          
          const firstResult = event.results[0];
          if (!firstResult || firstResult.length === 0) {
            console.warn('No transcript in first result');
            setIsListening(false);
            return;
          }
          
          const transcript = firstResult[0].transcript?.trim() || '';
          console.log('Extracted transcript:', transcript);
          
          if (!transcript) {
            console.warn('Empty transcript');
            setIsListening(false);
            return;
          }
          
          setIsListening(false);
          if (handleQuestionRef.current) {
            console.log('Calling handleQuestion with transcript:', transcript);
            handleQuestionRef.current(transcript);
          } else {
            console.error('handleQuestionRef.current is null!');
            setMessages(prev => [...prev, {
              id: `error-${Date.now()}`,
              type: 'assistant',
              text: 'Voice assistant is not ready. Please wait a moment and try again.',
              timestamp: new Date()
            }]);
          }
        } catch (error: any) {
          console.error('Error processing result:', error);
          console.error('Error stack:', error?.stack);
          setIsListening(false);
          setIsProcessing(false);
          setMessages(prev => [...prev, {
            id: `error-${Date.now()}`,
            type: 'assistant',
            text: `Error processing your speech: ${error?.message || 'Unknown error'}. Please try again.`,
            timestamp: new Date()
          }]);
        }
      };

      recognitionRef.current = recognition;
    } catch (error: any) {
      console.error('Error initializing recognition:', error);
      const errorMessage = error?.message || 'Unknown error';
      setError(`Failed to initialize voice recognition: ${errorMessage}. Please refresh the page.`);
      setMessages(prev => [...prev, {
        id: 'init-error',
        type: 'assistant',
        text: `Voice recognition initialization failed: ${errorMessage}. The voice assistant may not work properly.`,
        timestamp: new Date()
      }]);
    }
  }, []);

  const startListening = async () => {
    console.log('🎤 startListening called');
    console.log('recognitionRef.current:', recognitionRef.current);
    console.log('isListening:', isListening);
    console.log('isProcessing:', isProcessing);
    console.log('Network status:', navigator.onLine ? 'Online' : 'Offline');
    
    // Check network connectivity first
    if (!navigator.onLine) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: 'assistant',
        text: 'You appear to be offline. Voice recognition requires an internet connection. Please check your internet connection and try again.',
        timestamp: new Date()
      }]);
      return;
    }
    
    if (!recognitionRef.current) {
      console.error('❌ Recognition ref is null!');
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: 'assistant',
        text: 'Speech recognition is not available. Please refresh the page.',
        timestamp: new Date()
      }]);
      return;
    }
    
    if (isListening) {
      console.log('Already listening, stopping first');
      try {
        recognitionRef.current.stop();
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (e) {
        console.error('Error stopping:', e);
      }
    }
    
    if (isProcessing) {
      console.log('Still processing, please wait');
      return;
    }

    // Step 1: Request microphone permission FIRST (before starting recognition)
    let microphoneGranted = false;
    try {
      console.log('Step 1: Requesting microphone permission...');
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Request permission and keep stream open briefly to ensure permission is granted
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('✅ Microphone permission granted');
        microphoneGranted = true;
        
        // Keep stream open for a moment to ensure permission is fully granted
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Now stop the stream - we just needed permission
        stream.getTracks().forEach(track => {
          track.stop();
          console.log('Microphone track stopped');
        });
      } else {
        console.warn('getUserMedia not available');
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          type: 'assistant',
          text: 'Microphone access is not available in your browser. Please use a modern browser like Chrome, Edge, or Safari.',
          timestamp: new Date()
        }]);
        return;
      }
    } catch (permError: any) {
      console.error('❌ Microphone permission error:', permError);
      const errorMsg = permError.name === 'NotAllowedError' || permError.name === 'PermissionDeniedError'
        ? 'Microphone access was denied. Please click the lock icon in your browser\'s address bar, go to Site Settings, and allow microphone access. Then try again.'
        : permError.name === 'NotFoundError' || permError.name === 'DevicesNotFoundError'
        ? 'No microphone found. Please connect a microphone and try again.'
        : `Could not access microphone: ${permError.message || permError.name || 'Unknown error'}. Please check your microphone settings.`;
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: 'assistant',
        text: errorMsg,
        timestamp: new Date()
      }]);
      return;
    }

    // Step 2: Only start recognition after microphone permission is granted
    if (!microphoneGranted) {
      console.error('❌ Microphone permission was not granted');
      return;
    }

    // Step 2.5: Test network connectivity to Google's services
    // Note: This is a basic test - the actual speech recognition service might still fail
    // even if this test passes, due to firewall/VPN restrictions
    try {
      console.log('Step 2.5: Testing network connectivity...');
      console.log('Browser info:', {
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        language: navigator.language
      });
      
      // Try to fetch from Google to test connectivity
      // Using no-cors mode to avoid CORS issues
      const testConnection = await Promise.race([
        fetch('https://www.google.com/favicon.ico', { 
          method: 'HEAD', 
          mode: 'no-cors',
          cache: 'no-cache'
        }).then(() => {
          console.log('✅ Basic network connectivity test passed');
          return true;
        }).catch((err) => {
          console.warn('Network test fetch error:', err);
          return false;
        }),
        new Promise<boolean>((resolve) => setTimeout(() => {
          console.warn('⚠️ Network test timeout');
          resolve(false);
        }, 3000))
      ]);
      
      if (!testConnection) {
        console.warn('⚠️ Network connectivity test failed - but continuing anyway');
        // Don't block - the test might fail due to CORS but speech recognition might still work
        // We'll let the actual recognition.onerror handle the real network errors
      }
    } catch (networkTestError) {
      console.warn('⚠️ Network test error (continuing anyway):', networkTestError);
      // Continue anyway - the test might fail due to CORS but connection might still work
    }

    try {
      console.log('Step 3: Starting speech recognition...');
      console.log('Recognition object:', recognitionRef.current);
      
      // Small delay to ensure everything is ready
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Check if recognition is still available
      if (!recognitionRef.current) {
        throw new Error('Speech recognition became unavailable');
      }
      
      // Try to start recognition
      console.log('Attempting to start recognition...');
      recognitionRef.current.start();
      console.log('✅ Speech recognition start() called successfully');
      
      // Note: If there's a network error, it will be caught by recognition.onerror
      // which is set up in the useEffect initialization
    } catch (error: any) {
      console.error('❌ Error starting recognition (caught in try-catch):', error);
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      
      const errorMsg = error?.message?.includes('already started')
        ? 'Speech recognition is already running. Please wait a moment.'
        : error?.message?.includes('network') || error?.message?.includes('Network')
        ? 'Network error: The speech recognition service requires an internet connection. Please check your connection and try again. If you are online, the service may be temporarily unavailable. You may also need to check if your firewall or VPN is blocking access to Google\'s services.'
        : `Could not start listening: ${error?.message || error?.toString() || 'Unknown error'}. Please try again.`;
      
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: 'assistant',
        text: errorMsg,
        timestamp: new Date()
      }]);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
      recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping:', error);
      }
    }
  };

  const handleTextSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    const question = textInput.trim();
    if (!question) return;
    
    setTextInput('');
    setShowTextInput(false);
    if (handleQuestionRef.current) {
      handleQuestionRef.current(question);
    }
  };

  return (
    <div style={styles.viewContainer}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
      <DashboardCard title="Voice Assistant" style={styles.fullWidthCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          {error && (
            <div style={{ 
              flex: 1,
              padding: '12px', 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffc107', 
              borderRadius: 4, 
              marginRight: 12 
            }}>
              {error}
            </div>
          )}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: isOnline ? '#d4edda' : '#f8d7da',
            border: `1px solid ${isOnline ? '#28a745' : '#dc3545'}`,
            borderRadius: 4,
            fontSize: '0.875rem',
            color: isOnline ? '#155724' : '#721c24'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isOnline ? '#28a745' : '#dc3545'
            }} />
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 200px)',
          maxHeight: '600px'
        }}>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            backgroundColor: UI_COLORS.background,
            borderRadius: '8px',
            marginBottom: '16px',
            minHeight: '300px'
          }}>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.type === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: message.type === 'user' ? UI_COLORS.primary : UI_COLORS.surface,
                    color: message.type === 'user' ? '#fff' : UI_COLORS.text,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                    {message.text}
                  </p>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  color: UI_COLORS.textSecondary,
                  marginTop: '4px',
                  padding: '0 4px'
                }}>
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
            {isProcessing && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: UI_COLORS.surface,
                  color: UI_COLORS.text
                }}>
                  <span style={{ fontStyle: 'italic' }}>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px'
          }}>
            {/* Text input option */}
            {showTextInput ? (
              <form onSubmit={handleTextSubmit} style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your question here..."
                  disabled={isProcessing}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    border: `2px solid ${UI_COLORS.primary}`,
                    outline: 'none',
                    backgroundColor: '#fff'
                  }}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isProcessing || !textInput.trim()}
                  style={{
                    padding: '12px 24px',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: UI_COLORS.primary,
                    color: '#fff',
                    cursor: isProcessing || !textInput.trim() ? 'not-allowed' : 'pointer',
                    opacity: isProcessing || !textInput.trim() ? 0.6 : 1
                  }}
                >
                  Send
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTextInput(false);
                    setTextInput('');
                  }}
                  style={{
                    padding: '12px 16px',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    border: `1px solid ${UI_COLORS.border}`,
                    backgroundColor: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: isListening ? UI_COLORS.danger : UI_COLORS.primary,
                    color: '#fff',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s',
                    opacity: isProcessing ? 0.6 : 1
                  }}
                  title={isListening ? 'Stop listening' : 'Start listening'}
                >
                  <MicIcon active={isListening} />
                </button>
                {isListening && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: UI_COLORS.danger,
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }} />
                    <p style={{ margin: 0, color: UI_COLORS.danger, fontWeight: 'bold' }}>
                      Listening... Ask your question now!
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Toggle button */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button
                onClick={() => setShowTextInput(!showTextInput)}
                disabled={isProcessing || isListening}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.875rem',
                  borderRadius: '6px',
                  border: `1px solid ${UI_COLORS.border}`,
                  backgroundColor: showTextInput ? UI_COLORS.primary : '#fff',
                  color: showTextInput ? '#fff' : UI_COLORS.text,
                  cursor: isProcessing || isListening ? 'not-allowed' : 'pointer',
                  opacity: isProcessing || isListening ? 0.6 : 1
                }}
              >
                {showTextInput ? '🎤 Use Voice Instead' : '⌨️ Type Your Question Instead'}
              </button>
            </div>
            
            {/* Help text */}
            {!showTextInput && (
              <p style={{ 
                textAlign: 'center', 
                fontSize: '0.875rem', 
                color: UI_COLORS.textSecondary,
                margin: 0,
                fontStyle: 'italic'
              }}>
                Having trouble with voice? Click "Type Your Question Instead" to use text input.
              </p>
            )}
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};
