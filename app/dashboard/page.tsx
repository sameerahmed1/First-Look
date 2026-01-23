import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase-server";
import { getProjects } from "@/app/actions/projects";
import { getUploadLinks } from "@/app/actions/upload-links";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const { projects } = await getProjects();
  const { links } = await getUploadLinks();

  // Fetch contractor profile for business name
  const supabase = await createServerSupabaseClient();
  const { data: contractor } = await supabase
    .from("contractors")
    .select("business_name")
    .eq("id", user.id)
    .single();

  return (
    <DashboardClient
      user={user}
      projects={projects}
      uploadLinks={links}
      businessName={contractor?.business_name || null}
    />
  );
}
