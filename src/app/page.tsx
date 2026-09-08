import { Hero } from "@/components/home/Hero";
import { JourneyStrip } from "@/components/home/JourneyStrip";
import { NetworkBand } from "@/components/home/NetworkBand";
import { PerspectiveCards } from "@/components/home/PerspectiveCards";
import { SystemsBand } from "@/components/home/SystemsBand";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <JourneyStrip />
      <NetworkBand />
      <SystemsBand />
      <PerspectiveCards />
    </main>
  );
}
