import { DocumentLocale } from "@/components/shell/DocumentLocale";
import { t } from "@/lib/i18n";
import { BusinessCta } from "@/components/business/BusinessCta";
import { QuotationScreen } from "@/components/business/QuotationScreen";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: `${t("meta.business")} — ${t("meta.site")}` };

export default function BusinessPage() {
  return (
    <main>
      <DocumentLocale titleKey="meta.business" />
      <div className="mx-auto flex max-w-[86rem] flex-col gap-14 px-6 py-16">
        <PageHeader
          eyebrowKey="business.eyebrow"
          titleKey="business.title"
          ledeKey="business.lede"
          noteKey="business.note"
        />
        <QuotationScreen />
      </div>

      <BusinessCta />
    </main>
  );
}
