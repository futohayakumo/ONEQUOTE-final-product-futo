import { DocumentLocale } from "@/components/shell/DocumentLocale";
import { t } from "@/lib/i18n";
import { ExpertiseBand } from "@/components/home/ExpertiseBand";
import { Hero } from "@/components/home/Hero";
import { JourneyStrip } from "@/components/home/JourneyStrip";
import { NetworkBand } from "@/components/home/NetworkBand";
import { PerspectiveCards } from "@/components/home/PerspectiveCards";
import { PlatformBand } from "@/components/home/PlatformBand";
import { WordmarkBand } from "@/components/home/WordmarkBand";

export const metadata = { title: `${t("meta.home")} — ${t("meta.site")}` };

export default function HomePage() {
  return (
    <main>
      <DocumentLocale titleKey="meta.home" />
      <Hero />
      <ExpertiseBand />
      <JourneyStrip />
      <NetworkBand />
      <PlatformBand />
      <PerspectiveCards />
      <WordmarkBand />
    </main>
  );
}
