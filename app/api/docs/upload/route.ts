import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 1024 * 1024 * 2;

const SUPPORTED_TYPES = new Set([
  "application/json",
  "text/csv",
  "text/markdown",
  "text/plain",
]);

const SUPPORTED_EXTENSIONS = new Set([".csv", ".json", ".md", ".markdown", ".txt"]);

function getFileExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot === -1 ? "" : fileName.slice(lastDot).toLowerCase();
}

function getNoteTitle(fileName: string) {
  const lastDot = fileName.lastIndexOf(".");
  const baseName = lastDot === -1 ? fileName : fileName.slice(0, lastDot);
  return baseName.replace(/[-_]+/g, " ").trim() || "Uploaded document";
}

function isSupportedFile(file: File) {
  const extension = getFileExtension(file.name);
  return SUPPORTED_TYPES.has(file.type) || SUPPORTED_EXTENSIONS.has(extension);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Document file is required",
        },
        { status: 400 }
      );
    }

    if (!isSupportedFile(file)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only TXT, Markdown, CSV, and JSON files are supported right now",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "File must be 2 MB or smaller",
        },
        { status: 400 }
      );
    }

    const content = (await file.text()).trim();

    if (!content) {
      return NextResponse.json(
        {
          success: false,
          message: "The uploaded document does not contain readable text",
        },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        title: getNoteTitle(file.name),
        content,
      },
    });

    return NextResponse.json(
      {
        success: true,
        note,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Document upload failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Document upload failed",
      },
      { status: 500 }
    );
  }
}
