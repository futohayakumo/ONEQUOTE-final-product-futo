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
        eyebrow="Engineering"
        title="See the system behind every shipment."
        lede="Trace one quotation request as it moves through the services, from the customer's input to the response that comes back."
        note={
          <>
            Modular services
            <br />
            for a more
            <br />
            connected world
          </>
        }
      />
      <EngineeringScreen />
      <PlatformNote />
    </main>
  );
}
