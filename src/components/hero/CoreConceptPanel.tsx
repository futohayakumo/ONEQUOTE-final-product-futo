import { Panel } from "../ui/Panel";
import { SectionTitle } from "../ui/SectionTitle";

export function CoreConceptPanel() {
  return (
    <Panel className="flex flex-col gap-4">
      <SectionTitle>Built with an AI-Driven Development Lifecycle</SectionTitle>
      <p className="type-body">
        This hub was not hand-assembled screen by screen. A human architect
        defined the standards first — a locked colour set, a fixed type scale, a
        single legal corner radius, and a naming policy that admits no real
        client data. AI then acted as the compiler against those standards.
      </p>
      <p className="type-body">
        The constraint is what makes the speed possible. Because every rule was
        decided before any code existed, generation had one correct answer to
        aim at instead of a thousand plausible ones. What normally takes weeks
        of design review and refactoring arrived, production-ready, in hours.
      </p>
      <p className="type-caption">
        The architect stays responsible for judgement: what to build, what to
        refuse, and where the model is confidently wrong.
      </p>
    </Panel>
  );
}
