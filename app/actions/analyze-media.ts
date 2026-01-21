"use server";

import {
  geminiModel,
  bufferToGenerativePart,
  getMimeType,
  isVideoMimeType,
  isImageMimeType,
} from "@/lib/gemini";
import type { AnalysisResponse, DamageAnalysis } from "@/types";

const SYSTEM_PROMPT = `You are a veteran general contractor with 30+ years of experience in residential and commercial repairs.

Analyze this image or video carefully. Identify any visible damage, wear, or issues that need repair.

You MUST respond with ONLY a valid JSON object (no markdown, no code blocks, no explanations) with these exact fields:
{
  "damage_type": "Brief description of the type of damage observed (e.g., 'Water damage to ceiling', 'Cracked foundation', 'Rotting wood siding')",
  "severity_score_1_to_10": <number from 1-10 where 1 is cosmetic and 10 is structural emergency>,
  "estimated_trade_needed": "The trade professional needed (e.g., 'Plumber', 'Electrician', 'General Contractor', 'Roofer', 'HVAC Technician')",
  "summary_for_homeowner": "A friendly 2-3 sentence explanation for the homeowner about what you see, what might have caused it, and general urgency level"
}

If you cannot identify any damage or the image/video is unclear, still return the JSON with:
- damage_type: "No visible damage detected" or "Unable to assess - image unclear"
- severity_score_1_to_10: 0
- estimated_trade_needed: "None required" or "Professional inspection recommended"
- summary_for_homeowner: An appropriate explanation`;

/**
 * Analyze media (image or video) using Gemini 2.5 Pro
 * This is the core "Eyes" of the First Look app
 *
 * @param fileUrl - Public URL of the uploaded image/video from Supabase Storage
 * @returns Analysis result with damage assessment
 */
export async function analyzeMedia(fileUrl: string): Promise<AnalysisResponse> {
  try {
    // Validate URL
    if (!fileUrl || !fileUrl.startsWith("http")) {
      return {
        success: false,
        error: "Invalid file URL provided",
      };
    }

    // Determine MIME type from URL
    const mimeType = getMimeType(fileUrl);

    if (!isImageMimeType(mimeType) && !isVideoMimeType(mimeType)) {
      return {
        success: false,
        error: `Unsupported file type: ${mimeType}. Please upload an image or video.`,
      };
    }

    // Fetch the file from the URL
    const response = await fetch(fileUrl);

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch file: ${response.statusText}`,
      };
    }

    // Convert to buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Check file size (Gemini has limits)
    const maxSize = isVideoMimeType(mimeType)
      ? 100 * 1024 * 1024 // 100MB for video
      : 20 * 1024 * 1024; // 20MB for images

    if (buffer.length > maxSize) {
      return {
        success: false,
        error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`,
      };
    }

    // Convert to Gemini-compatible format
    const mediaPart = bufferToGenerativePart(buffer, mimeType);

    // Send to Gemini for analysis
    const result = await geminiModel.generateContent([
      SYSTEM_PROMPT,
      mediaPart,
    ]);

    const responseText = result.response.text();

    // Parse the JSON response
    // Handle potential markdown code blocks in response
    let jsonString = responseText.trim();

    // Remove markdown code blocks if present
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.slice(7);
    } else if (jsonString.startsWith("```")) {
      jsonString = jsonString.slice(3);
    }
    if (jsonString.endsWith("```")) {
      jsonString = jsonString.slice(0, -3);
    }
    jsonString = jsonString.trim();

    const analysis: DamageAnalysis = JSON.parse(jsonString);

    // Validate the response structure
    if (
      typeof analysis.damage_type !== "string" ||
      typeof analysis.severity_score_1_to_10 !== "number" ||
      typeof analysis.estimated_trade_needed !== "string" ||
      typeof analysis.summary_for_homeowner !== "string"
    ) {
      return {
        success: false,
        error: "Invalid response format from AI analysis",
      };
    }

    // Clamp severity score to valid range
    analysis.severity_score_1_to_10 = Math.max(
      0,
      Math.min(10, Math.round(analysis.severity_score_1_to_10))
    );

    return {
      success: true,
      data: analysis,
    };
  } catch (error) {
    console.error("Error analyzing media:", error);

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: "Failed to parse AI response. Please try again.",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during analysis",
    };
  }
}

/**
 * Analyze multiple images/videos and combine results
 * Useful when homeowner uploads multiple angles of the same issue
 */
export async function analyzeMultipleMedia(
  fileUrls: string[]
): Promise<AnalysisResponse> {
  try {
    if (!fileUrls.length) {
      return {
        success: false,
        error: "No files provided for analysis",
      };
    }

    // For single file, use the standard function
    if (fileUrls.length === 1) {
      return analyzeMedia(fileUrls[0]);
    }

    // Fetch all files and prepare parts
    const mediaParts = await Promise.all(
      fileUrls.map(async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${url}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = getMimeType(url);
        return bufferToGenerativePart(buffer, mimeType);
      })
    );

    // Enhanced prompt for multiple images
    const multiImagePrompt = `${SYSTEM_PROMPT}

You are analyzing ${fileUrls.length} images/videos of the same repair issue from different angles. Consider all views when making your assessment and provide a comprehensive analysis.`;

    // Send all media to Gemini
    const result = await geminiModel.generateContent([
      multiImagePrompt,
      ...mediaParts,
    ]);

    const responseText = result.response.text();

    // Parse response (same logic as single image)
    let jsonString = responseText.trim();
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.slice(7);
    } else if (jsonString.startsWith("```")) {
      jsonString = jsonString.slice(3);
    }
    if (jsonString.endsWith("```")) {
      jsonString = jsonString.slice(0, -3);
    }
    jsonString = jsonString.trim();

    const analysis: DamageAnalysis = JSON.parse(jsonString);

    analysis.severity_score_1_to_10 = Math.max(
      0,
      Math.min(10, Math.round(analysis.severity_score_1_to_10))
    );

    return {
      success: true,
      data: analysis,
    };
  } catch (error) {
    console.error("Error analyzing multiple media:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during analysis",
    };
  }
}
