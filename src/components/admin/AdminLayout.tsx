"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Activity, 
  Settings, 
  Database, 
  BarChart, 
  TerminalSquare,
  LogOut,
  Layers
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/app/components/ui/button";
import { useAdminDashboard } from "@/hooks/useAdmin";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // We use the dashboard hook to verify if the user has ADMIN role.
  // If the backend returns 403 Forbidden, the error will be thrown.
  const { error, isLoading } = useAdminDashboard();

  useEffect(() => {
    if (!isLoading) {
      if (error) {
        setIsAuthorized(false);
        router.push('/');
      } else {
        setIsAuthorized(true);
      }
    }
  }, [error, isLoading, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Files", href: "/admin/files", icon: FileText },
    { name: "Processing Jobs", href: "/admin/jobs", icon: Activity },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart },
    { name: "Storage", href: "/admin/storage", icon: Database },
    { name: "Logs", href: "/admin/logs", icon: TerminalSquare },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  if (isAuthorized === null || isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Verifying Admin Access...</div>;
  }

  if (isAuthorized === false) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex bg-gray-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Layers className="text-primary w-6 h-6 mr-2" />
          <span className="text-white font-bold text-xl tracking-tight">PDFHub Admin</span>
        </div>
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-primary text-white font-medium' : 'hover:bg-slate-800 hover:text-white'}`}>
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-slate-800">
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800">
            <LogOut size={18} className="mr-3" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="font-semibold text-lg">Control Panel</div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              System Healthy
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
