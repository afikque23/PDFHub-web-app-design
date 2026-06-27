"use client";

import React, { useState } from "react";
import { useHistory } from "../../hooks/useHistory";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { FileIcon, Download, AlertCircle, Trash2, Clock, CheckCircle2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { downloadService } from "../../services/download.service";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

export default function MyJobsPage() {
  const { data: jobs = [], isLoading, error, refetch } = useHistory();
  const [filter, setFilter] = useState<'ALL' | 'COMPLETED' | 'FAILED' | 'PROCESSING'>('ALL');

  const filteredJobs = jobs.filter((job: any) => {
    if (filter === 'ALL') return true;
    if (filter === 'PROCESSING') return !['COMPLETED', 'FAILED', 'CANCELLED'].includes(job.status);
    return job.status === filter;
  });

  const getStatusIcon = (status: string) => {
    if (status === 'COMPLETED') return <CheckCircle2 className="text-green-500" size={20} />;
    if (status === 'FAILED') return <AlertCircle className="text-red-500" size={20} />;
    return <Clock className="text-blue-500" size={20} />;
  };

  const handleDownload = async (outputFileId: string) => {
    try {
      const { data, error } = await supabase.storage.from('pdfhub-output').createSignedUrl(outputFileId, 3600);
      if (error) throw error;
      downloadService.triggerDownload(data.signedUrl);
      toast.success("Download started");
    } catch (e: any) {
      toast.error("Failed to download: " + e.message);
    }
  };

  if (isLoading) return <div className="p-12 text-center">Loading jobs...</div>;
  if (error) return <div className="p-12 text-center text-red-500">Failed to load history</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">My Jobs</h1>
          <p className="text-text-secondary mt-2">Monitor all your background tasks and document processing.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}><RefreshCw size={16} className="mr-2"/> Refresh</Button>
      </div>

      <div className="flex gap-2 mb-6">
        {['ALL', 'COMPLETED', 'PROCESSING', 'FAILED'].map(f => (
          <Button 
            key={f} 
            variant={filter === f ? "primary" : "outline"} 
            onClick={() => setFilter(f as any)}
            className="capitalize"
          >
            {f.toLowerCase()}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job: any) => (
          <Card key={job.id} className="p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">{getStatusIcon(job.status)}</div>
                  <div>
                    <h3 className="font-semibold">{job.tool}</h3>
                    <p className="text-xs text-text-secondary">{format(new Date(job.createdAt), "dd MMM yyyy, HH:mm")}</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-text-secondary bg-gray-100 px-2 py-1 rounded">
                  {job.status}
                </div>
              </div>
              
              <div className="text-sm text-text-secondary mb-4 line-clamp-1">
                Input: {job.inputFileIds.join(', ')}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border">
               <span className="text-xs font-medium text-primary">{job.progress}%</span>
               {job.status === 'COMPLETED' && job.outputFileId && (
                 <Button size="sm" onClick={() => handleDownload(job.outputFileId)}>
                   <Download size={14} className="mr-2" /> Download
                 </Button>
               )}
            </div>
          </Card>
        ))}
        {filteredJobs.length === 0 && (
          <div className="col-span-full text-center py-12 text-text-secondary">
             No jobs found.
          </div>
        )}
      </div>
    </div>
  );
}
