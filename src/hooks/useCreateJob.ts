import { useMutation } from '@tanstack/react-query';
import { workerService } from '../services/worker.service';

interface CreateJobParams {
  tool: string;
  inputFileIds: string[];
  options?: any;
}

export function useCreateJob() {
  return useMutation({
    mutationFn: (params: CreateJobParams) => workerService.createJob(params),
  });
}
