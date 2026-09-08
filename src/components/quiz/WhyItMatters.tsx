import { LightbulbIcon } from "../icons/quiz";

/** Shown identically whether the answer was right or wrong. The explanation
 *  is the point of the exercise, not a consolation prize. */
export function WhyItMatters({ children }: { children: string }) {
  return (
    <div className="animate-panel-enter flex gap-4 border border-border bg-tint p-6 rounded-card">
      <span className="mt-0.5 shrink-0 text-crimson-ink">
        <LightbulbIcon size={24} />
      </span>
      <div className="flex flex-col gap-1.5">
        <p className="type-label text-crimson-ink">Why it matters</p>
        <p className="type-body">{children}</p>
      </div>
    </div>
  );
}
