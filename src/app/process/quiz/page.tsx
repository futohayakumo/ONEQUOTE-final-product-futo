import Link from "next/link";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { ArrowLeft } from "@/components/icons/ArrowLeft";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Knowledge check" };

export default function QuizPage() {
  return (
    <main className="mx-auto flex max-w-[86rem] flex-col gap-12 px-6 py-16">
      <Link
        href="/process"
        className="inline-flex w-fit items-center gap-2.5 type-label text-muted transition-colors duration-150 hover:text-charcoal"
      >
        <ArrowLeft size={16} />
        Back to process
      </Link>

      <PageHeader
        eyebrow="Process quiz"
        title={
          <>
            Knowledge <span className="text-crimson-ink">check</span>.
          </>
        }
        lede="Five questions on the rules the delivery model actually runs on. Each one explains why the rule exists, not just what it is."
        note={
          <>
            A quick check
            <br />
            on the rules
            <br />
            that bind
          </>
        }
      />

      <div className="max-w-[54rem]">
        <QuizRunner />
      </div>
    </main>
  );
}
