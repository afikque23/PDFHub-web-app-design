"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, LogIn, UserPlus, Menu, X, LogOut, User } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { supabase } from "@/lib/supabase";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname() || "";

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools/compress-pdf" },
    ...(user ? [
      { name: "My Files", path: "/my-files" },
      { name: "My Jobs", path: "/my-jobs" }
    ] : []),
    { name: "About", path: "/about" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 h-[72px] bg-white border-b border-border shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow">
        <div className="max-w-[1440px] mx-auto h-full px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-[10px] flex items-center justify-center text-white shadow-sm group-hover:bg-primary-hover transition-colors">
              <Layers className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-text-primary">PDFHub</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`text-[16px] font-medium transition-colors ${
                  pathname === link.path || (link.path !== '/' && pathname.startsWith('/tools') && link.path.startsWith('/tools'))
                    ? "text-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-text-secondary flex items-center gap-2">
                  <User size={16} /> {user.email}
                </span>
                <Button variant="ghost" className="font-medium text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="font-medium">
                    <LogIn className="w-4 h-4 mr-2" />
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-[72px] left-0 right-0 bg-white border-b border-border shadow-lg px-6 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className="text-[16px] font-medium text-text-secondary hover:text-primary py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-4 border-t border-border">
              {user ? (
                <Button variant="outline" className="w-full justify-center text-red-500" onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}>
                  Log Out
                </Button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center">Log In</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full justify-center">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
