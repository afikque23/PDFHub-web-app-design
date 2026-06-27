import { useQuery } from '@tanstack/react-query';
import { workerService } from '../services/worker.service';

export function useHistory() {
  return useQuery({
    queryKey: ['jobs', 'history'],
    queryFn: () => workerService.getJobs(),
  });
}
