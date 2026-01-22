"use server";

import { createServerSupabaseClient, getUser } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

interface UpdateProfileInput {
  businessName: string;
  phoneNumber?: string;
  logoUrl?: string;
}

export async function updateProfile(input: UpdateProfileInput) {
  const supabase = await createServerSupabaseClient();
  const { user } = await getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const { error } = await supabase
      .from("contractors")
      .update({
        business_name: input.businessName,
        ...(input.logoUrl && { logo_url: input.logoUrl }),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");

    return { success: true };
  } catch (error) {
    console.error("Error in updateProfile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function getProfile() {
  const supabase = await createServerSupabaseClient();
  const { user } = await getUser();

  if (!user) {
    return { profile: null, error: "Not authenticated" };
  }

  try {
    const { data: profile, error } = await supabase
      .from("contractors")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return { profile: null, error: error.message };
    }

    return { profile, error: null };
  } catch (error) {
    console.error("Error in getProfile:", error);
    return {
      profile: null,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Upload logo to Supabase Storage
 * Note: This is a server action that handles the file upload
 */
export async function uploadLogo(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const { user } = await getUser();

  if (!user) {
    return { url: null, error: "Not authenticated" };
  }

  try {
    const file = formData.get("logo") as File;
    if (!file) {
      return { url: null, error: "No file provided" };
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      return {
        url: null,
        error: "Invalid file type. Please upload a JPG, PNG, GIF, WebP, or SVG image.",
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        url: null,
        error: "File too large. Maximum size is 5MB.",
      };
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from("media")
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading logo:", uploadError);
      return { url: null, error: uploadError.message };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("media").getPublicUrl(data.path);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error("Error in uploadLogo:", error);
    return {
      url: null,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
