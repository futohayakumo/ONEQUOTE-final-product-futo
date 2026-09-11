import { DocumentLocale } from "@/components/providers/DocumentLocale";
import { t } from "@/lib/i18n";
import { ExpertiseBand } from "@/components/organisms/home/ExpertiseBand";
import { Hero } from "@/components/organisms/home/Hero";
import { JourneyStrip } from "@/components/organisms/home/JourneyStrip";
import { NetworkBand } from "@/components/organisms/home/NetworkBand";
import { PerspectiveCards } from "@/components/organisms/home/PerspectiveCards";
import { PlatformBand } from "@/components/organisms/home/PlatformBand";

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
    </main>
  );
}
