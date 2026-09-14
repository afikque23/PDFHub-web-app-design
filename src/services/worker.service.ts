import { supabase } from '../lib/supabase';

export const workerService = {
  async createJob(payload: { tool: string; inputFileIds: string[]; options?: any; priority?: string }) {
    return { jobId: 'job_' + Date.now(), status: 'COMPLETED' };
  },

  async getJobs() {
    try {
      const { data: files } = await supabase.storage.from('pdfhub-output').list('', { limit: 50 });
      if (!files || files.length === 0) return [];
      return files.map((f) => ({
        id: f.id || f.name,
        tool: 'PDF Processing',
        status: 'COMPLETED',
        progress: 100,
        createdAt: f.created_at || new Date().toISOString(),
        completedAt: f.created_at || new Date().toISOString(),
        inputFileIds: [f.name],
        outputFileId: f.name,
      }));
    } catch {
      return [];
    }
  },
};
