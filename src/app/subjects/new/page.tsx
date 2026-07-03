import Navbar from "@/components/Navbar";
import AddSubjectForm from "@/components/AddSubjectForm";
import { createClient } from "@/lib/supabase/server";

export default async function NewSubjectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let defaultDailyMinutes = 120;
  if (user) {
    const { data: settings } = await supabase
      .from("settings")
      .select("daily_study_minutes")
      .eq("user_id", user.id)
      .single();
    if (settings) defaultDailyMinutes = settings.daily_study_minutes;
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-6 pb-20">
        <h1 className="mb-6 text-2xl font-bold">Add learning goal</h1>
        <AddSubjectForm defaultDailyMinutes={defaultDailyMinutes} />
      </main>
    </>
  );
}
