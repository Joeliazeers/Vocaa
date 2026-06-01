"use client";

import { Sparkles, PartyPopper, Hand, AlertTriangle, Rocket, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { CountrySelect } from "@/components/CountrySelect";
import type { ActionState } from "./actions";

function SubmitButton({ label }: { label: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full py-3.5 text-base" disabled={pending}>
      {pending ? <><span className="mr-2">Please wait…</span><Sparkles className="w-4 h-4 inline-block" /></> : label}
    </button>
  );
}

export function AuthForm({
  mode,
  action,
}: {
  mode: "login" | "register";
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useFormState(action, undefined);
  const isRegister = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <h2 className="text-center text-xl font-black text-ink-800 dark:text-white">
        {isRegister ? <><span className="mr-2">Create your account</span><PartyPopper className="w-6 h-6 inline-block text-brand-500" /></> : <><span className="mr-2">Welcome back!</span><Hand className="w-6 h-6 inline-block text-brand-500" /></>}
      </h2>
      <p className="text-center text-sm font-semibold text-ink-400">
        {isRegister ? "Start your language learning journey" : "Continue your learning streak"}
      </p>

      {isRegister && (
        <>
          <div>
            <label className="label" htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              className="input"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="label" htmlFor="country">Country</label>
            <CountrySelect required />
          </div>
        </>
      )}
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          className="input"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            className="input pr-10"
            placeholder="••••••••"
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isRegister && (
        <div>
          <label className="label" htmlFor="confirmPassword">Confirm Password</label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              className="input pr-10"
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 focus:outline-none"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}

      {state?.error && (
        <div className="rounded-xl border-2 border-heart-200 bg-heart-50 px-4 py-3 text-sm font-bold text-heart-600 dark:border-heart-800 dark:bg-heart-950 dark:text-heart-400">
          <AlertTriangle className="w-5 h-5 inline-block mr-2" /> {state.error}
        </div>
      )}

      <SubmitButton label={isRegister ? <><span className="mr-2">Create account</span><Rocket className="w-5 h-5 inline-block" /></> : "Log in"} />

      {!isRegister && (
        <p className="text-center text-xs font-semibold text-ink-400">
          <Link href="/forgot-password" className="text-brand-600 hover:underline">
            Forgot your password?
          </Link>
        </p>
      )}

      <p className="text-center text-sm font-semibold text-ink-500">
        {isRegister ? (
          <>Already have an account?{" "}
            <Link href="/login" className="font-bold text-brand-600 hover:text-brand-700">Log in</Link>
          </>
        ) : (
          <>New to Vocaa?{" "}
            <Link href="/register" className="font-bold text-brand-600 hover:text-brand-700">Create one</Link>
          </>
        )}
      </p>
    </form>
  );
}
