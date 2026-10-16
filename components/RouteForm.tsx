"use client";

import { useActionState } from "react";
import type { RouteFormState } from "@/app/actions/routes";
import { WaypointEditor } from "./WaypointEditor";

type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select";
  hint?: string;
  wide?: boolean;
};

const FIELDS: Field[] = [
  { name: "title", label: "Title", wide: true },
  { name: "path", label: "Waypoints", hint: "Or type one \"lat, lng\" per line, at least 2", wide: true },
  { name: "startName", label: "Start" },
  { name: "endName", label: "End" },
  { name: "region", label: "Region" },
  { name: "difficulty", label: "Difficulty", type: "select" },
  { name: "distanceKm", label: "Distance (km)", type: "number" },
  { name: "durationMin", label: "Duration (minutes)", type: "number" },
  { name: "scenery", label: "Scenery (1–10)", type: "number" },
  { name: "roadQuality", label: "Road quality (1–10)", type: "number" },
  { name: "bestFor", label: "Best for", hint: "Comma separated, e.g. coupes, mountain views" },
  { name: "bestTime", label: "Best time" },
  { name: "description", label: "Description", type: "textarea", wide: true },
  { name: "notes", label: "Notes", type: "textarea", wide: true },
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
    <form action={formAction} className="panel grid gap-5 p-6 sm:grid-cols-2">
      {FIELDS.map((field) => {
        const common = { id: field.name, name: field.name, defaultValue: values[field.name] ?? "" };
        return (
          <div key={field.name} className={`flex flex-col gap-1.5 ${field.wide ? "sm:col-span-2" : ""}`}>
            <label htmlFor={field.name}>{field.label}</label>
            {field.name === "path" ? (
              <WaypointEditor id={common.id} name={common.name} defaultValue={common.defaultValue} />
            ) : field.type === "textarea" ? (
              <textarea {...common} rows={3} />
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
            {field.hint && <small className="font-mono text-[0.7rem] text-mist/70">{field.hint}</small>}
            {state.errors?.[field.name] && (
              <span role="alert" className="error">
                {state.errors[field.name]}
              </span>
            )}
          </div>
        );
      })}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="btn">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
