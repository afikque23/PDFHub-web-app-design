"use client";
import React from "react";
import { Card } from "@/app/components/ui/card";
import { Database, HardDrive, UploadCloud } from "lucide-react";

export default function AdminStoragePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Storage Management</h1>
        <p className="text-slate-500">Monitor your Supabase Storage Buckets usage.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-0 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <UploadCloud size={32} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-slate-800">pdfhub-input</h3>
            <p className="text-sm text-slate-500">Temporary processing bucket</p>
          </div>
          <div className="w-full bg-slate-100 rounded-lg p-4 flex justify-between">
            <span className="text-slate-500 font-medium">Auto-Delete Policy</span>
            <span className="font-bold text-slate-800">1 Hour</span>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <HardDrive size={32} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-slate-800">pdfhub-output</h3>
            <p className="text-sm text-slate-500">Completed files bucket</p>
          </div>
          <div className="w-full bg-slate-100 rounded-lg p-4 flex justify-between">
            <span className="text-slate-500 font-medium">Auto-Delete Policy</span>
            <span className="font-bold text-slate-800">24 Hours</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
