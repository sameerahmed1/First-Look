"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function createUploadLink(label?: string) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Ensure contractor record exists (in case the database trigger didn't fire)
  const { error: contractorError } = await supabase
    .from("contractors")
    .upsert(
      {
        id: user.id,
        email: user.email!,
      },
      {
        onConflict: "id",
        ignoreDuplicates: true,
      }
    );

  if (contractorError) {
    console.error("Error ensuring contractor exists:", contractorError);
    return {
      success: false,
      error: `Failed to set up contractor account: ${contractorError.message}`,
    };
  }

  const { data, error } = await supabase
    .from("upload_links")
    .insert({
      contractor_id: user.id,
      label: label || null,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");

  return {
    success: true,
    link: data,
    uploadUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/upload/${data.token}`,
  };
}

export async function getUploadLinks() {
  const supabase = await createServerSupabaseClient();

  const { data: links, error } = await supabase
    .from("upload_links")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { links: [], error: error.message };
  }

  return { links, error: null };
}

export async function deleteUploadLink(linkId: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("upload_links")
    .delete()
    .eq("id", linkId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getUploadLinkByToken(token: string) {
  const supabase = await createServerSupabaseClient();

  const { data: link, error } = await supabase
    .from("upload_links")
    .select(
      `
      *,
      contractors (
        business_name
      )
    `
    )
    .eq("token", token)
    .single();

  if (error) {
    return { link: null, error: error.message };
  }

  // Check if link has expired
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return { link: null, error: "This upload link has expired" };
  }

  return { link, error: null };
}
