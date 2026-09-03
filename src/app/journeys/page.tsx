import { PersonaGateway } from "@/components/gateway/PersonaGateway";
import { BackBar } from "@/components/ui/BackBar";

export default function JourneysPage() {
  return (
    <main className="relative min-h-svh">
      <div className="absolute left-6 top-6 z-10 md:left-12 md:top-8">
        <BackBar href="/" />
      </div>
      <PersonaGateway />
    </main>
  );
}
