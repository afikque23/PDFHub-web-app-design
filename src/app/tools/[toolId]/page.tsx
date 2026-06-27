"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CloudUpload, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toolsData } from "../../data/tools";
import { twMerge } from "tailwind-merge";
import { useUpload } from "../../../hooks/useUpload";
import { useCreateJob } from "../../../hooks/useCreateJob";
import { useJobProgress } from "../../../hooks/useJobProgress";
import { FilePreviewCard } from "../../components/FilePreviewCard";
import { downloadService } from "../../../services/download.service";
import { toast } from "sonner";

function mapToolIdToJobTool(id: string): string {
  if (id.includes('compress')) return 'COMPRESS';
  if (id.includes('split')) return 'SPLIT';
  if (id.includes('merge')) return 'MERGE';
  if (id.includes('rotate')) return 'ROTATE';
  if (id.includes('watermark')) return 'WATERMARK';
  if (id.includes('word') || id.includes('excel') || id.includes('ppt') || id.includes('jpg')) return 'CONVERT';
  if (id.includes('ocr')) return 'OCR';
  return 'COMPRESS';
}

export default function ToolPage() {
  const params = useParams();
  const router = useRouter();
  const toolId = params?.toolId as string;
  const tool = toolsData.find((t) => t.id === toolId) || toolsData[0];
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const { uploadFile, isUploading, progress: uploadProgress } = useUpload();
  const { mutate: createJob, isPending: isCreatingJob } = useCreateJob();
  const { jobData, error: jobError } = useJobProgress(jobId);

  // Reset state when tool changes
  useEffect(() => {
    setSelectedFile(null);
    setJobId(null);
  }, [toolId]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    try {
      // 1. Upload to Supabase Storage
      const storagePath = await uploadFile(file);
      
      // 2. Create Job
      createJob(
        {
          tool: mapToolIdToJobTool(toolId),
          inputFileIds: [storagePath],
        },
        {
          onSuccess: (data) => {
            setJobId(data.jobId);
            toast.success("Job created successfully! Processing started.");
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || err.message || "Failed to create job");
            setSelectedFile(null); // Reset
          }
        }
      );
    } catch (err: any) {
      toast.error(err.message || "Upload failed. Please make sure you are logged in.");
      setSelectedFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setJobId(null);
  };

  const handleDownload = () => {
    if (jobData?.downloadUrl) {
      downloadService.triggerDownload(jobData.downloadUrl, `PDFHub_${selectedFile?.name || 'result.pdf'}`);
      toast.success("Download started!");
    }
  };

  const isProcessing = isUploading || isCreatingJob || (jobData && jobData.status !== 'COMPLETED' && jobData.status !== 'FAILED' && jobData.status !== 'CANCELLED');
  const showUploadScreen = !selectedFile && !isProcessing && !jobData;

  return (
    <div className="min-h-[calc(100vh-72px)] flex bg-[#fdfdfd]">
      <div className="flex-1 flex flex-col items-center justify-center p-6 py-12 w-full max-w-5xl mx-auto">
        
        {/* Upload Screen */}
        {showUploadScreen && (
          <div className="w-full max-w-3xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
            <h1 className="text-4xl md:text-[48px] font-bold text-text-primary mb-4">{tool.name}</h1>
            <p className="text-[18px] text-text-secondary mb-10 max-w-xl">{tool.description}</p>
            
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={twMerge(
                "group w-full h-80 rounded-[var(--radius-upload)] border-2 border-dashed flex flex-col items-center justify-center p-8 transition-all duration-200 cursor-pointer relative",
                isDragging 
                  ? "border-primary bg-primary-light" 
                  : "border-border bg-white hover:border-primary hover:bg-primary-light/50",
                "shadow-[var(--shadow-card)]"
              )}
            >
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={handleFileSelect}
                multiple={false}
              />
              <div className={twMerge(
                "w-20 h-20 bg-primary-light text-primary rounded-full flex items-center justify-center mb-6 transition-transform",
                isDragging ? "scale-110" : "group-hover:-translate-y-1 group-hover:scale-105"
              )}>
                <CloudUpload className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Upload Your PDF</h3>
              <p className="text-text-secondary mb-6">Drag & drop your file here or click to browse</p>
              
              <Button size="lg" className="pointer-events-none">
                Choose File
              </Button>
              
              <div className="mt-6 flex items-center gap-4 text-sm text-text-secondary font-medium">
                <span className="bg-gray-100 px-3 py-1 rounded-md">PDF</span>
                {toolId?.includes('word') && <span className="bg-gray-100 px-3 py-1 rounded-md">DOCX</span>}
                {toolId?.includes('jpg') && <span className="bg-gray-100 px-3 py-1 rounded-md">JPG</span>}
                <span className="text-gray-400">|</span>
                <span>Max File Size: 100 MB</span>
              </div>
            </div>
            
            <p className="flex items-center text-sm text-text-secondary mt-8 gap-2">
              <AlertCircle className="w-4 h-4" />
              Your files are encrypted and automatically deleted after processing.
            </p>
          </div>
        )}

        {/* Processing / Result Screen */}
        {!showUploadScreen && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
            <h2 className="text-3xl font-bold text-text-primary mb-8">
              {jobData?.status === 'COMPLETED' ? 'Task Completed!' : 'Working on it...'}
            </h2>
            
            <FilePreviewCard
              file={selectedFile || undefined}
              status={jobData?.status || (isUploading ? 'UPLOADING_INPUT' : 'INITIALIZING')}
              progress={jobData ? jobData.progress : (isUploading ? uploadProgress : 0)}
              downloadUrl={jobData?.downloadUrl}
              errorMessage={jobData?.errorMessage || jobError || undefined}
              onCancel={handleReset}
              onRetry={handleReset}
              onDownload={handleDownload}
            />

            {jobData?.status === 'COMPLETED' && (
               <div className="mt-8 flex justify-center">
                  <Button variant="outline" onClick={handleReset} className="gap-2">
                     <RefreshCw className="w-4 h-4" />
                     Process Another File
                  </Button>
               </div>
            )}
          </div>
        )}
      </div>

      {/* Right Sidebar (Desktop) */}
      <div className="hidden lg:flex w-80 border-l border-border bg-white flex-col p-8 overflow-y-auto">
         <h3 className="font-bold text-lg mb-4 text-text-primary">About {tool.name}</h3>
         <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            {tool.description} Fast, reliable, and completely secure. All files are encrypted with TLS and deleted automatically from our servers.
         </p>
         
         <div className="space-y-6">
            <div>
               <h4 className="font-semibold text-sm mb-2">Supported Formats</h4>
               <div className="flex gap-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded font-medium">PDF</span>
               </div>
            </div>
            
            <div>
               <h4 className="font-semibold text-sm mb-2">Tips</h4>
               <ul className="text-sm text-text-secondary space-y-2 list-disc pl-4">
                  <li>Max file size is 100 MB.</li>
                  <li>Realtime processing updates.</li>
               </ul>
            </div>
         </div>
      </div>
    </div>
  );
}
