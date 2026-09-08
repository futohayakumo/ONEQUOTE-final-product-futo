import { QuotationScreen } from "@/components/business/QuotationScreen";
import { PageHeader } from "@/components/ui/PageHeader";
import { Plate } from "@/components/ui/Plate";

export const metadata = { title: "Business — quotation simulator" };

export default function BusinessPage() {
  return (
    <main>
      <div className="mx-auto flex max-w-[86rem] flex-col gap-14 px-6 py-16">
        <PageHeader
          eyebrow="Business"
          title="Quotation simulator."
          lede="Pick a lane, a box and a volume, then read what the pricing engine actually charges for it — and where every line of the invoice comes from."
          note={
            <>
              Same lane
              <br />
              Same rules
              <br />
              Every time
            </>
          }
        />
        <QuotationScreen />
      </div>

      <section className="relative isolate mt-8 overflow-hidden bg-charcoal">
        <div className="absolute inset-0 -z-20">
          <Plate
            label="Terminal yard — supervisor among container stacks"
            spec="2400 × 560 · no wordmark on the vest"
            tone="dark"
            className="h-full w-full"
          />
        </div>
        <div aria-hidden className="absolute inset-0 -z-10 scrim-l" />
        <div className="mx-auto max-w-[86rem] px-6 py-20">
          <h2 className="max-w-[20ch] type-page text-studio">
            Real shipments. Real consequences.
          </h2>
          <p className="mt-4 max-w-[46ch] type-body text-border">
            Every quotation commits a slot, a rate and a date. The arithmetic
            above is the part a customer sees; the rest of this portfolio is
            what has to be true for it to hold.
          </p>
        </div>
      </section>
    </main>
  );
}
