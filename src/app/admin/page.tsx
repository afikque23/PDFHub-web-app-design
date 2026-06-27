"use client";

import React from "react";
import { useAdminDashboard, useAdminAnalytics } from "@/hooks/useAdmin";
import { Card } from "@/app/components/ui/card";
import { Users, FileText, Activity, Clock, Database, AlertCircle, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminDashboard();
  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics();

  if (statsLoading || analyticsLoading) {
    return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>;
  }

  const statCards = [
    { title: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-100" },
    { title: "Total Files", value: stats?.totalFiles || 0, icon: FileText, color: "text-purple-500", bg: "bg-purple-100" },
    { title: "Total Jobs", value: stats?.totalJobs || 0, icon: Activity, color: "text-indigo-500", bg: "bg-indigo-100" },
    { title: "Today's Jobs", value: stats?.todayJobs || 0, icon: Activity, color: "text-green-500", bg: "bg-green-100" },
    { title: "Avg Processing", value: `${stats?.avgProcessingTime || 0} ms`, icon: Clock, color: "text-amber-500", bg: "bg-amber-100" },
    { title: "Storage Used", value: `${((stats?.totalStorageUsed || 0) / 1024 / 1024).toFixed(2)} MB`, icon: Database, color: "text-rose-500", bg: "bg-rose-100" },
  ];

  const pieData = [
    { name: 'Completed', value: stats?.completedJobs || 0, color: '#10b981' },
    { name: 'Failed', value: stats?.failedJobs || 0, color: '#ef4444' },
  ];

  const toolsData = analytics?.tools?.map((t: any) => ({ name: t.tool, count: t._count.tool })) || [];
  const dailyJobs = analytics?.dailyJobs || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome to PDFHub Admin Control Panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <Card key={idx} className="p-6 flex items-center gap-4 border-0 shadow-sm">
            <div className={`p-4 rounded-xl ${card.bg} ${card.color}`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{card.title}</p>
              <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Worker Status */}
        <Card className="p-6 col-span-1 border-0 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <Database className="text-primary" /> Worker Node Status
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-500">Status</span>
                <span className="flex items-center gap-1 text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   {stats?.workerStatus?.status}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-500">Uptime</span>
                <span className="text-sm font-medium">{Math.floor((stats?.workerStatus?.uptime || 0) / 3600)} Hours</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-500">Memory RSS</span>
                <span className="text-sm font-medium">{((stats?.workerStatus?.memoryUsage?.rss || 0) / 1024 / 1024).toFixed(1)} MB</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-500">Version</span>
                <span className="text-sm font-medium">v{stats?.workerStatus?.version}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <div className="flex-1 bg-green-50 text-green-700 text-center py-3 rounded-lg flex flex-col items-center justify-center">
              <CheckCircle2 size={24} className="mb-1" />
              <span className="text-xl font-bold">{stats?.completedJobs}</span>
              <span className="text-xs">Success</span>
            </div>
            <div className="flex-1 bg-red-50 text-red-700 text-center py-3 rounded-lg flex flex-col items-center justify-center">
              <AlertCircle size={24} className="mb-1" />
              <span className="text-xl font-bold">{stats?.failedJobs}</span>
              <span className="text-xs">Failed</span>
            </div>
          </div>
        </Card>

        {/* Daily Growth Chart */}
        <Card className="p-6 col-span-2 border-0 shadow-sm">
          <h3 className="font-semibold text-lg text-slate-800 mb-6">Daily Processing Jobs (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyJobs}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      {/* Tools Popularity */}
      <Card className="p-6 border-0 shadow-sm">
        <h3 className="font-semibold text-lg text-slate-800 mb-6">Popular Tools</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={toolsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
