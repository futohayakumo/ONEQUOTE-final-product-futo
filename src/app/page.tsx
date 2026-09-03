import { CoreConceptPanel } from "@/components/hero/CoreConceptPanel";
import { VocabularyStrip } from "@/components/hero/VocabularyStrip";
import { BlueprintMark } from "@/components/icons/BlueprintMark";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { LinkButton } from "@/components/ui/LinkButton";
import { PageTitle } from "@/components/ui/PageTitle";

export default function HomePage() {
  return (
    <main className="relative flex min-h-svh flex-col justify-center overflow-hidden px-6 py-16 md:px-12">
      {/* Decorative only. Sits behind the content and never carries meaning. */}
      <BlueprintMark className="pointer-events-none absolute right-[-6rem] top-[-6rem] hidden h-[30rem] w-[30rem] opacity-45 xl:block" />

      <div className="relative mx-auto grid w-full max-w-[1400px] items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20">
        <div className="flex flex-col gap-8">
          <Eyebrow>Overview</Eyebrow>

          <PageTitle display className="max-w-[16ch]">
            Integrated Portfolio for Enterprise Delivery
          </PageTitle>

          <p className="type-body max-w-[52ch]">
            Unify business understanding, system architecture, and delivery
            workflows in a single portfolio that connects strategy to execution,
            end to end.
          </p>

          <div>
            <LinkButton href="/journeys" variant="primary">
              Enter Portfolio
            </LinkButton>
          </div>

          <VocabularyStrip />
        </div>

        <CoreConceptPanel />
      </div>
    </main>
  );
}
