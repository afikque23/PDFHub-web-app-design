"use client";

import React, { useState } from "react";
import { useAdminJobs } from "@/hooks/useAdmin";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { format } from "date-fns";
import { RefreshCw, XCircle, Search, Activity, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminJobsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminJobs(page, 10);

  if (isLoading) return <div className="p-8 text-center">Loading processing jobs...</div>;

  const jobs = data?.data || [];
  const totalPages = Math.ceil((data?.total || 0) / 10);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'FAILED': return 'bg-red-100 text-red-700';
      case 'CANCELLED': return 'bg-slate-100 text-slate-700';
      case 'PROCESSING': return 'bg-blue-100 text-blue-700';
      case 'QUEUED': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Processing Jobs</h1>
          <p className="text-slate-500">Monitor and manage all background worker tasks.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Job ID..." 
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64"
            />
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Job ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Tool</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job: any) => (
                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500" title={job.id}>
                    {job.id.split('-')[0]}...
                  </td>
                  <td className="px-6 py-4 text-slate-800 font-medium truncate max-w-[150px]" title={job.user?.email}>
                    {job.user?.email || 'Unknown'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-semibold">
                      {job.tool}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-slate-200 rounded-full h-2 min-w-[80px]">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${job.progress}%` }}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {format(new Date(job.createdAt), "MMM dd, HH:mm")}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {job.status === 'FAILED' && (
                      <Button variant="ghost" size="icon" className="text-amber-500 hover:text-amber-600 hover:bg-amber-50" title="Retry Job">
                        <RefreshCw size={16} />
                      </Button>
                    )}
                    {['QUEUED', 'PROCESSING', 'DOWNLOADING', 'UPLOADING'].includes(job.status) && (
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" title="Cancel Job">
                        <XCircle size={16} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">No jobs found.</td>
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
