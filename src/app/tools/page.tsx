"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toolsData } from "../data/tools";
import { Search, ArrowRight } from "lucide-react";

export default function AllToolsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const categories = [
    { id: "ALL", label: "Semua Tool" },
    { id: "CONVERT", label: "Konversi Dokumen" },
    { id: "ORGANIZE", label: "Atur & Edit PDF" },
    { id: "OPTIMIZE", label: "Optimasi" },
  ];

  const filteredTools = toolsData.filter((tool) => {
    // Search query match
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Category filter
    if (activeCategory === "ALL") return true;
    if (activeCategory === "CONVERT") {
      return (
        tool.id.includes("to-") ||
        tool.id === "word-to-pdf" ||
        tool.id === "pdf-to-word" ||
        tool.id === "jpg-to-pdf" ||
        tool.id === "pdf-to-jpg"
      );
    }
    if (activeCategory === "ORGANIZE") {
      return (
        tool.id === "merge-pdf" ||
        tool.id === "split-pdf" ||
        tool.id === "rotate-pdf" ||
        tool.id === "watermark-pdf"
      );
    }
    if (activeCategory === "OPTIMIZE") {
      return tool.id === "compress-pdf";
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-bg-base py-12 px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight">
            Semua PDF Tools
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed">
            Pilih tool yang Anda butuhkan untuk mengonversi, menggabungkan, memisahkan, dan mengedit dokumen PDF dengan cepat dan aman.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tool PDF (contoh: merge, word, compress)..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-border rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white text-text-secondary border border-border hover:border-primary hover:text-text-primary"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                href={`/tools/${tool.id}`}
                className="group flex flex-col justify-between bg-white p-6 rounded-[var(--radius-card)] border border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 hover:border-primary transition-all duration-300"
              >
                <div>
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 ${tool.bg} ${tool.color}`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed mb-6">
                    {tool.description}
                  </p>
                </div>

                <div className="flex items-center text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                  <span>Buka Tool</span>
                  <ArrowRight size={16} className="ml-1.5" />
                </div>
              </Link>
            );
          })}

          {filteredTools.length === 0 && (
            <div className="col-span-full text-center py-16 text-text-secondary">
              <p className="text-lg font-medium text-text-primary mb-2">
                Tidak ada tool yang cocok dengan pencarian "{searchQuery}".
              </p>
              <p className="text-sm">
                Coba gunakan kata kunci lain atau pilih kategori "Semua Tool".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
