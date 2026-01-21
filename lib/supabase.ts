import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name (default: "media")
 * @returns The public URL of the uploaded file
 */
export async function uploadToSupabase(
  file: File,
  bucket: string = "media"
): Promise<{ url: string; error: Error | null }> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return { url: "", error: error as Error };
  }

  // Get the public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return { url: publicUrl, error: null };
}

/**
 * Delete a file from Supabase Storage
 * @param filePath - The path of the file to delete
 * @param bucket - The storage bucket name (default: "media")
 */
export async function deleteFromSupabase(
  filePath: string,
  bucket: string = "media"
): Promise<{ error: Error | null }> {
  const { error } = await supabase.storage.from(bucket).remove([filePath]);
  return { error: error as Error | null };
}
