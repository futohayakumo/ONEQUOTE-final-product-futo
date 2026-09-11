import { DocumentLocale } from "@/components/providers/DocumentLocale";
import { t } from "@/lib/i18n";
import { QuizRunner } from "@/components/organisms/quiz/QuizRunner";
import { PageHeader } from "@/components/molecules/PageHeader";
import { QuizBackLink } from "@/components/molecules/QuizBackLink";

export const metadata = { title: `${t("meta.quiz")} — ${t("meta.site")}` };

export default function QuizPage() {
  return (
    <main className="mx-auto flex max-w-[86rem] flex-col gap-12 px-6 py-16">
      <DocumentLocale titleKey="meta.quiz" />
      <QuizBackLink />

      <PageHeader
        eyebrowKey="quiz.eyebrow"
        titleKey="quiz.title"
        ledeKey="quiz.lede"
      />

      <div className="max-w-[54rem]">
        <QuizRunner />
      </div>
    </main>
  );
}
