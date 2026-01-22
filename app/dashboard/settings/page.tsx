import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase-server";
import { getProfile } from "@/app/actions/update-profile";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const { user } = await getUser();

  if (!user) {
    redirect("/login");
  }

  const { profile } = await getProfile();

  return <SettingsClient user={user} profile={profile} />;
}
