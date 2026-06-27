export const downloadService = {
  triggerDownload(url: string, filename?: string) {
    const a = document.createElement('a');
    a.href = url;
    if (filename) {
      a.download = filename;
    } else {
      a.download = 'pdfhub-document.pdf';
    }
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },
};
