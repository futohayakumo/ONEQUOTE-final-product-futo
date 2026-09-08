import { QuizRunner } from "@/components/quiz/QuizRunner";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageTitle } from "@/components/ui/PageTitle";
import { ScreenShell } from "@/components/ui/ScreenShell";

export const metadata = { title: "Knowledge Check" };

export default function QuizPage() {
  return (
    <ScreenShell backHref="/process">
      <div className="flex flex-col gap-6">
        <Eyebrow>Process quiz</Eyebrow>
        <PageTitle>Knowledge Check</PageTitle>
      </div>

      <div className="mt-10">
        <QuizRunner />
      </div>
    </ScreenShell>
  );
}
