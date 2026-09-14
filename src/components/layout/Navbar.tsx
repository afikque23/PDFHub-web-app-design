"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Menu, X } from "lucide-react";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname() || "";

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: "About", path: "/about" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 h-[72px] bg-white border-b border-border shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow">
        <div className="relative max-w-[1440px] mx-auto h-full px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group z-10">
            <div className="w-10 h-10 bg-primary rounded-[10px] flex items-center justify-center text-white shadow-sm group-hover:bg-primary-hover transition-colors">
              <Layers className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-text-primary">PDFHub</span>
          </Link>

          {/* Desktop Nav - Centered */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`text-[16px] font-medium transition-colors ${
                  pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path))
                    ? "text-primary font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

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
          </div>
        )}
      </header>
    </>
  );
}
