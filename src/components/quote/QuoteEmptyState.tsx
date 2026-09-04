export function QuoteEmptyState() {
  return (
    <div className="flex min-h-[30rem] flex-col items-center justify-center gap-4 border border-border bg-studio px-10 py-16 text-center rounded-sharp">
      <p className="type-section">Your quote appears here</p>
      <p className="type-caption max-w-[42ch]">
        Adjust parameters on the left and trigger simulation to inspect
        transaction sequence.
      </p>
    </div>
  );
}
