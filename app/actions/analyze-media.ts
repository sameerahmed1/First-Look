"use server";

import {
  geminiModel,
  bufferToGenerativePart,
  getMimeType,
  isVideoMimeType,
  isImageMimeType,
} from "@/lib/gemini";
import type { AnalysisResponse, DamageAnalysis, CaptureData, AIAnalysis } from "@/types";

const SYSTEM_PROMPT = `You are a veteran general contractor with 30+ years of experience in residential and commercial repairs. You have extensive knowledge of labor and material costs across the United States.

Analyze this image or video carefully. Identify any visible damage, wear, or issues that need repair.

You MUST respond with ONLY a valid JSON object (no markdown, no code blocks, no explanations) with these exact fields:
{
  "damage_type": "Brief description of the type of damage observed (e.g., 'Water damage to ceiling', 'Cracked foundation', 'Rotting wood siding')",
  "severity_score_1_to_10": <number from 1-10 where 1 is cosmetic and 10 is structural emergency>,
  "cost_estimate_min": <minimum estimated repair cost in USD as a number, no dollar sign>,
  "cost_estimate_max": <maximum estimated repair cost in USD as a number, no dollar sign>,
  "cost_reasoning": "2-3 sentences explaining what factors into your cost estimate: materials needed, labor hours, complexity, and any assumptions you're making about the scope",
  "summary_for_homeowner": "A friendly 2-3 sentence explanation for the homeowner about what you see, what might have caused it, and general urgency level. Do NOT mention specific costs here.",
  "suggested_project_name": "A short, descriptive project name (3-5 words) like 'Kitchen Water Damage Repair' or 'Basement Foundation Crack'"
}

Cost estimation guidelines:
- For minor repairs (severity 1-3): typically $100-$1,000
- For moderate repairs (severity 4-6): typically $1,000-$5,000
- For major repairs (severity 7-8): typically $5,000-$15,000
- For severe/structural (severity 9-10): typically $15,000+
- Always provide a range (min to max) to account for regional variation and hidden issues

If you cannot identify any damage or the image/video is unclear, still return the JSON with:
- damage_type: "No visible damage detected" or "Unable to assess - image unclear"
- severity_score_1_to_10: 0
- cost_estimate_min: 0
- cost_estimate_max: 0
- cost_reasoning: "No repair costs applicable" or "Unable to estimate without clearer images"
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
      typeof analysis.cost_estimate_min !== "number" ||
      typeof analysis.cost_estimate_max !== "number" ||
      typeof analysis.cost_reasoning !== "string" ||
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
    analysis.cost_estimate_min = Math.max(0, Math.round(analysis.cost_estimate_min));
    analysis.cost_estimate_max = Math.max(
      analysis.cost_estimate_min,
      Math.round(analysis.cost_estimate_max)
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
    analysis.cost_estimate_min = Math.max(0, Math.round(analysis.cost_estimate_min));
    analysis.cost_estimate_max = Math.max(
      analysis.cost_estimate_min,
      Math.round(analysis.cost_estimate_max)
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

/**
 * ============================================================================
 * CORE FLOW: Strategic Job Brief Analysis
 * ============================================================================
 * This function accepts structured homeowner input (CaptureData) and media files,
 * and returns a comprehensive AIAnalysis for the contractor's Strategic Job Brief.
 */

const CORE_FLOW_SYSTEM_PROMPT = `You are a veteran general contractor with 30+ years of experience in residential and commercial repairs. You have extensive knowledge of labor and material costs, safety protocols, and diagnostic techniques.

You are analyzing a damage assessment request that includes:
1. Structured homeowner input (problem type, safety checks, home details, context)
2. Multiple photos/videos of the issue from different angles

Your role is to provide a STRATEGIC JOB BRIEF for the contractor that helps them:
- Triage urgency and identify the right trade
- Understand what they're looking at and what might be missing
- Develop scope hypotheses (what work is likely needed)
- Provide a realistic price range with clear assumptions

You MUST respond with ONLY a valid JSON object (no markdown, no code blocks, no explanations) with this exact structure:

{
  "summary": "2-4 sentence executive summary. What do you see? What's the likely root cause? What's the main concern?",
  "missing_evidence": [
    "Specific photo or info that would help refine the diagnosis (e.g., 'Photo of attic space above the stain', 'Close-up of flashing around chimney')",
    "Another specific request if needed"
  ],
  "triage": {
    "urgency": "Emergency" | "24-48hrs" | "Routine",
    "trade": "Primary trade needed (e.g., 'Roofing', 'Plumbing', 'Electrical', 'HVAC', 'Foundation', 'General Contractor')",
    "risk_flags": ["Specific risks like 'Active Water Intrusion', 'Mold Risk', 'Electrical Hazard', 'Structural Concern'"]
  },
  "scope_hypotheses": [
    { "item": "Likely scope item 1 (e.g., 'Replace damaged roof flashing')", "selected": true },
    { "item": "Likely scope item 2 (e.g., 'Repair interior drywall and repaint')", "selected": true },
    { "item": "Possible scope item 3 (e.g., 'Replace wet attic insulation')", "selected": false },
    { "item": "Possible scope item 4 if uncertain", "selected": false }
  ],
  "price_breakdown": {
    "range_low": <minimum realistic cost in USD as integer>,
    "range_high": <maximum realistic cost in USD as integer>,
    "assumptions": [
      "Key assumption 1 (e.g., 'Assumes flashing repair only, no structural damage')",
      "Key assumption 2 (e.g., 'Interior repair limited to one room')",
      "Key assumption 3 (e.g., 'Standard materials and labor rates')"
    ],
    "variables": [
      "Factor that could increase cost (e.g., 'Extent of water damage to insulation')",
      "Another variable (e.g., 'Roof pitch and accessibility')",
      "Another variable (e.g., 'Need for temporary weatherproofing')"
    ]
  }
}

URGENCY GUIDELINES:
- "Emergency": Active hazards (gas leak, electrical sparking, sewage, structural collapse risk, active flooding) - needs immediate response
- "24-48hrs": Active damage progression (water intrusion, exposed wiring, broken window in bad weather) - should be addressed very soon
- "Routine": Stable issue that needs repair but isn't actively getting worse - can be scheduled normally

SCOPE HYPOTHESES:
- Mark "selected": true for items you're confident are needed based on the evidence
- Mark "selected": false for items that might be needed but require more investigation
- List 3-6 scope items total, ordered from most to least certain

PRICING:
- Provide realistic ranges based on typical U.S. market rates
- Account for the home size, age, and type from the capture data
- Be transparent about assumptions (what you're including vs. excluding)
- Identify variables that could shift the price up or down
- Minor repairs (urgency=Routine, simple scope): $200-$2,000
- Moderate repairs (urgency=24-48hrs, multiple scope items): $1,500-$8,000
- Major repairs (urgency=Emergency or extensive scope): $5,000-$25,000+

MISSING EVIDENCE:
- List 0-3 specific photos or pieces of information that would help refine the assessment
- Be specific (not "more photos" but "Photo of attic space directly above the ceiling stain")
- If you have everything you need, return an empty array: []`;

/**
 * Analyze project with full context from Guided Capture Wizard
 * This is the "Brain" of the Core Flow - combines homeowner input + media for Strategic Job Brief
 *
 * @param captureData - Structured homeowner input from the wizard
 * @param fileUrls - Array of media file URLs (photos/videos)
 * @returns AIAnalysis object for the contractor's Strategic Job Brief
 */
export async function analyzeProjectWithContext(
  captureData: CaptureData,
  fileUrls: string[]
): Promise<{ success: boolean; data?: AIAnalysis; error?: string }> {
  try {
    if (!fileUrls.length) {
      return {
        success: false,
        error: "No media files provided for analysis",
      };
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

    // Build context from capture data
    const safetyFlags = Object.entries(captureData.safety_checks)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => key.replace(/_/g, " "));

    const contextPrompt = `
HOMEOWNER INPUT:
- Problem Type: ${captureData.problem_type}
- Safety Concerns: ${safetyFlags.length > 0 ? safetyFlags.join(", ") : "None reported"}
- Home Type: ${captureData.home_info.home_type}
- Year Built: ${captureData.home_info.year_built || "Unknown"}
- Floors: ${captureData.home_info.floors}
- Square Footage: ${captureData.home_info.square_footage || "Unknown"}
- When Noticed: ${captureData.context.when_noticed}
- Weather Related: ${captureData.context.weather_related ? "Yes" : "No"}
- Previous Repairs: ${captureData.context.previous_repairs ? "Yes" : "No"}
- Additional Notes: ${captureData.context.additional_notes || "None"}

MEDIA PROVIDED: ${fileUrls.length} photo(s)/video(s)

Analyze the media in conjunction with this context and provide your Strategic Job Brief.`;

    // Send to Gemini with full context
    const result = await geminiModel.generateContent([
      CORE_FLOW_SYSTEM_PROMPT,
      contextPrompt,
      ...mediaParts,
    ]);

    const responseText = result.response.text();

    // Parse the JSON response
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

    const analysis: AIAnalysis = JSON.parse(jsonString);

    // Validate the response structure
    if (
      typeof analysis.summary !== "string" ||
      !Array.isArray(analysis.missing_evidence) ||
      typeof analysis.triage !== "object" ||
      !Array.isArray(analysis.scope_hypotheses) ||
      typeof analysis.price_breakdown !== "object"
    ) {
      return {
        success: false,
        error: "Invalid response format from AI analysis",
      };
    }

    // Validate triage
    if (
      !["Emergency", "24-48hrs", "Routine"].includes(analysis.triage.urgency) ||
      typeof analysis.triage.trade !== "string" ||
      !Array.isArray(analysis.triage.risk_flags)
    ) {
      return {
        success: false,
        error: "Invalid triage data in AI response",
      };
    }

    // Validate scope hypotheses
    for (const hypothesis of analysis.scope_hypotheses) {
      if (
        typeof hypothesis.item !== "string" ||
        typeof hypothesis.selected !== "boolean"
      ) {
        return {
          success: false,
          error: "Invalid scope hypothesis structure in AI response",
        };
      }
    }

    // Validate and clamp price breakdown
    if (
      typeof analysis.price_breakdown.range_low !== "number" ||
      typeof analysis.price_breakdown.range_high !== "number" ||
      !Array.isArray(analysis.price_breakdown.assumptions) ||
      !Array.isArray(analysis.price_breakdown.variables)
    ) {
      return {
        success: false,
        error: "Invalid price breakdown structure in AI response",
      };
    }

    // Ensure price values are valid
    analysis.price_breakdown.range_low = Math.max(
      0,
      Math.round(analysis.price_breakdown.range_low)
    );
    analysis.price_breakdown.range_high = Math.max(
      analysis.price_breakdown.range_low,
      Math.round(analysis.price_breakdown.range_high)
    );

    return {
      success: true,
      data: analysis,
    };
  } catch (error) {
    console.error("Error analyzing project with context:", error);

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
