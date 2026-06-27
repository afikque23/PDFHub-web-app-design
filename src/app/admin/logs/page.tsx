"use client";
import React from "react";
import { Card } from "@/app/components/ui/card";
import { TerminalSquare, AlertCircle, Info, AlertTriangle } from "lucide-react";

export default function AdminLogsPage() {
  const dummyLogs = [
    { type: 'ERROR', message: 'Failed to connect to Oracle Cloud Worker Node 1', time: '10 mins ago' },
    { type: 'WARNING', message: 'Storage pdfhub-input is reaching 80% capacity', time: '1 hour ago' },
    { type: 'INFO', message: 'Admin user@pdfhub.com logged in', time: '2 hours ago' },
    { type: 'INFO', message: 'System auto-cleanup removed 45 stale files', time: '5 hours ago' },
  ];

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'ERROR': return <AlertCircle className="text-red-500" size={18} />;
      case 'WARNING': return <AlertTriangle className="text-amber-500" size={18} />;
      default: return <Info className="text-blue-500" size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">System Logs</h1>
        <p className="text-slate-500">Real-time application and worker logs.</p>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden bg-slate-900 text-slate-300 font-mono text-sm">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2 text-slate-400">
          <TerminalSquare size={18} />
          <span>tail -f /var/log/pdfhub-worker.log</span>
        </div>
        <div className="p-4 space-y-3 h-[600px] overflow-y-auto">
          {dummyLogs.map((log, i) => (
            <div key={i} className="flex gap-4 items-start">
              <span className="text-slate-500 whitespace-nowrap">[{log.time}]</span>
              {getLogIcon(log.type)}
              <span className={`${log.type === 'ERROR' ? 'text-red-400' : log.type === 'WARNING' ? 'text-amber-400' : 'text-slate-300'}`}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
