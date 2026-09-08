import { DocumentLocale } from "@/components/shell/DocumentLocale";
import { t } from "@/lib/i18n";
import { Hero } from "@/components/home/Hero";
import { JourneyStrip } from "@/components/home/JourneyStrip";
import { NetworkBand } from "@/components/home/NetworkBand";
import { PerspectiveCards } from "@/components/home/PerspectiveCards";
import { SystemsBand } from "@/components/home/SystemsBand";

export const metadata = { title: `${t("meta.home")} — ${t("meta.site")}` };

export default function HomePage() {
  return (
    <main>
      <DocumentLocale titleKey="meta.home" />
      <Hero />
      <JourneyStrip />
      <NetworkBand />
      <SystemsBand />
      <PerspectiveCards />
    </main>
  );
}
