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
    <form action={formAction}>
      {fields.map((field) => (
        <p key={field.name}>
          <label>
            {field.label}
            <br />
            <input
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              defaultValue={state.values?.[field.name]}
              required
            />
          </label>
          {state.errors?.[field.name] && <br />}
          {state.errors?.[field.name] && <span role="alert" className="error">{state.errors[field.name]}</span>}
        </p>
      ))}
      {state.errors?.form && <p role="alert" className="error">{state.errors.form}</p>}
      <button type="submit" disabled={pending}>
        {submitLabel}
      </button>
    </form>
  );
}
