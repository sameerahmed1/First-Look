import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase-server";
import { getProjects } from "@/app/actions/projects";
import { getUploadLinks } from "@/app/actions/upload-links";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const { projects } = await getProjects();
  const { links } = await getUploadLinks();

  return <DashboardClient user={user} projects={projects} uploadLinks={links} />;
}
