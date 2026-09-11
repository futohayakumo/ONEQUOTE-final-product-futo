"use client";

import Link from "next/link";
import { ArrowLeft } from "../atoms/icons/ArrowLeft";
import { useT } from "../providers/LocaleProvider";

export function QuizBackLink() {
  const t = useT();
  return (
    <Link
      href="/process"
      className="inline-flex w-fit items-center gap-2.5 type-label text-muted transition-colors duration-150 hover:text-charcoal"
    >
      <ArrowLeft size={16} />
      {t("quiz.back")}
    </Link>
  );
}
