"use client";

import { CheckCircle2, AlertTriangle } from "lucide-react";

import { useFormState, useFormStatus } from "react-dom";
import { forgotPasswordAction, type ForgotState } from "../password-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full py-3" disabled={pending}>
      {pending ? "Sending…" : "Send reset link"}
    </button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState<ForgotState, FormData>(forgotPasswordAction, undefined);

  return (
    <div className="card-fun border-2 border-ink-200 dark:border-ink-700">
      <h1 className="mb-1 text-2xl font-black text-ink-900 dark:text-white">Forgot password?</h1>
      <p className="mb-6 text-sm font-semibold text-ink-500">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {state?.success ? (
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4 text-center text-sm font-bold text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
          <CheckCircle2 className="w-5 h-5 inline-block mr-2" /> {state.success}
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="rounded-xl border-2 border-heart-200 bg-heart-50 p-3 text-sm font-bold text-heart-600 dark:border-heart-800 dark:bg-heart-950">
              <AlertTriangle className="w-5 h-5 inline-block mr-2" /> {state.error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-bold text-ink-700 dark:text-ink-200">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-sm font-semibold focus:border-brand-500 focus:outline-none dark:border-ink-600 dark:bg-ink-800 dark:text-white"
            />
          </div>
          <SubmitButton />
        </form>
      )}

      <p className="mt-4 text-center text-sm text-ink-400">
        Remember your password?{" "}
        <a href="/login" className="font-bold text-brand-600 hover:underline">
          Log in
        </a>
      </p>
    </div>
  );
}
