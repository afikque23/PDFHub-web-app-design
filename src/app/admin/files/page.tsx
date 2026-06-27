"use client";

import React, { useState } from "react";
import { useAdminFiles } from "@/hooks/useAdmin";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { format } from "date-fns";
import { Search, Download, Trash2, FileIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { downloadService } from "@/services/download.service";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function AdminFilesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminFiles(page, 10);

  if (isLoading) return <div className="p-8 text-center">Loading files...</div>;

  const files = data?.data || [];
  const totalPages = Math.ceil((data?.total || 0) / 10);

  const handleDownload = async (file: any) => {
    try {
      const { data, error } = await supabase.storage.from(file.bucket).createSignedUrl(file.storagePath, 3600);
      if (error) throw error;
      downloadService.triggerDownload(data.signedUrl);
      toast.success("Download started");
    } catch (e: any) {
      toast.error("Failed to download: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">File Storage</h1>
          <p className="text-slate-500">Manage all stored files across input and output buckets.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name..." 
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64"
          />
        </div>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">File Name</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4">Bucket</th>
                <th className="px-6 py-4">Uploaded</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {files.map((file: any) => (
                <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded"><FileIcon size={16}/></div>
                    <span className="font-medium text-slate-800 truncate max-w-[200px]" title={file.originalName}>
                      {file.originalName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 truncate max-w-[150px]" title={file.user?.email}>
                    {file.user?.email || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${file.bucket === 'pdfhub-output' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {file.bucket}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {format(new Date(file.createdAt), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(file)} className="text-primary hover:text-primary hover:bg-primary/10">
                      <Download size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
              {files.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No files found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-500">Showing page {page} of {totalPages || 1}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
