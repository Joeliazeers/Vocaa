"use client";

import { Check } from "lucide-react";

import { useFormState, useFormStatus } from "react-dom";
import { updateUsername } from "./actions";

function SaveButton() {
  const { pending } = useFormStatus();
  return <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Save"}</button>;
}

export function UsernameForm({ current }: { current: string }) {
  const [state, action] = useFormState(updateUsername, undefined as any);
  return (
    <form action={action} className="flex items-end gap-3">
      <div className="flex-1">
        <label className="label" htmlFor="username">Username</label>
        <input id="username" name="username" defaultValue={current} className="input" />
      </div>
      <SaveButton />
      {state?.ok && <span className="pb-2.5 text-sm text-green-600">Saved <Check className="w-4 h-4 inline-block ml-1" /></span>}
      {state?.error && <span className="pb-2.5 text-sm text-red-600">{state.error}</span>}
    </form>
  );
}
