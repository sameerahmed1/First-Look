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
  created_at: string;
}

export interface Project {
  id: string;
  contractor_id: string;
  customer_name: string;
  project_name: string;
  status: "pending" | "analyzed" | "quoted" | "completed";
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
