"use client";

import React, { useState } from "react";
import { useAdminUsers } from "@/hooks/useAdmin";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { format } from "date-fns";
import { ShieldAlert, Trash2, Search, User, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminUsers(page, 10);

  if (isLoading) return <div className="p-8 text-center">Loading users...</div>;

  const users = data?.data || [];
  const totalPages = Math.ceil((data?.total || 0) / 10);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500">Manage all registered users and their access.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search email..." 
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64"
          />
        </div>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Registered</th>
                <th className="px-6 py-4 text-center">Files</th>
                <th className="px-6 py-4 text-center">Jobs</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{user.fullName || 'Anonymous User'}</div>
                      <div className="text-slate-500 text-xs">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {format(new Date(user.createdAt), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-800 font-medium">
                    {user._count.files}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-800 font-medium">
                    {user._count.processingJobs}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="text-amber-500 hover:text-amber-600 hover:bg-amber-50" title="Suspend">
                      <ShieldAlert size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" title="Delete">
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No users found.</td>
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
