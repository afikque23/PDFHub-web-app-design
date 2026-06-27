import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

export interface JobEventData {
  id: string;
  status: 'WAITING' | 'QUEUED' | 'DOWNLOADING' | 'PROCESSING' | 'UPLOADING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  errorMessage?: string;
  downloadUrl?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function useJobProgress(jobId: string | null) {
  const [jobData, setJobData] = useState<JobEventData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    let sse: EventSource | null = null;

    const connect = async () => {
      try {
        const token = await authService.getToken();
        if (!token) throw new Error('Unauthorized');

        sse = new EventSource(`${API_URL}/events/jobs/${jobId}?token=${token}`);

        sse.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'heartbeat') return; // Ignore heartbeats

          setJobData(data);

          if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(data.status)) {
            sse?.close();
          }
        };

        sse.onerror = (e) => {
          console.error('SSE Error:', e);
          // Browser will automatically try to reconnect. 
          // We don't forcefully close it unless we want to stop trying.
        };
      } catch (err: any) {
        setError(err.message);
      }
    };

    connect();

    return () => {
      if (sse) sse.close();
    };
  }, [jobId]);

  return { jobData, error };
}
