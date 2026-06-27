import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { authService } from '../services/auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function fetchWithAuth(endpoint: string) {
  const token = await authService.getToken();
  if (!token) throw new Error('Unauthorized');
  
  const response = await axios.get(`${API_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => fetchWithAuth('/admin/dashboard'),
  });
}

export function useAdminUsers(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['admin', 'users', page, limit],
    queryFn: () => fetchWithAuth(`/admin/users?page=${page}&limit=${limit}`),
  });
}

export function useAdminFiles(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['admin', 'files', page, limit],
    queryFn: () => fetchWithAuth(`/admin/files?page=${page}&limit=${limit}`),
  });
}

export function useAdminJobs(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['admin', 'jobs', page, limit],
    queryFn: () => fetchWithAuth(`/admin/jobs?page=${page}&limit=${limit}`),
  });
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: () => fetchWithAuth('/admin/analytics'),
  });
}
