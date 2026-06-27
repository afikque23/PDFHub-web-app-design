"use client";
import React, { useState, useEffect } from "react";
import { useAdminAnalytics } from "@/hooks/useAdmin";
import { Card } from "@/app/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Line } from "recharts";

export default function AdminAnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const { data: analytics, isLoading } = useAdminAnalytics();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) return <div className="p-8 text-center animate-pulse">Loading analytics...</div>;

  const toolsData = analytics?.tools?.map((t: any) => ({ name: t.tool, count: t._count.tool })) || [];
  const statusData = analytics?.statusStats?.map((s: any) => ({ name: s.status, value: s._count.status })) || [];
  const dailyJobs = analytics?.dailyJobs || [];
  
  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Advanced Analytics</h1>
        <p className="text-slate-500">In-depth insights into your PDF processing ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-0 shadow-sm">
          <h3 className="font-semibold text-lg text-slate-800 mb-6">Tools Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={toolsData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {toolsData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-sm">
          <h3 className="font-semibold text-lg text-slate-800 mb-6">Processing Trend (Last 7 Days)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyJobs}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
