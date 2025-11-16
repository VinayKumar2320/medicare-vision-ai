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

export const VoiceAssistantView = ({ prescriptions, medicationLogs, mealPlan, onSpeak, onNavigateToScan, onTriggerMedicationScan, onNavigateToMealPlan, onGenerateMealPlan }: VoiceAssistantViewProps) => {
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
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handleQuestionRef = useRef<((question: string) => void) | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition (only once)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, {
        id: 'error',
        type: 'assistant',
        text: 'Sorry, speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari for voice features.',
        timestamp: new Date()
      }]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      setIsListening(true);
    };

    recognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setIsProcessing(false);
      
      let errorMessage = "I encountered an error. Please try again.";
      if (event.error === 'no-speech') {
        errorMessage = "I didn't hear anything. Please try again.";
      } else if (event.error === 'audio-capture') {
        errorMessage = "I couldn't access your microphone. Please check your microphone permissions.";
      } else if (event.error === 'not-allowed') {
        errorMessage = "Microphone access was denied. Please allow microphone access and try again.";
      } else if (event.error === 'network') {
        errorMessage = "Network error occurred. Please check your connection and try again.";
      }
      
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: 'assistant',
        text: errorMessage,
        timestamp: new Date()
      }]);
      onSpeak(errorMessage);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      console.log('🎤 Speech recognized:', transcript);
      // Call handleQuestion through a ref to avoid dependency issues
      if (handleQuestionRef.current) {
        handleQuestionRef.current(transcript);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only initialize once

  // Update the ref when handleQuestion changes
  useEffect(() => {
    handleQuestionRef.current = handleQuestion;
  }, [handleQuestion]);

  // Calculate today's tablets
  const getTodayTablets = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayVerifiedLogs = medicationLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime() && log.status === 'Verified';
    });

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

    const todayMedications: Array<{ name: string; timing: string; count: number; taken: boolean }> = [];
    let totalTablets = 0;

    prescriptions.forEach(prescription => {
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
    });

    return { totalTablets, todayMedications };
  }, [prescriptions, medicationLogs]);

  // Process user questions and generate answers
  const handleQuestion = useCallback((question: string) => {
    setIsProcessing(true);
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: question,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    const questionLower = question.toLowerCase();
    let answer = '';

    // Question patterns
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
      if (prescriptions.length === 0) {
        answer = "You don't have any prescriptions recorded.";
      } else {
        answer = `You have ${prescriptions.length} prescription${prescriptions.length > 1 ? 's' : ''}. `;
        const medNames = prescriptions.map(p => p.name).join(', ');
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
      // User is asking about meals
      if (mealPlan) {
        answer = `Here's your meal plan for today. For breakfast: ${mealPlan.breakfast}. For lunch: ${mealPlan.lunch}. For dinner: ${mealPlan.dinner}. Dietary tip: ${mealPlan.tips}. Would you like me to generate a new meal plan?`;
      } else {
        answer = "I don't have a meal plan generated yet. Let me create one for you based on your health profile. This will take a moment.";
        
        // Generate meal plan
        if (onGenerateMealPlan) {
          // Generate meal plan asynchronously
          (async () => {
            try {
              await onGenerateMealPlan();
              // Navigate to meal plan view after generation
              setTimeout(() => {
                if (onNavigateToMealPlan) {
                  onNavigateToMealPlan();
                }
              }, 1000);
            } catch (error) {
              const errorMessage: Message = {
                id: `assistant-error-${Date.now()}`,
                type: 'assistant',
                text: "I'm sorry, I couldn't generate a meal plan right now. Please try again later or use the Meal Planner page.",
                timestamp: new Date()
              };
              setMessages(prev => [...prev, errorMessage]);
              onSpeak("I'm sorry, I couldn't generate a meal plan right now. Please try again later.");
            }
          })();
        } else {
          answer = "I can help you with meal planning. Please navigate to the Meal Planner page to generate a meal plan.";
        }
      }
    } else if (questionLower.includes('help') || questionLower.includes('what can you do')) {
      answer = "I can help you with questions about your medications and meal planning. You can ask me: 'What tablets do I need to take today?', 'What are my remaining tablets?', 'What medications have I taken?', 'What are my prescriptions?', 'What can I eat today?', or 'Help me plan my meals'. You can also say 'I am taking a tablet' to verify your medication. Just click the microphone button and ask your question!";
    } else if (
      (questionLower.includes('taking') || questionLower.includes('take') || questionLower.includes('about to take')) &&
      (questionLower.includes('tablet') || questionLower.includes('medicine') || questionLower.includes('medication') || questionLower.includes('pill'))
    ) {
      // User wants to verify a medication they're taking
      answer = "I'll help you verify that medication. Let me take you to the medication scanner. Please hold your medication in front of the camera - I'll start scanning in a few seconds.";
      
      // Navigate to monitoring view and trigger scan after delays to allow camera initialization
      setTimeout(() => {
        if (onNavigateToScan) {
          onNavigateToScan();
          // Wait for navigation and camera initialization (3 seconds should be enough)
          setTimeout(() => {
            if (onTriggerMedicationScan) {
              onTriggerMedicationScan();
            }
          }, 3000);
        }
      }, 2000);
    } else {
      answer = "I'm not sure I understand that question. Try asking about your tablets for today, remaining medications, your prescriptions, or what you can eat today. You can also say 'I am taking a tablet' to verify your medication, or 'help' to see what I can do.";
    }

    // Add assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        text: answer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      onSpeak(answer);
      setIsProcessing(false);
    }, 500);
  }, [getTodayTablets, prescriptions, mealPlan, onSpeak, onGenerateMealPlan, onNavigateToMealPlan, onNavigateToScan, onTriggerMedicationScan]);

  const startListening = () => {
    if (!recognitionRef.current) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: 'assistant',
        text: 'Speech recognition is not available. Please refresh the page and try again.',
        timestamp: new Date()
      }]);
      return;
    }
    
    if (isListening) {
      console.log('Already listening');
      return;
    }
    
    if (isProcessing) {
      console.log('Still processing previous request');
      return;
    }
    
    try {
      console.log('🎤 Starting speech recognition...');
      recognitionRef.current.start();
    } catch (error: any) {
      console.error('Error starting speech recognition:', error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: 'assistant',
        text: `Could not start listening: ${error.message || 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      }]);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        console.log('🎤 Stopping speech recognition...');
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        setIsListening(false);
      }
    }
  };

  return (
    <div style={styles.viewContainer}>
      <DashboardCard title="Voice Assistant" style={styles.fullWidthCard}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 200px)',
          maxHeight: '600px'
        }}>
          {/* Messages area */}
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
                  <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
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

          {/* Control buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            padding: '16px'
          }}>
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
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title={isListening ? 'Stop listening' : 'Start listening'}
            >
              <MicIcon active={isListening} />
            </button>
            {isListening && (
              <p style={{ margin: 0, color: UI_COLORS.danger, fontWeight: 'bold' }}>
                Listening... Ask your question now!
              </p>
            )}
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

