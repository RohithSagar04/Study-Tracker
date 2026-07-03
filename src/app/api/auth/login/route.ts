import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  confirmUserByEmail,
  isEmailNotConfirmedError,
} from "@/lib/supabase/auth-helpers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const supabase = await createClient();

    let { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error && isEmailNotConfirmedError(error.message)) {
      const confirmed = await confirmUserByEmail(email);
      if (confirmed) {
        const retry = await supabase.auth.signInWithPassword({ email, password });
        error = retry.error;
      }
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Server error during sign in. Check Supabase configuration." },
      { status: 500 }
    );
  }
}
