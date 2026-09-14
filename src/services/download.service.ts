export const downloadService = {
  triggerDownload(url: string, filename?: string) {
    if (!url || typeof window === "undefined") return;

    if (url.startsWith("blob:") || url.startsWith("data:")) {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "pdfhub-document.pdf";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try {
          if (document.body.contains(a)) {
            document.body.removeChild(a);
          }
        } catch {}
      }, 300);
    } else {
      // For external URLs like CloudConvert CDN
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      if (filename) link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        try {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
        } catch {}
      }, 300);
    }
  },

  downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    this.triggerDownload(url, filename);
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  },

  downloadBytes(bytes: Uint8Array, filename: string, mimeType: string = "application/pdf") {
    const blob = new Blob([bytes as unknown as BlobPart], { type: mimeType });
    this.downloadBlob(blob, filename);
  },
};
