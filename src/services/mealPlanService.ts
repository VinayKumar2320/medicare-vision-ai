import type { MealPlan } from '../types';
import { API_BASE_URL } from '../constants';

export const MealPlanService = {
  generateMealPlanFromReport: async (token: string, file: File): Promise<MealPlan> => {
    try {
      if (!token) {
        throw new Error('Authentication token is missing. Please log in again.');
      }

      const formData = new FormData();
      formData.append('file', file);

      console.log('📤 Uploading patient report for meal plan generation:', file.name, 'Size:', file.size, 'Type:', file.type);

      const res = await fetch(`${API_BASE_URL}/api/meal-plans/generate`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });

      console.log('📥 Response status:', res.status, res.statusText);

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('❌ Non-JSON response from meal plan API:', text.substring(0, 500));
        throw new Error('Server returned non-JSON response. Make sure the server is running and the route is registered.');
      }
      
      const data = await res.json();
      console.log('✅ Meal plan generation response:', data);
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate meal plan');
      }

      if (!data.data || !data.data.mealPlan) {
        throw new Error('Invalid response format from server');
      }

      return data.data.mealPlan;
    } catch (error: any) {
      console.error('❌ Meal plan generation error:', error);
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please make sure the server is running on port 3001.');
      }
      throw new Error(error.message || 'Failed to generate meal plan from report');
    }
  }
};

