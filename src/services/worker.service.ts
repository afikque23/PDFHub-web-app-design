import axios from 'axios';
import { authService } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const workerService = {
  async createJob(payload: { tool: string; inputFileIds: string[]; options?: any; priority?: string }) {
    const token = await authService.getToken();
    if (!token) throw new Error('Unauthorized');

    const response = await axios.post(`${API_URL}/jobs`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // { jobId: string, status: string }
  },

  async getJobs() {
    const token = await authService.getToken();
    if (!token) throw new Error('Unauthorized');

    const response = await axios.get(`${API_URL}/jobs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
