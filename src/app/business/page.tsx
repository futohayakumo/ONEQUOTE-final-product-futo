import { QuotationCockpit } from "@/components/quote/QuotationCockpit";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageTitle } from "@/components/ui/PageTitle";
import { ScreenShell } from "@/components/ui/ScreenShell";

export const metadata = { title: "Quotation Simulator" };

export default function BusinessJourneyPage() {
  return (
    <ScreenShell backHref="/">
      <div className="flex flex-col gap-6">
        <Eyebrow>Business</Eyebrow>
        <PageTitle className="max-w-[20ch]">Quotation Simulator</PageTitle>
        <p className="type-body max-w-[54ch]">
          Simulate a shipping quotation in a few steps, then inspect the
          back-end transaction it would produce.
        </p>
      </div>

      <div className="mt-12">
        <QuotationCockpit />
      </div>
    </ScreenShell>
  );
}
