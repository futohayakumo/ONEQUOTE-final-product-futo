import { FlowExplorer } from "@/components/flow/FlowExplorer";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageTitle } from "@/components/ui/PageTitle";
import { ScreenShell } from "@/components/ui/ScreenShell";

export const metadata = { title: "System Flow Explorer" };

export default function EngineeringJourneyPage() {
  return (
    <ScreenShell backHref="/journeys">
      <div className="flex flex-col gap-6">
        <Eyebrow>Engineering</Eyebrow>
        <PageTitle className="max-w-[22ch]">System Flow Explorer</PageTitle>
        <p className="type-body max-w-[58ch]">
          Follow a request through the platform, from intake to fulfilment,
          across every system and service it touches.
        </p>
      </div>

      <div className="mt-12">
        <FlowExplorer />
      </div>
    </ScreenShell>
  );
}
