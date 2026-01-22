"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { analyzeMultipleMedia, analyzeProjectWithContext } from "./analyze-media";
import { revalidatePath } from "next/cache";
import type { CaptureData } from "@/types";

interface CreateProjectInput {
  contractorId: string;
  uploadLinkId?: string;
  customerName: string;
  fileUrls: string[];
}

export async function createProject(input: CreateProjectInput) {
  const supabase = await createServerSupabaseClient();

  try {
    // First, analyze the media to get the project name and assessment
    const analysisResult = await analyzeMultipleMedia(input.fileUrls);

    if (!analysisResult.success || !analysisResult.data) {
      return {
        success: false,
        error: analysisResult.error || "Failed to analyze media",
      };
    }

    const analysis = analysisResult.data;

    // Create the project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        contractor_id: input.contractorId,
        upload_link_id: input.uploadLinkId || null,
        customer_name: input.customerName,
        project_name: analysis.suggested_project_name,
        status: "analyzed",
      })
      .select()
      .single();

    if (projectError) {
      console.error("Error creating project:", projectError);
      return { success: false, error: projectError.message };
    }

    // Add media files to project
    const mediaInserts = input.fileUrls.map((url) => ({
      project_id: project.id,
      file_url: url,
      file_type: url.match(/\.(mp4|webm|mov)$/i) ? "video" : "image",
    }));

    const { error: mediaError } = await supabase
      .from("project_media")
      .insert(mediaInserts);

    if (mediaError) {
      console.error("Error adding project media:", mediaError);
    }

    // Save the analysis
    const { error: analysisError } = await supabase
      .from("project_analysis")
      .insert({
        project_id: project.id,
        damage_type: analysis.damage_type,
        severity_score: analysis.severity_score_1_to_10,
        cost_estimate_min: analysis.cost_estimate_min,
        cost_estimate_max: analysis.cost_estimate_max,
        cost_reasoning: analysis.cost_reasoning,
        summary: analysis.summary_for_homeowner,
      });

    if (analysisError) {
      console.error("Error saving analysis:", analysisError);
    }

    revalidatePath("/dashboard");

    return {
      success: true,
      projectId: project.id,
      projectName: analysis.suggested_project_name,
    };
  } catch (error) {
    console.error("Error in createProject:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function getProjects() {
  const supabase = await createServerSupabaseClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      project_media (*),
      project_analysis (*)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return { projects: [], error: error.message };
  }

  return { projects, error: null };
}

export async function getProjectById(projectId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      project_media (*),
      project_analysis (*)
    `
    )
    .eq("id", projectId)
    .single();

  if (error) {
    console.error("Error fetching project:", error);
    return { project: null, error: error.message };
  }

  return { project, error: null };
}

export async function updateProjectStatus(
  projectId: string,
  status: string
) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteProject(projectId: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("projects").delete().eq("id", projectId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * ============================================================================
 * CORE FLOW: Create Project with Guided Capture Wizard Data
 * ============================================================================
 */

interface CreateProjectWithWizardInput {
  contractorId: string;
  uploadLinkId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  captureData: CaptureData;
  fileUrls: string[]; // Already uploaded to Supabase Storage by client
}

export async function createProjectWithWizard(input: CreateProjectWithWizardInput) {
  const supabase = await createServerSupabaseClient();

  try {
    // Analyze the project with full context from the wizard
    const analysisResult = await analyzeProjectWithContext(
      input.captureData,
      input.fileUrls
    );

    if (!analysisResult.success || !analysisResult.data) {
      return {
        success: false,
        error: analysisResult.error || "Failed to analyze project",
      };
    }

    const aiAnalysis = analysisResult.data;

    // Generate project name from problem type and AI summary
    const projectName = `${input.captureData.problem_type} - ${input.customerName}`;

    // Create the project with Core Flow fields
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        contractor_id: input.contractorId,
        upload_link_id: input.uploadLinkId,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone,
        project_name: projectName,
        status: "new", // New projects start as "new"
        capture_data: input.captureData,
        ai_analysis: aiAnalysis,
      })
      .select()
      .single();

    if (projectError) {
      console.error("Error creating project:", projectError);
      return { success: false, error: projectError.message };
    }

    // Add media files to project
    const mediaInserts = input.fileUrls.map((url) => ({
      project_id: project.id,
      file_url: url,
      file_type: url.match(/\.(mp4|webm|mov)$/i) ? "video" : "image",
    }));

    const { error: mediaError } = await supabase
      .from("project_media")
      .insert(mediaInserts);

    if (mediaError) {
      console.error("Error adding project media:", mediaError);
      // Don't fail the whole operation if media insert fails
    }

    revalidatePath("/dashboard");

    return {
      success: true,
      projectId: project.id,
      projectName: projectName,
    };
  } catch (error) {
    console.error("Error in createProjectWithWizard:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
