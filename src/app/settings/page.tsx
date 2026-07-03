import Navbar from "@/components/Navbar";
import SettingsForm from "@/components/SettingsForm";
import { createClient } from "@/lib/supabase/server";
import type { Settings } from "@/lib/types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let settings: Settings = {
    id: "",
    user_id: user?.id ?? "",
    reminder_time: "20:00:00",
    daily_study_minutes: 120,
    timezone: "Asia/Kolkata",
    last_reminder_sent_at: null,
  };

  if (user) {
    const { data } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (data) settings = data as Settings;
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-6 pb-20">
        <h1 className="mb-6 text-2xl font-bold">Settings</h1>
        <SettingsForm settings={settings} />
      </main>
    </>
  );
}
