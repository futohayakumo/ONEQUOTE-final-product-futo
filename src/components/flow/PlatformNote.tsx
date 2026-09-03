import { PLATFORM_NOTE } from "@/lib/component-catalog";
import { CodeBlock } from "../ui/CodeBlock";
import { SectionTitle } from "../ui/SectionTitle";

export function PlatformNote() {
  return (
    <div className="grid gap-6 border border-border bg-studio p-6 rounded-sharp lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col gap-3">
        <SectionTitle as="h3">{PLATFORM_NOTE.title}</SectionTitle>
        <p className="type-caption text-charcoal">{PLATFORM_NOTE.body}</p>
      </div>
      <CodeBlock lang={PLATFORM_NOTE.code.lang} code={PLATFORM_NOTE.code.code} />
    </div>
  );
}
