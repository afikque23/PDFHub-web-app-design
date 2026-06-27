"use client";
import React from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">System Settings</h1>
        <p className="text-slate-500">Configure global PDFHub parameters.</p>
      </div>

      <Card className="p-6 border-0 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Upload Limits</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Max File Size (MB)</label>
              <input type="number" defaultValue={100} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Concurrent Uploads</label>
              <input type="number" defaultValue={3} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
          </div>
        </div>
        
        <div className="pt-6 border-t border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Storage Policies</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Input Expiration (Hours)</label>
              <input type="number" defaultValue={1} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Output Expiration (Hours)</label>
              <input type="number" defaultValue={24} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </Card>
    </div>
  );
}
