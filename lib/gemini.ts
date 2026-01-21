import { GoogleGenerativeAI, Part } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY!;

export const genAI = new GoogleGenerativeAI(apiKey);

// Using Gemini 2.5 Pro for advanced multimodal capabilities
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-pro",
});

/**
 * Convert a file buffer to Gemini-compatible format
 */
export function bufferToGenerativePart(
  buffer: Buffer,
  mimeType: string
): Part {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

/**
 * Determine MIME type from file extension or URL
 */
export function getMimeType(url: string): string {
  const extension = url.split(".").pop()?.toLowerCase().split("?")[0];

  const mimeTypes: Record<string, string> = {
    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    // Videos
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
  };

  return mimeTypes[extension || ""] || "application/octet-stream";
}

/**
 * Check if MIME type is a video
 */
export function isVideoMimeType(mimeType: string): boolean {
  return mimeType.startsWith("video/");
}

/**
 * Check if MIME type is an image
 */
export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}
