import type { BloodReport } from '../types';
import { API_BASE_URL } from '../constants';

export const BloodReportService = {
  getBloodReports: async (token: string): Promise<BloodReport[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/blood-reports`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response from blood reports API:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response. Make sure the server is running and the route is registered.');
      }
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch blood reports');
      return data.data || [];
    } catch (error: any) {
      console.error('Get blood reports error:', error);
      return [];
    }
  },
  
  uploadBloodReport: async (token: string, file: File) => {
    try {
      if (!token) {
        throw new Error('Authentication token is missing. Please log in again.');
      }

      const formData = new FormData();
      formData.append('file', file);

      console.log('📤 Uploading blood report file:', file.name, 'Size:', file.size, 'Type:', file.type);
      console.log('🔑 Using token:', token.substring(0, 20) + '...');

      const res = await fetch(`${API_BASE_URL}/api/blood-reports/upload`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
          // Don't set Content-Type header - let browser set it with boundary for FormData
        },
        body: formData
      });

      console.log('📥 Response status:', res.status, res.statusText);
      console.log('📥 Response headers:', Object.fromEntries(res.headers.entries()));

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('❌ Non-JSON response from blood reports upload API:', text.substring(0, 500));
        throw new Error('Server returned non-JSON response. Make sure the server is running and the route is registered.');
      }
      
      const data = await res.json();
      console.log('✅ Upload response:', data);
      
      if (!res.ok) throw new Error(data.error || 'Failed to upload blood report');
      return data.data;
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please make sure the server is running on port 3001.');
      }
      throw new Error(error.message || 'Failed to upload blood report');
    }
  },
  
  deleteBloodReport: async (token: string, reportId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/blood-reports/${reportId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete blood report');
      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete blood report');
    }
  }
};

