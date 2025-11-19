import { API_BASE_URL } from '../constants';

export const PrescriptionService = {
  getPrescriptions: async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/prescriptions`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch prescriptions');
      
      // Debug: Log the raw response
      console.log('🔍 PrescriptionService: Raw API response:', JSON.stringify(data, null, 2));
      if (data.data && data.data.length > 0) {
        console.log('🔍 PrescriptionService: First prescription from API:', data.data[0]);
        console.log('🔍 PrescriptionService: First prescription has Morning?', 'Morning' in data.data[0], 'Value:', data.data[0].Morning);
      }
      
      return data.data || [];
    } catch (error: any) {
      console.error('Get prescriptions error:', error);
      return [];
    }
  },
  addPrescription: async (token: string, name: string, dosage: string, frequency: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/prescriptions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name, dosage, frequency })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add prescription');
      return data.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add prescription');
    }
  },
  deletePrescription: async (token: string, prescriptionId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/prescriptions/${prescriptionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete prescription');
      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete prescription');
    }
  },
  uploadPrescriptionImage: async (token: string, imageFile: File) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const res = await fetch(`${API_BASE_URL}/api/prescriptions/upload`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload prescription');
      return data.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload prescription');
    }
  }
};

