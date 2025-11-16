import { GoogleGenAI, Type } from "@google/genai";
import type { Symptom, MealPlan } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
  analyzeActivity: async (imageBase64: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
            { text: "Analyze the person's activity in this image. Classify it as 'Walking', 'Sitting', 'Standing', 'Lying Down', 'Fallen', or 'In Distress'. Provide a brief, one-sentence description. Format as: 'Classification: [Your Classification]. Description: [Your Description].'" }
          ]
        },
      });
      return response.text;
    } catch (error) {
      console.error("Error analyzing activity:", error);
      return "Classification: Unknown. Description: Could not analyze activity due to an API error.";
    }
  },

  verifyMedication: async (imageBase64: string): Promise<{ name: string; dosage: string }> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
            { text: `Read the medication name and dosage from the image. The text might be on a pill bottle, a box, or a handwritten note. Extract the primary medication name and its dosage.` }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'The name of the medication.' },
              dosage: { type: Type.STRING, description: 'The dosage of the medication, e.g., "10mg".' },
            },
            required: ['name', 'dosage'],
          },
        },
      });
      return JSON.parse(response.text);
    } catch (error) {
      console.error("Error verifying medication:", error);
      return { name: "Unknown", dosage: "" };
    }
  },

  analyzeSymptom: async (symptomText: string): Promise<Symptom> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `A user reports the following symptom: "${symptomText}". Analyze this symptom. Classify its severity as 'Low', 'Medium', or 'Urgent'. Provide a brief, one-sentence recommendation for the user.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              severity: { type: Type.STRING },
              recommendation: { type: Type.STRING },
            },
            required: ['severity', 'recommendation'],
          },
        },
      });
      const result = JSON.parse(response.text);
      return {
        id: `sym-${Date.now()}`,
        timestamp: new Date(),
        description: symptomText,
        severity: (result.severity as 'Low' | 'Medium' | 'Urgent') || 'Medium',
        recommendation: result.recommendation || 'Consult a healthcare professional.',
      };
    } catch (error) {
      console.error("Error analyzing symptom:", error);
      return {
        id: `sym-${Date.now()}`,
        timestamp: new Date(),
        description: symptomText,
        severity: 'Medium',
        recommendation: 'Could not analyze symptom. Please contact a healthcare professional directly.',
      };
    }
  },

  generateMealPlan: async (healthConditions: string): Promise<MealPlan> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a one-day meal plan (breakfast, lunch, dinner) for a person with the following health conditions: ${healthConditions}. Also provide one general dietary tip.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              breakfast: { type: Type.STRING },
              lunch: { type: Type.STRING },
              dinner: { type: Type.STRING },
              tips: { type: Type.STRING },
            },
            required: ['breakfast', 'lunch', 'dinner', 'tips'],
          },
        },
      });
      return JSON.parse(response.text);
    } catch (error) {
      console.error("Error generating meal plan:", error);
      return {
        breakfast: 'Could not generate plan.',
        lunch: 'Could not generate plan.',
        dinner: 'Could not generate plan.',
        tips: 'An API error occurred.',
      };
    }
  },
};

