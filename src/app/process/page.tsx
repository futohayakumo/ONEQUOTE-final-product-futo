import { ProcessComparison } from "@/components/process/ProcessComparison";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageTitle } from "@/components/ui/PageTitle";
import { ScreenShell } from "@/components/ui/ScreenShell";

export const metadata = { title: "Process Comparison" };

export default function ProcessJourneyPage() {
  return (
    <ScreenShell backHref="/">
      <div className="flex flex-col gap-6">
        <Eyebrow>Process comparison</Eyebrow>
        <PageTitle className="max-w-[24ch]">
          Two ways to deliver. Very different outcomes.
        </PageTitle>
        <p className="type-body max-w-[58ch]">
          Drag a story point box onto the floor to watch the same piece of work
          move through each delivery approach.
        </p>
      </div>

      <div className="mt-12">
        <ProcessComparison />
      </div>
    </ScreenShell>
  );
}
