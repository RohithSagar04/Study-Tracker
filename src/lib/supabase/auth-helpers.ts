import { createAdminClient } from "./admin";

/** Auto-confirm email for personal single-user app (bypasses Supabase email verification). */
export async function confirmUserByEmail(email: string): Promise<boolean> {
  const admin = createAdminClient();
  let page = 1;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error || !data.users.length) return false;

    const user = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (user) {
      const { error: updateError } = await admin.auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
      );
      return !updateError;
    }

    if (data.users.length < 100) return false;
    page++;
  }

  return false;
}

export function isEmailNotConfirmedError(message: string): boolean {
  return message.toLowerCase().includes("email not confirmed");
}
