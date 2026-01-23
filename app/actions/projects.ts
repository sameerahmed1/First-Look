"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { analyzeMultipleMedia } from "./analyze-media";
import { revalidatePath } from "next/cache";

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
  status: "new" | "pending" | "analyzed" | "reviewed" | "quoted" | "completed" | "archived"
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
