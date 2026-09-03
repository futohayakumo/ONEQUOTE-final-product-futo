import { BlueprintMark } from "../icons/BlueprintMark";

export function QuoteEmptyState() {
  return (
    <div className="relative flex min-h-[30rem] flex-col items-center justify-center gap-4 overflow-hidden border border-border bg-studio px-10 py-16 text-center rounded-sharp">
      <BlueprintMark className="pointer-events-none absolute h-[15rem] w-[15rem] opacity-25" />
      <p className="relative type-section">Your quote appears here</p>
      <p className="relative type-caption max-w-[42ch]">
        Adjust parameters on the left and trigger simulation to inspect
        transaction sequence.
      </p>
    </div>
  );
}
