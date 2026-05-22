"use client";

import { FormEvent, useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { StatusMessage } from "@/components/status-message";

const initialForm = {
  daily_target: "",
  email: "",
  first_name: "",
  password: "",
};

export function AdminCreateUserForm() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function validate() {
    const firstName = form.first_name.trim();
    const email = form.email.trim();
    const password = form.password;
    const target = form.daily_target ? Number(form.daily_target) : 3000;

    if (firstName.length < 2) {
      return "יש להזין שם פרטי באורך 2 תווים לפחות";
    }

    if (!email) {
      return "יש להזין מייל";
    }

    if (password.length < 6) {
      return "הסיסמה הזמנית חייבת להכיל לפחות 6 תווים";
    }

    if (!Number.isFinite(target) || target < 500 || target > 100000) {
      return "היעד היומי חייב להיות בין 500 ל-100,000";
    }

    return "";
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/admin/create-user", {
        body: JSON.stringify({
          daily_target: form.daily_target ? Number(form.daily_target) : 3000,
          email: form.email.trim().toLowerCase(),
          first_name: form.first_name.trim(),
          password: form.password,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(payload.error || "לא ניתן ליצור חשבון כרגע");
        return;
      }

      setForm(initialForm);
      setSuccess("החשבון נוצר בהצלחה");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <StatusMessage error={error} success={success} />

      <label className="block text-sm font-semibold text-zinc-200">
        שם פרטי
        <input
          className="field mt-2"
          minLength={2}
          name="first_name"
          onChange={(event) => updateField("first_name", event.target.value)}
          required
          value={form.first_name}
        />
      </label>

      <label className="block text-sm font-semibold text-zinc-200">
        מייל
        <input
          className="field mt-2"
          name="email"
          onChange={(event) => updateField("email", event.target.value)}
          required
          type="email"
          value={form.email}
        />
      </label>

      <label className="block text-sm font-semibold text-zinc-200">
        סיסמה זמנית
        <input
          className="field mt-2"
          minLength={6}
          name="password"
          onChange={(event) => updateField("password", event.target.value)}
          required
          type="password"
          value={form.password}
        />
      </label>

      <label className="block text-sm font-semibold text-zinc-200">
        יעד יומי אופציונלי
        <input
          className="field mt-2"
          inputMode="numeric"
          max={100000}
          min={500}
          name="daily_target"
          onChange={(event) => updateField("daily_target", event.target.value)}
          placeholder="לדוגמה: 3000"
          type="number"
          value={form.daily_target}
        />
      </label>

      <button className="button-primary w-full gap-2" disabled={isPending} type="submit">
        <UserPlus className="h-4 w-4" />
        {isPending ? "יוצר חשבון..." : "יצירת חשבון"}
      </button>
    </form>
  );
}
