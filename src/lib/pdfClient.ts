import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

/**
 * Merge multiple PDF files into one PDF document.
 */
export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const fileBytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(fileBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

/**
 * Split a PDF file (extract all pages or specific page range).
 * Returns the PDF of extracted pages.
 */
export async function splitPdf(file: File, pageIndicesToKeep?: number[]): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(fileBytes);
  const splitPdf = await PDFDocument.create();

  const totalPages = srcPdf.getPageCount();
  const indices = pageIndicesToKeep && pageIndicesToKeep.length > 0 
    ? pageIndicesToKeep.filter((i) => i >= 0 && i < totalPages)
    : [0]; // default to first page if not specified

  const copiedPages = await splitPdf.copyPages(srcPdf, indices);
  copiedPages.forEach((page) => splitPdf.addPage(page));

  return await splitPdf.save();
}

/**
 * Rotate all pages of a PDF by a given degree (e.g. 90, 180, 270).
 */
export async function rotatePdf(file: File, angle: number = 90): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBytes);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + angle) % 360));
  }

  return await pdfDoc.save();
}

/**
 * Add a custom text watermark across all pages of a PDF.
 */
export async function watermarkPdf(file: File, watermarkText: string = "CONFIDENTIAL"): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (const page of pages) {
    const { width, height } = page.getSize();
    const fontSize = Math.min(width, height) / 10;
    const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    page.drawText(watermarkText, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - textHeight / 2,
      size: fontSize,
      font,
      color: rgb(0.75, 0.75, 0.75),
      opacity: 0.35,
      rotate: degrees(45),
    });
  }

  return await pdfDoc.save();
}

/**
 * Convert an array of JPG / PNG images into a single PDF document.
 */
export async function jpgToPdf(files: File[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const fileBytes = await file.arrayBuffer();
    let image;
    if (file.type.includes("png")) {
      image = await pdfDoc.embedPng(fileBytes);
    } else {
      // Default to JPG embed
      try {
        image = await pdfDoc.embedJpg(fileBytes);
      } catch {
        image = await pdfDoc.embedPng(fileBytes);
      }
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  return await pdfDoc.save();
}
