"use client";

import { AlertTriangle } from "lucide-react";

import { useFormState, useFormStatus } from "react-dom";
import { resetPasswordAction, type ForgotState } from "@/app/(auth)/password-actions";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full py-3" disabled={pending}>
      {pending ? "Resetting…" : "Reset password"}
    </button>
  );
}

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, formAction] = useFormState<ForgotState, FormData>(resetPasswordAction, undefined);

  if (!token) {
    return (
      <div className="rounded-xl border-2 border-heart-200 bg-heart-50 p-4 text-center text-sm font-bold text-heart-600 dark:border-heart-800 dark:bg-heart-950">
        <AlertTriangle className="w-5 h-5 inline-block mr-2" /> Invalid or missing reset token. Please request a new reset link.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      {state?.error && (
        <div className="rounded-xl border-2 border-heart-200 bg-heart-50 p-3 text-sm font-bold text-heart-600 dark:border-heart-800 dark:bg-heart-950">
          <AlertTriangle className="w-5 h-5 inline-block mr-2" /> {state.error}
        </div>
      )}

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-bold text-ink-700 dark:text-ink-200">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="At least 6 characters"
          className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-sm font-semibold focus:border-brand-500 focus:outline-none dark:border-ink-600 dark:bg-ink-800 dark:text-white"
        />
      </div>
      <SubmitButton />
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="card-fun border-2 border-ink-200 dark:border-ink-700">
      <h1 className="mb-1 text-2xl font-black text-ink-900 dark:text-white">Reset password</h1>
      <p className="mb-6 text-sm font-semibold text-ink-500">
        Enter your new password below.
      </p>

      <Suspense fallback={<div className="text-ink-400 text-sm text-center py-4">Loading…</div>}>
        <ResetForm />
      </Suspense>

      <p className="mt-4 text-center text-sm text-ink-400">
        <a href="/login" className="font-bold text-brand-600 hover:underline">
          Back to login
        </a>
      </p>
    </div>
  );
}
