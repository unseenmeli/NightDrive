"use client";

import { useActionState } from "react";
import type { RouteFormState } from "@/app/actions/routes";

type Field = { name: string; label: string; type?: "text" | "number" | "textarea" | "select"; hint?: string };

const FIELDS: Field[] = [
  { name: "title", label: "Title" },
  { name: "startName", label: "Start" },
  { name: "endName", label: "End" },
  { name: "region", label: "Region" },
  { name: "distanceKm", label: "Distance (km)", type: "number" },
  { name: "durationMin", label: "Duration (minutes)", type: "number" },
  { name: "scenery", label: "Scenery (1–10)", type: "number" },
  { name: "roadQuality", label: "Road quality (1–10)", type: "number" },
  { name: "difficulty", label: "Difficulty", type: "select" },
  { name: "bestFor", label: "Best for", hint: "Comma separated, e.g. coupes, mountain views" },
  { name: "bestTime", label: "Best time" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
  { name: "path", label: "Waypoints", type: "textarea", hint: "One \"lat, lng\" per line, at least 2" },
];

export function RouteForm({
  action,
  initialValues = {},
  submitLabel,
}: {
  action: (prev: RouteFormState, formData: FormData) => Promise<RouteFormState>;
  initialValues?: Record<string, string>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, { values: initialValues });
  const values = state.values ?? {};

  return (
    <form action={formAction}>
      {FIELDS.map((field) => {
        const common = { id: field.name, name: field.name, defaultValue: values[field.name] ?? "" };
        return (
          <p key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
            {field.hint && <small> ({field.hint})</small>}
            <br />
            {field.type === "textarea" ? (
              <textarea {...common} rows={field.name === "path" ? 6 : 3} cols={50} />
            ) : field.type === "select" ? (
              <select {...common}>
                <option value="">Choose…</option>
                <option value="easy">easy</option>
                <option value="moderate">moderate</option>
                <option value="challenging">challenging</option>
              </select>
            ) : (
              <input {...common} type={field.type ?? "text"} />
            )}
            {state.errors?.[field.name] && (
              <>
                <br />
                <span role="alert" className="error">
                  {state.errors[field.name]}
                </span>
              </>
            )}
          </p>
        );
      })}
      <button type="submit" disabled={pending}>
        {submitLabel}
      </button>
    </form>
  );
}
