"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/actions/auth";

type Field = { name: string; label: string; type: string; autoComplete?: string };

export function AuthForm({
  action,
  fields,
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  fields: Field[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      {fields.map((field) => (
        <div key={field.name}>
          <label className="flex flex-col gap-1.5">
            {field.label}
            <input
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              defaultValue={state.values?.[field.name]}
              required
            />
          </label>
          {state.errors?.[field.name] && <span role="alert" className="error">{state.errors[field.name]}</span>}
        </div>
      ))}
      {state.errors?.form && <p role="alert" className="error">{state.errors.form}</p>}
      <button type="submit" disabled={pending} className="btn w-full">
        {submitLabel}
      </button>
    </form>
  );
}
