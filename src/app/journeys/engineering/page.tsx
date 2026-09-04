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
        {/*
          Say what level of abstraction this is. Calling it a C4 model outright
          would overclaim — the four columns are delivery stages, not C4's
          Context/Container/Component/Code levels — but the boxes in stages 02
          to 04 are containers in the C4 sense, and stage 01 holds the external
          actors. Naming that is more useful than either claiming or hiding it.
        */}
        <p className="type-caption max-w-[58ch]">
          Roughly a container-level view: stage 01 holds the external actors
          and channels, and everything to its right is a separately deployable
          unit. Component-level detail lives in each deep dive rather than on
          the map, so the map stays readable.
        </p>
      </div>

      <div className="mt-12">
        <FlowExplorer />
      </div>
    </ScreenShell>
  );
}
