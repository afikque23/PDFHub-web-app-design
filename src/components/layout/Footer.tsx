import React from "react";
import Link from "next/link";
import { Layers } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <Layers className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-text-primary">PDFHub</span>
            </Link>
            <p className="text-text-secondary text-[14px] leading-relaxed max-w-sm">
              Every PDF tool you need, right in your browser. Merge, split, compress, and convert your documents securely and easily.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Organize PDF</h4>
            <ul className="space-y-3">
              <li><Link href="/tools/merge-pdf" className="text-text-secondary hover:text-primary text-[14px]">Merge PDF</Link></li>
              <li><Link href="/tools/split-pdf" className="text-text-secondary hover:text-primary text-[14px]">Split PDF</Link></li>
              <li><Link href="/tools/rotate-pdf" className="text-text-secondary hover:text-primary text-[14px]">Rotate PDF</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-4">Convert PDF</h4>
            <ul className="space-y-3">
              <li><Link href="/tools/pdf-to-word" className="text-text-secondary hover:text-primary text-[14px]">PDF to Word</Link></li>
              <li><Link href="/tools/word-to-pdf" className="text-text-secondary hover:text-primary text-[14px]">Word to PDF</Link></li>
              <li><Link href="/tools/pdf-to-jpg" className="text-text-secondary hover:text-primary text-[14px]">PDF to JPG</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-4">Optimize PDF</h4>
            <ul className="space-y-3">
              <li><Link href="/tools/compress-pdf" className="text-text-secondary hover:text-primary text-[14px]">Compress PDF</Link></li>
              <li><Link href="/tools/ocr-pdf" className="text-text-secondary hover:text-primary text-[14px]">OCR PDF</Link></li>
              <li><Link href="/tools/watermark-pdf" className="text-text-secondary hover:text-primary text-[14px]">Watermark</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-text-secondary hover:text-primary text-[14px]">About Us</Link></li>
              <li><Link href="/privacy" className="text-text-secondary hover:text-primary text-[14px]">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-secondary text-[14px]">
            © 2026 PDFHub. Created and maintained by Arya Yusufa Agnil Fikri.
          </p>
          <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-primary-light hover:text-primary transition-colors cursor-pointer">
                <span className="sr-only">Twitter</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
