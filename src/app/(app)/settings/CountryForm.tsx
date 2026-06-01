"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateCountryAction } from "./actions";

const COUNTRIES = [
  "Indonesia", "Malaysia", "Singapore", "Philippines", "Thailand",
  "Vietnam", "Japan", "South Korea", "China", "Taiwan",
  "India", "United States", "United Kingdom", "Australia", "Canada",
  "Germany", "France", "Netherlands", "Brazil", "Other",
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary px-5" disabled={pending}>
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

export function CountryForm({ current }: { current: string }) {
  const [, action] = useFormState(updateCountryAction, undefined);

  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="country" className="label">Select your country</label>
        <select
          id="country"
          name="country"
          defaultValue={current}
          className="input"
        >
          <option value="">- Not set -</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <SubmitButton />
    </form>
  );
}
