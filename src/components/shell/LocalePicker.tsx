"use client";

import { LOCALES, LOCALE_LABEL } from "@/lib/i18n";
import { useLocale } from "./LocaleProvider";

/**
 * A native <select>. A custom dropdown here would cost a listbox, a roving
 * tabindex and a focus trap to arrive back where the platform already is, and
 * on a phone it would lose the system picker.
 */
export function LocalePicker({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  return (
    <label className={className}>
      <span className="sr-only">Language</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
        className="border border-control bg-studio px-3 py-1.5 type-caption text-charcoal rounded-card"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {LOCALE_LABEL[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
