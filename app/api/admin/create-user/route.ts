import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";
import { hasSupabaseEnv } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function getReadableAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("already") || normalized.includes("registered")) {
    return "המייל כבר קיים במערכת";
  }

  if (normalized.includes("password")) {
    return "הסיסמה קצרה מדי או לא עומדת בדרישות";
  }

  return "לא ניתן ליצור חשבון כרגע";
}

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return jsonError("חסרה הגדרת Supabase", 503);
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!adminEmail) {
    return jsonError("חסרה הגדרת ADMIN_EMAIL", 500);
  }

  const serviceSupabase = getSupabaseAdminClient();

  if (!serviceSupabase) {
    return jsonError("חסר SUPABASE_SERVICE_ROLE_KEY בצד שרת", 500);
  }

  const supabase = await createServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonError("יש להתחבר לפני יצירת חשבון", 401);
  }

  if (!isAdminEmail(user.email)) {
    return jsonError("אין הרשאה ליצור חשבונות", 403);
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return jsonError("בקשה לא תקינה", 400);
  }

  const record = body as Record<string, unknown>;
  const firstName = typeof record.first_name === "string" ? record.first_name.trim() : "";
  const email = typeof record.email === "string" ? record.email.trim().toLowerCase() : "";
  const password = typeof record.password === "string" ? record.password : "";
  const dailyTarget = record.daily_target === "" || record.daily_target === null || record.daily_target === undefined
    ? 3000
    : Number(record.daily_target);

  if (firstName.length < 2) {
    return jsonError("יש להזין שם פרטי באורך 2 תווים לפחות", 400);
  }

  if (!email) {
    return jsonError("יש להזין מייל", 400);
  }

  if (password.length < 6) {
    return jsonError("הסיסמה הזמנית חייבת להכיל לפחות 6 תווים", 400);
  }

  if (!Number.isFinite(dailyTarget) || dailyTarget < 500 || dailyTarget > 100000) {
    return jsonError("היעד היומי חייב להיות בין 500 ל-100,000", 400);
  }

  const { data, error } = await serviceSupabase.auth.admin.createUser({
    email,
    email_confirm: true,
    password,
    user_metadata: {
      daily_target: dailyTarget,
      first_name: firstName,
    },
  });

  if (error || !data.user) {
    return jsonError(getReadableAuthError(error?.message || ""), error?.status || 400);
  }

  const now = new Date().toISOString();
  const { error: profileError } = await serviceSupabase
    .from("users")
    .upsert(
      {
        daily_target: dailyTarget,
        first_name: firstName,
        id: data.user.id,
        updated_at: now,
      },
      { onConflict: "id" },
    );

  if (profileError) {
    return jsonError("החשבון נוצר, אך יצירת פרופיל המשתמש נכשלה", 500);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
