import { DocumentLocale } from "@/components/shell/DocumentLocale";
import { t } from "@/lib/i18n";
import { JourneyTrack } from "@/components/engineering/JourneyTrack";
import { TechnicalDetail } from "@/components/engineering/TechnicalDetail";
import { WhySplit } from "@/components/engineering/WhySplit";

export const metadata = { title: `${t("meta.engineering")} — ${t("meta.site")}` };

/**
 * Story first, diagram after.
 *
 * The journey is full-bleed because it pins and slides; the other two bands
 * carry their own container. No shared padded <main>, or the pinned viewport
 * would be narrower than the window it is pinned to.
 */
export default function EngineeringPage() {
  return (
    <main className="flex flex-col">
      <DocumentLocale titleKey="meta.engineering" />
      <JourneyTrack />
      <WhySplit />
      <TechnicalDetail />
    </main>
  );
}
