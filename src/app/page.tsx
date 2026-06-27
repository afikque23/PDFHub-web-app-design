import React from "react";
import Link from "next/link";
import { Button } from "./components/ui/button";
import { toolsData } from "./data/tools";
import { Cloud, FileText, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-20 lg:py-32 px-6 flex flex-col items-center text-center bg-gradient-to-b from-primary-light/50 to-bg-base">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-[48px] font-bold text-text-primary leading-tight tracking-tight">
            Every PDF Tool You Need, <br className="hidden md:block" />
            <span className="text-primary">In One Place.</span>
          </h1>
          <p className="text-[18px] md:text-[20px] text-text-secondary leading-relaxed max-w-2xl mx-auto">
            Merge, split, compress, convert, rotate, watermark, and edit PDF files quickly and securely—all from your browser. No installation required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/tools/merge-pdf">Start Using Tools</Link>
            </Button>
            <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
              <a href="#all-tools">Explore All Tools</a>
            </Button>
          </div>
        </div>

        {/* Hero Illustration / Decorative */}
        <div className="mt-16 relative w-full max-w-4xl h-48 md:h-64 flex justify-center items-center pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl flex justify-between px-10">
              <div className="w-20 h-24 bg-white rounded-lg shadow-lg rotate-[-15deg] flex flex-col p-2 border border-border/50 opacity-90 animate-[bounce_4s_infinite]">
                 <div className="w-full h-1 bg-red-100 rounded-full mb-2"></div>
                 <div className="w-3/4 h-1 bg-gray-100 rounded-full mb-1"></div>
                 <div className="w-full h-1 bg-gray-100 rounded-full mb-1"></div>
              </div>
              <div className="w-24 h-28 bg-white rounded-lg shadow-xl z-10 flex flex-col items-center justify-center border border-border animate-[pulse_3s_infinite]">
                 <Cloud className="w-10 h-10 text-primary mb-2" />
                 <div className="w-1/2 h-1 bg-primary/20 rounded-full"></div>
              </div>
              <div className="w-20 h-24 bg-white rounded-lg shadow-lg rotate-[15deg] flex flex-col p-2 border border-border/50 opacity-90 animate-[bounce_5s_infinite]">
                 <div className="w-full h-1 bg-blue-100 rounded-full mb-2"></div>
                 <div className="w-full h-1 bg-gray-100 rounded-full mb-1"></div>
                 <div className="w-2/3 h-1 bg-gray-100 rounded-full mb-1"></div>
              </div>
           </div>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section id="all-tools" className="w-full px-6 lg:px-8 py-20 max-w-[1440px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[36px] font-bold text-text-primary mb-4">Most Popular PDF Tools</h2>
          <p className="text-[18px] text-text-secondary max-w-2xl mx-auto">
            21 tools to convert, compress, and edit PDFs for free. Try it out today!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {toolsData.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                href={`/tools/${tool.id}`}
                className="group flex flex-col bg-white p-6 rounded-[var(--radius-card)] border border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 hover:border-primary transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 ${tool.bg} ${tool.color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-[20px] font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                <p className="text-[14px] text-text-secondary leading-relaxed">
                  {tool.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
      
      {/* Feature Highlights */}
      <section className="w-full bg-white border-y border-border py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
           <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
                 <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-text-secondary">Process your files in seconds. Our cloud-based servers handle the heavy lifting.</p>
           </div>
           <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                 <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Perfect Quality</h3>
              <p className="text-text-secondary">Keep your document layout, formatting, and resolution exactly as intended.</p>
           </div>
           <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-6">
                 <Cloud className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure & Private</h3>
              <p className="text-text-secondary">All files are encrypted during transfer and permanently deleted after 2 hours.</p>
           </div>
        </div>
      </section>
    </div>
  );
}
