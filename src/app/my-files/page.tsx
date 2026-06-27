"use client";

import React from "react";
import { useHistory } from "../../hooks/useHistory";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { FileIcon, Download, Trash2, Calendar, FileType } from "lucide-react";
import { format } from "date-fns";
import { downloadService } from "../../services/download.service";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

export default function MyFilesPage() {
  const { data: jobs = [], isLoading, refetch } = useHistory();

  const completedJobs = jobs.filter((job: any) => job.status === 'COMPLETED' && job.outputFileId);

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

  const handleDelete = async (jobId: string, outputFileId: string) => {
    // In a real app, we should call a backend API to delete the DB record and storage file
    // For now, we'll try to delete from Supabase storage directly as a demonstration
    try {
      const { error } = await supabase.storage.from('pdfhub-output').remove([outputFileId]);
      if (error) throw error;
      toast.success("File deleted from storage");
      refetch();
    } catch (e: any) {
      toast.error("Failed to delete: " + e.message);
    }
  };

  if (isLoading) return <div className="p-12 text-center">Loading files...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">My Files</h1>
        <p className="text-text-secondary mt-2">Access your processed documents ready for download.</p>
      </div>

      <div className="bg-white rounded-[var(--radius-card)] border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-text-secondary font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">File Name</th>
                <th className="px-6 py-4">Tool Used</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {completedJobs.map((job: any) => {
                const fileName = job.outputFileId.split('/').pop();
                return (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="p-2 bg-primary/10 text-primary rounded"><FileIcon size={16}/></div>
                      <span className="font-medium text-text-primary truncate max-w-[200px]">{fileName}</span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{job.tool}</td>
                    <td className="px-6 py-4 text-text-secondary">
                      {format(new Date(job.completedAt), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(job.outputFileId)}>
                        <Download size={16} className="text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(job.id, job.outputFileId)}>
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {completedJobs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-text-secondary">
                    You don't have any processed files yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
