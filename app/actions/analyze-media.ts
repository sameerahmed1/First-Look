"use server";

import {
  geminiModel,
  bufferToGenerativePart,
  getMimeType,
  isVideoMimeType,
  isImageMimeType,
} from "@/lib/gemini";
import type { AnalysisResponse, DamageAnalysis } from "@/types";

const SYSTEM_PROMPT = `You are a veteran general contractor with 30+ years of experience in residential and commercial repairs. You have extensive knowledge of labor and material costs across the United States.

Analyze this image or video carefully. Identify any visible damage, wear, or issues that need repair.

You MUST respond with ONLY a valid JSON object (no markdown, no code blocks, no explanations) with these exact fields:
{
  "damage_type": "Brief description of the type of damage observed (e.g., 'Water damage to ceiling', 'Cracked foundation', 'Rotting wood siding')",
  "severity_score_1_to_10": <number from 1-10 where 1 is cosmetic and 10 is structural emergency>,
  "cost_breakdown": {
    "low_estimate": <minimum estimated repair cost in USD as a number, no dollar sign>,
    "high_estimate": <maximum estimated repair cost in USD as a number, no dollar sign>,
    "variables": [
      "List 2-5 specific cost variables/drivers as strings",
      "e.g., 'Mold presence', 'Source of leak access', 'Drywall vs Plaster', 'Code compliance requirements'",
      "These should be factors that could significantly impact the final cost"
    ],
    "contractor_note": "A PRIVATE note for the contractor only (1-2 sentences). Things they should check on-site, safety concerns, or hidden issues to investigate. For example: 'Check for soft spots near the light fixture' or 'Inspect foundation for additional cracks behind bushes'"
  },
  "summary_for_homeowner": "A friendly 2-3 sentence explanation for the homeowner about what you see, what might have caused it, and general urgency level. Do NOT mention specific costs here.",
  "suggested_project_name": "A short, descriptive project name (3-5 words) like 'Kitchen Water Damage Repair' or 'Basement Foundation Crack'"
}

Cost estimation guidelines:
- For minor repairs (severity 1-3): typically $100-$1,000
- For moderate repairs (severity 4-6): typically $1,000-$5,000
- For major repairs (severity 7-8): typically $5,000-$15,000
- For severe/structural (severity 9-10): typically $15,000+
- Always provide a range (low to high estimate) to account for regional variation and hidden issues
- Variables should be specific, actionable factors that impact cost (not generic items)
- Contractor notes should highlight inspection points or concerns not visible in photos

If you cannot identify any damage or the image/video is unclear, still return the JSON with:
- damage_type: "No visible damage detected" or "Unable to assess - image unclear"
- severity_score_1_to_10: 0
- cost_breakdown with low_estimate: 0, high_estimate: 0, empty variables array, and appropriate contractor note
- summary_for_homeowner: An appropriate explanation
- suggested_project_name: "New Assessment Request"`;

/**
 * Analyze media (image or video) using Gemini 2.5 Pro
 * This is the core "Eyes" of the First Look app
 *
 * @param fileUrl - Public URL of the uploaded image/video from Supabase Storage
 * @returns Analysis result with damage assessment and cost estimate
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
      !analysis.cost_breakdown ||
      typeof analysis.cost_breakdown.low_estimate !== "number" ||
      typeof analysis.cost_breakdown.high_estimate !== "number" ||
      !Array.isArray(analysis.cost_breakdown.variables) ||
      typeof analysis.cost_breakdown.contractor_note !== "string" ||
      typeof analysis.summary_for_homeowner !== "string" ||
      typeof analysis.suggested_project_name !== "string"
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

    // Ensure cost estimates are non-negative
    analysis.cost_breakdown.low_estimate = Math.max(
      0,
      Math.round(analysis.cost_breakdown.low_estimate)
    );
    analysis.cost_breakdown.high_estimate = Math.max(
      analysis.cost_breakdown.low_estimate,
      Math.round(analysis.cost_breakdown.high_estimate)
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

You are analyzing ${fileUrls.length} images/videos of the same repair issue from different angles. Consider all views when making your assessment and provide a comprehensive analysis with accurate cost estimates.`;

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

    // Clamp and validate values
    analysis.severity_score_1_to_10 = Math.max(
      0,
      Math.min(10, Math.round(analysis.severity_score_1_to_10))
    );
    analysis.cost_breakdown.low_estimate = Math.max(
      0,
      Math.round(analysis.cost_breakdown.low_estimate)
    );
    analysis.cost_breakdown.high_estimate = Math.max(
      analysis.cost_breakdown.low_estimate,
      Math.round(analysis.cost_breakdown.high_estimate)
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
