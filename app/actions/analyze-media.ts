"use server";

import {
  geminiModel,
  bufferToGenerativePart,
  getMimeType,
  isVideoMimeType,
  isImageMimeType,
} from "@/lib/gemini";
import {
  PRICE_BOOK,
  getPriceContext,
  getTradeCategories,
  type TradeCategory,
} from "@/lib/price-book.updated";
import type { AnalysisResponse, DamageAnalysis } from "@/types";

/**
 * Helper function to clean JSON responses from Gemini
 * Removes markdown code blocks if present
 */
function cleanJsonResponse(responseText: string): string {
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

  return jsonString.trim();
}

// Step 1: Identify the trade category from the damage
const TRADE_IDENTIFICATION_PROMPT = `You are a veteran general contractor. Analyze this image or video and identify the PRIMARY trade category that would handle this repair.

Available trade categories:
${getTradeCategories().join(", ")}

You MUST respond with ONLY a valid JSON object (no markdown, no code blocks) with this exact field:
{
  "trade_category": "one of the trade categories from the list above"
}

If the damage involves multiple trades, choose the PRIMARY trade. If unclear, use "General".`;

// Step 2: Generate scenario-based estimate with contextual pricing data
function getAnalysisPrompt(tradeCategory: TradeCategory): string {
  const priceContext = getPriceContext(tradeCategory);

  return `You are a veteran general contractor with 30+ years of experience in residential and commercial repairs.

Analyze this image or video carefully. Identify any visible damage, wear, or issues that need repair.

CONTEXTUAL PRICING DATA:
${priceContext}

Use the pricing data above as a reference to ground your estimates in real national averages. Adjust based on visible complexity.

You MUST respond with ONLY a valid JSON object (no markdown, no code blocks, no explanations) with these exact fields:
{
  "damage_type": "Brief description of the type of damage observed (e.g., 'Water damage to ceiling', 'Cracked foundation', 'Rotting wood siding')",
  "severity_score_1_to_10": <number from 1-10 where 1 is cosmetic and 10 is structural emergency>,
  "trade_category": "${tradeCategory}",
  "scenarios": [
    {
      "label": "Best Case",
      "price": "$X - $Y",
      "description": "Explanation of why costs would be on the lower end (e.g., minimal damage, easy access, standard materials)"
    },
    {
      "label": "Most Likely",
      "price": "$X - $Y",
      "description": "The most probable scenario based on visible damage and typical complications"
    },
    {
      "label": "Worst Case",
      "price": "$X - $Y",
      "description": "If hidden damage exists, complications arise, or premium materials needed"
    }
  ],
  "variables": ["List", "of", "factors", "that", "drive", "cost", "variations"],
  "summary_for_homeowner": "A friendly 2-3 sentence explanation for the homeowner about what you see, what might have caused it, and general urgency level. Do NOT mention specific costs here.",
  "suggested_project_name": "A short, descriptive project name (3-5 words) like 'Kitchen Water Damage Repair' or 'Basement Foundation Crack'"
}

IMPORTANT: The three scenarios must be mutually exclusive and cover the full range from best to worst case. Use the contextual pricing data to ensure your estimates are realistic and grounded in national averages.

If you cannot identify any damage or the image/video is unclear, still return the JSON with:
- damage_type: "No visible damage detected" or "Unable to assess - image unclear"
- severity_score_1_to_10: 0
- scenarios with $0 prices
- summary_for_homeowner: An appropriate explanation
- suggested_project_name: "New Assessment Request"`;
}

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

    // STEP 1: Identify the trade category first
    console.log("Step 1: Identifying trade category...");
    const tradeResult = await geminiModel.generateContent([
      TRADE_IDENTIFICATION_PROMPT,
      mediaPart,
    ]);

    const tradeResponseText = tradeResult.response.text();
    let tradeJsonString = cleanJsonResponse(tradeResponseText);
    const tradeIdentification = JSON.parse(tradeJsonString);

    const tradeCategory = tradeIdentification.trade_category as TradeCategory;

    if (!PRICE_BOOK[tradeCategory]) {
      console.warn(`Unknown trade category: ${tradeCategory}, defaulting to General`);
      tradeIdentification.trade_category = "General";
    }

    console.log(`Identified trade category: ${tradeCategory}`);

    // STEP 2: Generate full analysis with contextual pricing data
    console.log("Step 2: Generating scenario-based estimate with price book context...");
    const analysisPrompt = getAnalysisPrompt(tradeCategory);
    const analysisResult = await geminiModel.generateContent([
      analysisPrompt,
      mediaPart,
    ]);

    const responseText = analysisResult.response.text();
    let jsonString = cleanJsonResponse(responseText);

    const analysis: DamageAnalysis = JSON.parse(jsonString);

    // Validate the response structure
    if (
      typeof analysis.damage_type !== "string" ||
      typeof analysis.severity_score_1_to_10 !== "number" ||
      typeof analysis.trade_category !== "string" ||
      !Array.isArray(analysis.scenarios) ||
      analysis.scenarios.length !== 3 ||
      !Array.isArray(analysis.variables) ||
      typeof analysis.summary_for_homeowner !== "string" ||
      typeof analysis.suggested_project_name !== "string"
    ) {
      return {
        success: false,
        error: "Invalid response format from AI analysis",
      };
    }

    // Validate each scenario
    for (const scenario of analysis.scenarios) {
      if (
        typeof scenario.label !== "string" ||
        typeof scenario.price !== "string" ||
        typeof scenario.description !== "string"
      ) {
        return {
          success: false,
          error: "Invalid scenario format in AI response",
        };
      }
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

    // STEP 1: Identify the trade category first
    console.log("Step 1: Identifying trade category from multiple media...");
    const multiImageTradePrompt = `${TRADE_IDENTIFICATION_PROMPT}

You are analyzing ${fileUrls.length} images/videos of the same repair issue from different angles. Consider all views when identifying the primary trade category.`;

    const tradeResult = await geminiModel.generateContent([
      multiImageTradePrompt,
      ...mediaParts,
    ]);

    const tradeResponseText = tradeResult.response.text();
    let tradeJsonString = cleanJsonResponse(tradeResponseText);
    const tradeIdentification = JSON.parse(tradeJsonString);

    const tradeCategory = tradeIdentification.trade_category as TradeCategory;

    if (!PRICE_BOOK[tradeCategory]) {
      console.warn(`Unknown trade category: ${tradeCategory}, defaulting to General`);
      tradeIdentification.trade_category = "General";
    }

    console.log(`Identified trade category: ${tradeCategory}`);

    // STEP 2: Generate full analysis with contextual pricing data
    console.log("Step 2: Generating scenario-based estimate with price book context...");
    const analysisPrompt = getAnalysisPrompt(tradeCategory);
    const multiImageAnalysisPrompt = `${analysisPrompt}

You are analyzing ${fileUrls.length} images/videos of the same repair issue from different angles. Consider all views when making your assessment and provide a comprehensive analysis.`;

    const result = await geminiModel.generateContent([
      multiImageAnalysisPrompt,
      ...mediaParts,
    ]);

    const responseText = result.response.text();
    let jsonString = cleanJsonResponse(responseText);

    const analysis: DamageAnalysis = JSON.parse(jsonString);

    // Validate scenarios
    if (!Array.isArray(analysis.scenarios) || analysis.scenarios.length !== 3) {
      return {
        success: false,
        error: "Invalid scenario format in AI response",
      };
    }

    // Clamp severity score
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
