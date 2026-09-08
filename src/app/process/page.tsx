import { DocumentLocale } from "@/components/shell/DocumentLocale";
import { t } from "@/lib/i18n";
import { ProcessScreen } from "@/components/process/v3/ProcessScreen";

export const metadata = { title: `${t("meta.process")} — ${t("meta.site")}` };

export default function ProcessPage() {
  return (
    <main>
      <DocumentLocale titleKey="meta.process" />
      <ProcessScreen />
    </main>
  );
}
