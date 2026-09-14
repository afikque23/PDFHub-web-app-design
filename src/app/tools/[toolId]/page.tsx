"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CloudUpload, AlertCircle, RefreshCw, Layers, ShieldCheck, Zap } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toolsData } from "../../data/tools";
import { twMerge } from "tailwind-merge";
import { FilePreviewCard } from "../../components/FilePreviewCard";
import { downloadService } from "../../../services/download.service";
import { toast } from "sonner";
import { mergePdfs, splitPdf, rotatePdf, watermarkPdf, jpgToPdf } from "@/lib/pdfClient";

export default function ToolPage() {
  const params = useParams();
  const toolId = params?.toolId as string;
  const tool = toolsData.find((t) => t.id === toolId) || toolsData[0];

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"IDLE" | "PROCESSING" | "COMPLETED" | "FAILED">("IDLE");
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [outputFileName, setOutputFileName] = useState<string>("result.pdf");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState<string>("CONFIDENTIAL");

  // Reset state when tool changes
  useEffect(() => {
    handleReset();
  }, [toolId]);

  const handleReset = () => {
    setSelectedFiles([]);
    setStatus("IDLE");
    setProgress(0);
    setDownloadUrl(null);
    setResultBytes(null);
    setErrorMessage(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;
    setSelectedFiles(files);
    setStatus("PROCESSING");
    setProgress(20);
    setErrorMessage(null);

    const primaryFile = files[0];

    try {
      if (tool.engine === "client") {
        // --- 1. Client-Side Processing (pdf-lib) ---
        setProgress(40);
        let bytes: Uint8Array;
        let outName = `pdfhub_${tool.id}_${Date.now()}.pdf`;

        if (tool.id === "merge-pdf") {
          if (files.length < 2) {
            toast.info("Anda dapat memilih lebih dari 1 file PDF untuk digabungkan.");
          }
          bytes = await mergePdfs(files);
          outName = `merged_${Date.now()}.pdf`;
        } else if (tool.id === "split-pdf") {
          bytes = await splitPdf(primaryFile);
          outName = `split_${Date.now()}.pdf`;
        } else if (tool.id === "rotate-pdf") {
          bytes = await rotatePdf(primaryFile, 90);
          outName = `rotated_${Date.now()}.pdf`;
        } else if (tool.id === "watermark-pdf") {
          bytes = await watermarkPdf(primaryFile, watermarkText || "CONFIDENTIAL");
          outName = `watermarked_${Date.now()}.pdf`;
        } else if (tool.id === "jpg-to-pdf") {
          bytes = await jpgToPdf(files);
          outName = `converted_${Date.now()}.pdf`;
        } else {
          bytes = await mergePdfs(files);
        }

        setProgress(100);
        setResultBytes(bytes);
        setOutputFileName(outName);
        setStatus("COMPLETED");
        toast.success("Pemrosesan berhasil selesai!");
        downloadService.downloadBytes(bytes, outName);
      } else {
        // --- 2. CloudConvert API Processing ---
        setProgress(30);
        const formData = new FormData();
        formData.append("file", primaryFile);

        if (tool.id === "word-to-pdf") {
          formData.append("targetFormat", "pdf");
          formData.append("operation", "convert");
        } else if (tool.id === "pdf-to-word") {
          formData.append("targetFormat", "docx");
          formData.append("operation", "convert");
        } else if (tool.id === "compress-pdf") {
          formData.append("operation", "optimize");
        } else if (tool.id === "pdf-to-jpg") {
          formData.append("targetFormat", "jpg");
          formData.append("operation", "convert");
        }

        setProgress(60);
        const response = await fetch("/api/convert", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengonversi dokumen via Cloud API.");
        }

        setProgress(100);
        setDownloadUrl(result.downloadUrl);
        setOutputFileName(result.fileName || "converted_document.pdf");
        setStatus("COMPLETED");
        toast.success("Konversi berhasil selesai!");
        setTimeout(() => {
          downloadService.triggerDownload(result.downloadUrl, result.fileName);
        }, 500);
      }
    } catch (err: any) {
      console.error("Processing error:", err);
      setStatus("FAILED");
      const message =
        err instanceof Error
          ? err.message
          : typeof err?.message === "string"
          ? err.message
          : typeof err === "string"
          ? err
          : "Terjadi kesalahan saat memproses file.";
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleRetry = () => {
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles);
    } else {
      handleReset();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      e.target.value = "";
      processFiles(files);
    }
  };

  const handleManualDownload = () => {
    if (resultBytes) {
      downloadService.downloadBytes(resultBytes, outputFileName);
      toast.success("Mengunduh file...");
    } else if (downloadUrl) {
      downloadService.triggerDownload(downloadUrl, outputFileName);
      toast.success("Mengunduh file...");
    }
  };

  const isMultipleAllowed = tool.id === "merge-pdf" || tool.id === "jpg-to-pdf";
  const acceptedFileTypes =
    tool.id === "word-to-pdf"
      ? ".docx,.doc"
      : tool.id === "jpg-to-pdf"
      ? ".jpg,.jpeg,.png"
      : ".pdf";

  const showUploadScreen = status === "IDLE";

  return (
    <div className="min-h-[calc(100vh-72px)] flex bg-[#fdfdfd]">
      <div className="flex-1 flex flex-col items-center justify-center p-6 py-12 w-full max-w-5xl mx-auto">
        {/* Upload Screen */}
        {showUploadScreen && (
          <div className="w-full max-w-3xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-4">
              <Zap size={14} /> Fast & Secure Processing
            </div>

            <h1 className="text-4xl md:text-[48px] font-bold text-text-primary mb-4">{tool.name}</h1>
            <p className="text-[18px] text-text-secondary mb-8 max-w-xl">{tool.description}</p>

            {/* Optional Watermark Input */}
            {tool.id === "watermark-pdf" && (
              <div className="mb-6 w-full max-w-md text-left">
                <label className="text-sm font-medium text-text-primary block mb-2">Teks Watermark:</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="Contoh: CONFIDENTIAL atau RAHASIA"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary text-sm"
                />
              </div>
            )}

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={twMerge(
                "group w-full h-80 rounded-[var(--radius-upload)] border-2 border-dashed flex flex-col items-center justify-center p-8 transition-all duration-200 cursor-pointer relative",
                isDragging
                  ? "border-primary bg-primary-light"
                  : "border-border bg-white hover:border-primary hover:bg-primary-light/50",
                "shadow-[var(--shadow-card)]"
              )}
            >
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileSelect}
                multiple={isMultipleAllowed}
                accept={acceptedFileTypes}
              />
              <div
                className={twMerge(
                  "w-20 h-20 bg-primary-light text-primary rounded-full flex items-center justify-center mb-6 transition-transform",
                  isDragging ? "scale-110" : "group-hover:-translate-y-1 group-hover:scale-105"
                )}
              >
                <CloudUpload className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">
                {isMultipleAllowed ? "Upload File (Bisa Banyak)" : "Upload File"}
              </h3>
              <p className="text-text-secondary mb-6">Drag & drop file Anda di sini atau klik untuk browse</p>

              <Button size="lg" className="pointer-events-none">
                Pilih File
              </Button>

              <div className="mt-6 flex items-center gap-4 text-sm text-text-secondary font-medium">
                <span className="bg-gray-100 px-3 py-1 rounded-md">
                  {tool.id === "word-to-pdf" ? "DOCX" : tool.id === "jpg-to-pdf" ? "JPG / PNG" : "PDF"}
                </span>
                <span className="text-gray-400">|</span>
                <span>Maksimal 100 MB</span>
              </div>
            </div>

            <p className="flex items-center text-sm text-text-secondary mt-8 gap-2">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              File Anda aman, diproses dengan enkripsi dan tidak disimpan sembarangan.
            </p>
          </div>
        )}

        {/* Processing / Result Screen */}
        {!showUploadScreen && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
            <h2 className="text-3xl font-bold text-text-primary mb-8">
              {status === "COMPLETED" ? "Selesai!" : status === "FAILED" ? "Gagal Memproses" : "Sedang Memproses..."}
            </h2>

            <FilePreviewCard
              file={selectedFiles[0]}
              fileName={outputFileName}
              status={status}
              progress={progress}
              downloadUrl={downloadUrl || undefined}
              errorMessage={errorMessage || undefined}
              onCancel={handleReset}
              onRetry={handleRetry}
              onDownload={handleManualDownload}
            />

            {status === "COMPLETED" && (
              <div className="mt-8 flex justify-center">
                <Button variant="outline" onClick={handleReset} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Proses File Lain
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Sidebar (Desktop) */}
      <div className="hidden lg:flex w-80 border-l border-border bg-white flex-col p-8 overflow-y-auto">
        <h3 className="font-bold text-lg mb-4 text-text-primary">Tentang {tool.name}</h3>
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          {tool.description} Cepat, andal, dan siap diakses kapan pun langsung dari browser.
        </p>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-sm mb-2">Format Didukung</h4>
            <div className="flex gap-2">
              <span className="text-xs bg-gray-100 text-slate-700 px-2.5 py-1 rounded font-medium">
                {tool.id === "word-to-pdf" ? "DOCX, DOC" : tool.id === "jpg-to-pdf" ? "JPG, PNG" : "PDF"}
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Keunggulan</h4>
            <ul className="text-sm text-text-secondary space-y-2 list-disc pl-4">
              <li>Mendukung file hingga 100 MB.</li>
              <li>Hasil dokumen presisi dan jernih.</li>
              <li>Kompatibel 100% dengan hosting Vercel.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
