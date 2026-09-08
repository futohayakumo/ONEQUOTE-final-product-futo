import { EngineeringScreen } from "@/components/engineering/EngineeringScreen";
import { PlatformNote } from "@/components/flow/PlatformNote";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = {
  title: "Engineering — the system behind every shipment",
};

export default function EngineeringPage() {
  return (
    <main className="mx-auto flex max-w-[86rem] flex-col gap-14 px-6 py-16">
      <PageHeader
        eyebrowKey="eng.eyebrow"
        titleKey="eng.title"
        ledeKey="eng.lede"
        noteKey="eng.note"
      />
      <EngineeringScreen />
      <PlatformNote />
    </main>
  );
}
