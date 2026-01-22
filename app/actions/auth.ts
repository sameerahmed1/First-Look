"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const businessName = formData.get("businessName") as string;

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        business_name: businessName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Ensure contractor record exists and update with business name
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Use upsert to ensure the contractor record exists
    await supabase
      .from("contractors")
      .upsert(
        {
          id: user.id,
          email: user.email!,
          business_name: businessName || null,
        },
        {
          onConflict: "id",
        }
      );
  }

  redirect("/dashboard");
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Ensure contractor record exists (for users created before the trigger was set up)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase
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
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
