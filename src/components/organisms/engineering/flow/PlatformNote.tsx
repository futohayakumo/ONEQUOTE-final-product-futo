"use client";

import { PLATFORM_NOTE } from "@/lib/component-catalog";
import { useT } from "../../../providers/LocaleProvider";
import { CodeBlock } from "../../../atoms/CodeBlock";
import { SectionTitle } from "../../../atoms/SectionTitle";

export function PlatformNote() {
  const t = useT();
  return (
    <div className="grid min-w-0 items-start gap-8 overflow-hidden border border-border bg-studio p-6 rounded-card shadow-card lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-3">
        <SectionTitle as="h3">{t(PLATFORM_NOTE.titleKey)}</SectionTitle>
        <p className="type-caption text-charcoal">{t(PLATFORM_NOTE.bodyKey)}</p>
      </div>
      <CodeBlock
        lang={PLATFORM_NOTE.code.lang}
        code={PLATFORM_NOTE.code.code}
      />
    </div>
  );
}
