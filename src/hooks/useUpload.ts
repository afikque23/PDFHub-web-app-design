import { useState } from 'react';
import { storageService } from '../services/storage.service';
import { authService } from '../services/auth.service';

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setProgress(10); // Fake initial progress for UI feel

    try {
      const user = await authService.getUser();
      if (!user) throw new Error('You must be logged in to upload files');

      // In a real world scenario with large files, we'd use Supabase TUS resumable upload
      // to track actual byte progress. For now, we simulate a fast jump.
      setProgress(50);
      
      const path = await storageService.uploadInputFile(file, user.id);
      
      setProgress(100);
      setIsUploading(false);
      return path;
    } catch (error) {
      setIsUploading(false);
      setProgress(0);
      throw error;
    }
  };

  return { uploadFile, isUploading, progress };
}
