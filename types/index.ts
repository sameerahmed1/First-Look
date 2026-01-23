/**
 * Analysis result from Gemini for damage assessment
 */
export interface DamageAnalysis {
  damage_type: string;
  severity_score_1_to_10: number;
  cost_estimate_min: number;
  cost_estimate_max: number;
  cost_reasoning: string;
  summary_for_homeowner: string;
  suggested_project_name: string;
}

/**
 * Response from the analyzeMedia server action
 */
export interface AnalysisResponse {
  success: boolean;
  data?: DamageAnalysis;
  error?: string;
}

/**
 * ============================================================================
 * CORE FLOW TYPES - Guided Capture Wizard & Strategic Job Brief
 * ============================================================================
 */

/**
 * Safety check flags from homeowner (Step B of Wizard)
 */
export interface SafetyChecks {
  active_dripping: boolean;
  gas_smell: boolean;
  sewage_backup: boolean;
  structural_damage: boolean;
  electrical_sparking: boolean;
}

/**
 * Home information from homeowner (Step D of Wizard)
 */
export interface HomeInfo {
  year_built: number | null;
  home_type: "Single Family" | "Condo" | "Townhouse" | "Multi-Family" | "Mobile Home" | "Other";
  floors: number;
  square_footage: number | null;
}

/**
 * Additional context from homeowner (Step D of Wizard)
 */
export interface ContextInfo {
  when_noticed: "Today" | "This week" | "This month" | "Longer" | "Unknown";
  weather_related: boolean;
  previous_repairs: boolean;
  additional_notes: string;
}

/**
 * Complete capture data from Guided Capture Wizard (stored in projects.capture_data)
 */
export interface CaptureData {
  problem_type: string; // e.g., "Roof - Leak or Missing Shingles"
  safety_checks: SafetyChecks;
  home_info: HomeInfo;
  context: ContextInfo;
  availability?: string; // Homeowner's availability for site visit
}

/**
 * Triage assessment from AI
 */
export interface Triage {
  urgency: "Emergency" | "24-48hrs" | "Routine";
  trade: string; // e.g., "Roofing", "Plumbing", "Electrical"
  risk_flags: string[]; // e.g., ["Water Damage", "Potential Mold"]
}

/**
 * Scope hypothesis item (contractor can toggle)
 */
export interface ScopeHypothesis {
  item: string; // e.g., "Chimney flashing replacement"
  selected: boolean;
}

/**
 * Price scenario (Best Case, Most Likely, Worst Case)
 */
export interface PriceScenario {
  label: "Best Case" | "Most Likely" | "Worst Case";
  price: string; // e.g., "$500-$800"
  description: string; // Why this scenario applies
}

/**
 * Complete AI analysis for Strategic Job Brief (stored in projects.ai_analysis)
 */
export interface AIAnalysis {
  summary: string; // Main takeaway from AI
  missing_evidence: string[]; // What additional photos/info would help
  triage: Triage;
  scope_hypotheses: ScopeHypothesis[];
  trade_category: string; // e.g., "Plumbing", "Roofing"
  scenarios: PriceScenario[]; // Always 3 scenarios
  variables: string[]; // Factors driving cost up/down
}

/**
 * Upload status for tracking file upload progress
 */
export interface UploadStatus {
  isUploading: boolean;
  progress: number;
  error: string | null;
  url: string | null;
}

/**
 * Database types
 */
export interface Contractor {
  id: string;
  email: string;
  business_name: string | null;
  logo_url: string | null; // White labeling support
  created_at: string;
}

export interface Project {
  id: string;
  contractor_id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  project_name: string;
  status: "new" | "pending" | "analyzed" | "reviewed" | "quoted" | "completed" | "archived";
  capture_data: CaptureData | null; // Structured homeowner input from Guided Wizard
  ai_analysis: AIAnalysis | null; // Structured AI output for Job Brief
  created_at: string;
  updated_at: string;
}

export interface ProjectMedia {
  id: string;
  project_id: string;
  file_url: string;
  file_type: "image" | "video";
  created_at: string;
}

export interface ProjectAnalysis {
  id: string;
  project_id: string;
  damage_type: string;
  severity_score: number;
  cost_estimate_min: number;
  cost_estimate_max: number;
  cost_reasoning: string;
  summary: string;
  created_at: string;
}

export interface UploadLink {
  id: string;
  contractor_id: string;
  token: string;
  label: string | null;
  expires_at: string | null;
  created_at: string;
}

/**
 * Supported file types for upload
 */
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export const SUPPORTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export const SUPPORTED_FILE_TYPES = [
  ...SUPPORTED_IMAGE_TYPES,
  ...SUPPORTED_VIDEO_TYPES,
];

/**
 * Maximum file sizes
 */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB for 30s video

/**
 * Validate file type and size
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);
  const isVideo = SUPPORTED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Please upload an image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, MOV).`,
    };
  }

  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxSizeMB}MB for ${isImage ? "images" : "videos"}.`,
    };
  }

  return { valid: true };
}
