import { API_BASE_URL } from '../constants';

export const AuthService = {
  register: async (email: string, password: string, name: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      
      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response from register API:', text.substring(0, 200));
        throw new Error('Server is not responding. Please make sure the server is running on port 3001.');
      }
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Register failed');
      return data.data;
    } catch (error: any) {
      if (error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please make sure the server is running on port 3001.');
      }
      throw new Error(error.message || 'Register failed');
    }
  },
  login: async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response from login API:', text.substring(0, 200));
        throw new Error('Server is not responding. Please make sure the server is running on port 3001.');
      }
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      return data.data;
    } catch (error: any) {
      if (error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please make sure the server is running on port 3001.');
      }
      throw new Error(error.message || 'Login failed');
    }
  },
  getMe: async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch user');
      return data.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch user');
    }
  }
};

