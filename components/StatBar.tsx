// Ten-segment bar, like a tuning screen. The text label stays in one element so it reads as "Scenery: 9/10".
export function StatBar({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  return (
    <div className="space-y-1">
      <div className="font-mono text-xs tracking-[0.15em] text-mist uppercase">
        {label}: {value}/{max}
      </div>
      <div className="flex gap-[3px]" aria-hidden>
        {Array.from({ length: max }, (_, i) => (
          <span
            key={i}
            className={`h-2 flex-1 -skew-x-[20deg] ${
              i < value ? "bg-linear-to-r from-neon to-violet shadow-[0_0_6px_var(--color-neon)]" : "bg-line/70"
            }`}
            style={i < value ? { opacity: 0.55 + (0.45 * (i + 1)) / max } : undefined}
          />
        ))}
      </div>
    </div>
  );
}
