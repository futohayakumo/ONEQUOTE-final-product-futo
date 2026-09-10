import { DocumentLocale } from "@/components/shell/DocumentLocale";
import { t } from "@/lib/i18n";
import { EngineeringScreen } from "@/components/engineering/EngineeringScreen";
import { PlatformNote } from "@/components/flow/PlatformNote";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: `${t("meta.engineering")} — ${t("meta.site")}` };

export default function EngineeringPage() {
  return (
    <main className="mx-auto flex max-w-[86rem] flex-col gap-14 px-6 py-16">
      <DocumentLocale titleKey="meta.engineering" />
      <PageHeader
        eyebrowKey="eng.eyebrow"
        titleKey="eng.title"
        ledeKey="eng.lede"
      />
      <EngineeringScreen />
      <PlatformNote />
    </main>
  );
}
