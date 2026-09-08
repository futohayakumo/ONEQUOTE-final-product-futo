"use client";

import { useT } from "../shell/LocaleProvider";

export function BusinessCta() {
  const t = useT();
  return (
    <section className="relative isolate mt-8 overflow-hidden bg-charcoal">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/banners/07-terminal-yard.png"
        alt=""
        aria-hidden
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div aria-hidden className="absolute inset-0 -z-10 scrim-l" />
      <div className="mx-auto max-w-[86rem] px-6 py-20">
        <h2 className="max-w-[20ch] type-page text-studio">
          {t("business.cta.title")}
        </h2>
        <p className="mt-4 max-w-[46ch] type-body text-border">
          {t("business.cta.body")}
        </p>
      </div>
    </section>
  );
}
