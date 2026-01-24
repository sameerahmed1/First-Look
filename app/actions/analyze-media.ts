"use server";

import {
  geminiModel,
  bufferToGenerativePart,
  getMimeType,
  isVideoMimeType,
  isImageMimeType,
} from "@/lib/gemini";
import type { AnalysisResponse, DamageAnalysis, CaptureData, AIAnalysis } from "@/types";
import { getPriceContext, type TradeCategory } from "@/lib/price-book.updated";

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
          throw new Error("Failed to fetch file: " + url);
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

const TRADE_IDENTIFICATION_PROMPT = `You are a veteran general contractor. Analyze these photos/videos and identify the PRIMARY trade category needed for this repair.

Respond with ONLY a valid JSON object (no markdown, no explanations):
{
  "trade_category": "<category>"
}

Valid categories: Plumbing, Electrical, Drywall_Paint, Roofing, HVAC, Appliances, General, Carpentry, Flooring, Windows_Doors, Concrete_Masonry, Siding_Exterior, Water_Mold_Restoration, Insulation

Choose the MOST SPECIFIC category. If multiple trades are needed, choose the PRIMARY one (e.g., roof leak → Roofing, even if drywall repair is also needed).`;

const CORE_FLOW_SYSTEM_PROMPT_TEMPLATE = (priceContext: string) => 
  "You are a veteran general contractor with 30+ years of experience in residential and commercial repairs. You have extensive knowledge of labor and material costs, safety protocols, diagnostic techniques, and regional construction practices across the United States.\n\n" +
  "You are analyzing a damage assessment request that includes:\n" +
  "1. Structured homeowner input (problem type, safety checks, home details, context)\n" +
  "2. Multiple photos/videos of the issue from different angles\n\n" +
  priceContext + "\n\n" +
  "Your role is to provide a STRATEGIC JOB BRIEF for the contractor that helps them:\n" +
  "- Triage urgency and identify specific risks\n" +
  "- Understand what they're looking at and what might be missing\n" +
  "- Develop scope hypotheses (what work is likely needed)\n" +
  "- Provide 3 pricing scenarios based on the CONTEXTUAL PRICING DATA above\n\n" +
  "You MUST respond with ONLY a valid JSON object (no markdown, no code blocks, no explanations) with this exact structure:\n\n" +
  "{\n" +
  '  "summary": "2-4 sentence executive summary. What do you see? What\'s the likely root cause? What\'s the main concern?",\n' +
  '  "missing_evidence": [\n' +
  '    "Specific photo of X that would help confirm Y",\n' +
  '    "Another specific request (list 0-3 items that would SIGNIFICANTLY change scope or pricing)"\n' +
  '  ],\n' +
  '  "triage": {\n' +
  '    "urgency": "Emergency" | "24-48hrs" | "Routine",\n' +
  '    "trade": "Primary trade needed (e.g., \'Roofing\', \'Plumbing\', \'Electrical\', \'HVAC\', \'Foundation\', \'Siding\')",\n' +
  '    "risk_flags": ["Specific risks like \'Active Water Intrusion\', \'Mold Risk\', \'Electrical Hazard\', \'Structural Movement\'"]\n' +
  '  },\n' +
  '  "scope_hypotheses": [\n' +
  '    { "item": "Replace damaged chimney flashing and seal penetrations", "selected": true },\n' +
  '    { "item": "Replace water-damaged ceiling drywall in master bedroom", "selected": true },\n' +
  '    { "item": "Inspect attic insulation for moisture damage", "selected": false }\n' +
  '  ],\n' +
  '  "trade_category": "The trade category from the pricing data",\n' +
  '  "scenarios": [\n' +
  '    {\n' +
  '      "label": "Best Case",\n' +
  '      "price": "$1,200-$1,800",\n' +
  '      "description": "Isolated flashing repair with minimal interior damage, standard access"\n' +
  '    },\n' +
  '    {\n' +
  '      "label": "Most Likely",\n' +
  '      "price": "$2,500-$3,500",\n' +
  '      "description": "Flashing replacement plus drywall repair and repainting, typical residential setup"\n' +
  '    },\n' +
  '    {\n' +
  '      "label": "Worst Case",\n' +
  '      "price": "$5,000-$7,000",\n' +
  '      "description": "Extensive hidden water damage to roof decking, ceiling joists, and insulation requiring structural repairs"\n' +
  '    }\n' +
  '  ],\n' +
  '  "variables": [\n' +
  '    "Extent of hidden water damage to roof decking and ceiling structure",\n' +
  '    "Accessibility and roof pitch (steeper roofs require more safety equipment)",\n' +
  '    "Age and condition of surrounding roofing materials requiring replacement",\n' +
  '    "Local permit requirements and inspection timelines"\n' +
  '  ]\n' +
  '}\n\n' +
  'EXECUTIVE SUMMARY ("summary"):\n' +
  '- Lead with what you see in the photos (visible damage, conditions, clues)\n' +
  '- State the likely root cause based on evidence\n' +
  '- Identify the main concern for the contractor (e.g., "Active leak needs immediate attention" or "Cosmetic issue with deferred timeline")\n' +
  '- Keep it 2-4 sentences, focused and actionable\n\n' +
  'MISSING EVIDENCE ("missing_evidence"):\n' +
  '- Request 0-3 specific photos or pieces of information\n' +
  '- ONLY request evidence that would SIGNIFICANTLY change your scope or pricing assessment\n' +
  '- Be specific: "Photo of attic space above stain to check for active moisture" NOT "more photos"\n' +
  '- Prioritize by impact: if you have enough to quote confidently, leave this array empty or minimal\n' +
  '- Examples: "Photo of electrical panel to verify amperage", "Measurement of affected wall length", "View of crawlspace access point"\n\n' +
  'TRIAGE ("triage"):\n' +
  '- urgency:\n' +
  '  * "Emergency" = Active hazards requiring immediate response (gas leak, electrical sparking, sewage backup, structural collapse, active flooding)\n' +
  '  * "24-48hrs" = Active damage progression (water intrusion, exposed wiring, broken window, failing sump pump)\n' +
  '  * "Routine" = Stable issue needing repair but not actively worsening (old stain, cosmetic damage, deferred maintenance)\n' +
  '- trade: Be specific with the PRIMARY trade (not just "General") - examples: "Roofing", "Plumbing", "Electrical", "HVAC", "Drywall", "Flooring", "Foundation", "Siding", "Carpentry"\n' +
  '- risk_flags: List 1-4 specific risks visible or implied (examples: "Active Water Intrusion", "Mold Risk", "Electrical Hazard", "Structural Movement", "Trip Hazard", "Pest Damage", "Fire Risk")\n\n' +
  'SCOPE HYPOTHESES ("scope_hypotheses"):\n' +
  '- List 3-6 likely work items in order from most certain to least certain\n' +
  '- Be SPECIFIC: "Replace damaged roof flashing around chimney" NOT "Fix roof"\n' +
  '- Use contractor-level detail: "Remove and replace water-damaged drywall (approx 4\'x8\' section)" NOT "Fix ceiling"\n' +
  '- Mark "selected": true for items you\'re confident are needed based on visible evidence\n' +
  '- Mark "selected": false for items that might be needed but require investigation on-site\n' +
  '- Good examples:\n' +
  '  * "Remove and replace rotted fascia board on north side (approx 12 linear feet)"\n' +
  '  * "Re-flash skylight with new curb and EPDM membrane"\n' +
  '  * "Repair cracked foundation with epoxy injection (3 visible cracks, 6-8 feet total)"\n\n' +
  'PRICING SCENARIOS ("scenarios"):\n' +
  '- You MUST provide exactly 3 scenarios: Best Case, Most Likely, Worst Case\n' +
  '- Use the CONTEXTUAL PRICING DATA above as your anchor - these are 2026 U.S. national averages\n' +
  '- Your scenarios MUST align with the pricing ranges provided in the data\n' +
  '- Do NOT hallucinate prices outside the ranges shown\n' +
  '- Consider the homeowner\'s home details (size, age, type) when applying the pricing data\n' +
  '- Always provide price RANGES (e.g., "$1,200-$1,800"), NEVER single numbers\n' +
  '- Pricing rules by scenario:\n' +
  '  * Best Case: Minimal scope, straightforward access, no hidden damage - use LOW end of relevant line items\n' +
  '  * Most Likely: Expected scope based on visible evidence - use MIDDLE range of line items\n' +
  '  * Worst Case: Additional hidden damage, difficult access, complications - use HIGH end or combine multiple line items\n' +
  '- Be transparent in descriptions: explain what IS and ISN\'T included (e.g., "Excludes permit fees" or "Includes disposal")\n' +
  '- Account for home specifics: larger homes = more area to cover, older homes = higher complication risk, multi-story = access challenges\n\n' +
  'VARIABLES ("variables"):\n' +
  '- List 2-4 factors that could drive the price up OR down from Most Likely scenario\n' +
  '- Include BOTH scope variables (unknown damage extent) AND access/complexity variables (roof pitch, permit needs)\n' +
  '- Be specific with examples:\n' +
  '  * "Extent of hidden water damage to roof decking and structural framing"\n' +
  '  * "Accessibility and roof pitch (steeper pitches require additional safety equipment and labor)"\n' +
  '  * "Age and condition of adjacent materials requiring replacement for proper integration"\n' +
  '  * "Local building permit requirements and inspection timelines"\n' +
  '- Avoid vague variables like "materials" or "labor" - be specific about what aspect could vary\n\n' +
  'CRITICAL PRICING RULES:\n' +
  '- Anchor ALL pricing to the CONTEXTUAL PRICING DATA provided above\n' +
  '- These are 2026 U.S. national averages - adjust slightly for home size/age/complexity but stay within reasonable bounds\n' +
  '- Do NOT invent prices outside the provided ranges\n' +
  '- Combine multiple line items if the job requires it (e.g., Roof Leak repair + Interior Drywall repair)\n' +
  '- Price format: Always "$X-$Y" or "$X,XXX-$Y,YYY" for thousands (use commas)\n' +
  '- Transparency: If a price seems low or high, explain why in the description';

/**
 * Analyze project with full context from Guided Capture Wizard
 * This is the "Brain" of the Core Flow - combines homeowner input + media for Strategic Job Brief
 *
 * TWO-STEP PROCESS:
 * 1. Identify trade category from media
 * 2. Get relevant pricing data and perform full analysis
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
          throw new Error("Failed to fetch file: " + url);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = getMimeType(url);
        return bufferToGenerativePart(buffer, mimeType);
      })
    );

    // STEP 1: Identify trade category
    const tradeIdResult = await geminiModel.generateContent([
      TRADE_IDENTIFICATION_PROMPT,
      "Problem reported: " + captureData.problem_type,
      ...mediaParts,
    ]);

    let tradeIdText = tradeIdResult.response.text().trim();

    // Remove markdown if present
    if (tradeIdText.startsWith("```json")) tradeIdText = tradeIdText.slice(7);
    else if (tradeIdText.startsWith("```")) tradeIdText = tradeIdText.slice(3);
    if (tradeIdText.endsWith("```")) tradeIdText = tradeIdText.slice(0, -3);
    tradeIdText = tradeIdText.trim();

    const tradeIdResponse = JSON.parse(tradeIdText);
    const tradeCategory = tradeIdResponse.trade_category as TradeCategory;

    // STEP 2: Get pricing context for this trade
    const priceContext = getPriceContext(tradeCategory);

    // Build homeowner context
    const safetyFlags = Object.entries(captureData.safety_checks)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => key.replace(/_/g, " "));

    const contextPrompt = "\nHOMEOWNER INPUT:\n" +
      "- Problem Type: " + captureData.problem_type + "\n" +
      "- Safety Concerns: " + (safetyFlags.length > 0 ? safetyFlags.join(", ") : "None reported") + "\n" +
      "- Home Type: " + captureData.home_info.home_type + "\n" +
      "- Year Built: " + (captureData.home_info.year_built || "Unknown") + "\n" +
      "- Floors: " + captureData.home_info.floors + "\n" +
      "- Square Footage: " + (captureData.home_info.square_footage || "Unknown") + "\n" +
      "- When Noticed: " + captureData.context.when_noticed + "\n" +
      "- Weather Related: " + (captureData.context.weather_related ? "Yes" : "No") + "\n" +
      "- Previous Repairs: " + (captureData.context.previous_repairs ? "Yes" : "No") + "\n" +
      "- Additional Notes: " + (captureData.context.additional_notes || "None") + "\n\n" +
      "MEDIA PROVIDED: " + fileUrls.length + " photo(s)/video(s)\n\n" +
      "Analyze the media in conjunction with this context and provide your Strategic Job Brief with 3 pricing scenarios.";

    // STEP 3: Full analysis with price context
    const analysisResult = await geminiModel.generateContent([
      CORE_FLOW_SYSTEM_PROMPT_TEMPLATE(priceContext),
      contextPrompt,
      ...mediaParts,
    ]);

    let responseText = analysisResult.response.text().trim();

    // Remove markdown if present
    if (responseText.startsWith("```json")) responseText = responseText.slice(7);
    else if (responseText.startsWith("```")) responseText = responseText.slice(3);
    if (responseText.endsWith("```")) responseText = responseText.slice(0, -3);
    responseText = responseText.trim();

    const analysis: AIAnalysis = JSON.parse(responseText);

    // Validate the response structure
    if (
      typeof analysis.summary !== "string" ||
      !Array.isArray(analysis.missing_evidence) ||
      typeof analysis.triage !== "object" ||
      !Array.isArray(analysis.scope_hypotheses) ||
      !Array.isArray(analysis.scenarios) ||
      !Array.isArray(analysis.variables) ||
      typeof analysis.trade_category !== "string"
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

    // Validate scenarios - must have exactly 3
    if (analysis.scenarios.length !== 3) {
      return {
        success: false,
        error: "Must have exactly 3 pricing scenarios",
      };
    }

    const validLabels = ["Best Case", "Most Likely", "Worst Case"];
    for (const scenario of analysis.scenarios) {
      if (
        !validLabels.includes(scenario.label) ||
        typeof scenario.price !== "string" ||
        typeof scenario.description !== "string"
      ) {
        return {
          success: false,
          error: "Invalid scenario structure in AI response",
        };
      }
    }

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
