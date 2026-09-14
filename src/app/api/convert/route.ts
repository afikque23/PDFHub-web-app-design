import { NextRequest, NextResponse } from "next/server";
import CloudConvert from "cloudconvert";
import { Readable } from "stream";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.CLOUDCONVERT_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "MISSING_API_KEY",
          message:
            "CLOUDCONVERT_API_KEY belum disetel. Silakan daftar gratis di cloudconvert.com, salin API Key Anda, lalu masukkan ke .env.local (atau Vercel Environment Variables).",
        },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const targetFormat = formData.get("targetFormat") as string | null; // e.g. 'pdf', 'docx'
    const operation = (formData.get("operation") as string | null) || "convert"; // 'convert' or 'optimize'

    if (!file) {
      return NextResponse.json(
        { error: "NO_FILE", message: "File tidak ditemukan dalam request." },
        { status: 400 }
      );
    }

    const cloudConvert = new CloudConvert(apiKey);

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileStream = Readable.from(fileBuffer);
    const originalName = file.name || "document";

    const tasksConfig: Record<string, any> = {
      "import-file": {
        operation: "import/upload",
      },
      "export-file": {
        operation: "export/url",
        input: operation === "optimize" ? "optimize-file" : "convert-file",
      },
    };

    if (operation === "optimize") {
      tasksConfig["optimize-file"] = {
        operation: "optimize",
        input: "import-file",
        input_format: "pdf",
      };
    } else {
      tasksConfig["convert-file"] = {
        operation: "convert",
        input: "import-file",
        output_format: targetFormat || "pdf",
      };
    }

    // 1. Create Job
    let job = await cloudConvert.jobs.create({ tasks: tasksConfig });

    // 2. Upload file to CloudConvert
    const uploadTask = job.tasks.find((t) => t.name === "import-file");
    if (!uploadTask) {
      throw new Error("Gagal membuat upload task di CloudConvert.");
    }

    await cloudConvert.tasks.upload(uploadTask, fileStream, originalName, fileBuffer.length);

    // 3. Wait for conversion to finish
    job = await cloudConvert.jobs.wait(job.id);

    const exportTask = job.tasks.find(
      (t) => t.operation === "export/url" && t.status === "finished"
    );

    if (!exportTask || !exportTask.result?.files?.[0]?.url) {
      const failedTask = job.tasks.find((t) => t.status === "error");
      const errMsg = failedTask?.message || "Konversi gagal diselesaikan.";
      return NextResponse.json(
        { error: "CONVERSION_FAILED", message: errMsg },
        { status: 500 }
      );
    }

    const convertedFile = exportTask.result.files[0];

    return NextResponse.json({
      success: true,
      downloadUrl: convertedFile.url,
      fileName: convertedFile.filename || `converted_${originalName}`,
    });
  } catch (error: any) {
    console.error("CloudConvert Error:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: error.message || "Terjadi kesalahan saat memproses file via CloudConvert.",
      },
      { status: 500 }
    );
  }
}
