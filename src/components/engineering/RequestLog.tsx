"use client";

import type { Trace } from "@/lib/trace";
import { useT } from "../shell/LocaleProvider";

/**
 * Terminal Green measures 1.75:1 on white, so it lives on a charcoal panel and
 * nowhere else — and even here it marks the closing line only. Colouring every
 * detail column green makes the one line that matters, the one carrying the
 * status, indistinguishable from the dozen that do not.
 */
export function RequestLog({ trace }: { trace: Trace }) {
  const t = useT();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="type-label">{t("eng.log.title")}</h3>
        <span className="type-caption tnum">
          {t("eng.log.lines", { count: trace.log.length })}
        </span>
      </div>

      <p className="max-w-[86ch] type-caption">{t("eng.log.lede")}</p>

      {/* tabIndex 0 + a role, or the 40% of this log that overflows on a
          phone is reachable by pointer only. */}
      <div
        tabIndex={0}
        role="region"
        aria-label={t("eng.log.aria")}
        className="overflow-x-auto bg-console p-5 rounded-card"
      >
        <table className="w-full type-console">
          <caption className="sr-only">
            {t("eng.log.title")}
          </caption>
          <tbody>
            {trace.log.map((line, i) => (
              <tr key={i}>
                <td className="pr-5 align-top whitespace-nowrap text-border tnum">
                  {line.at}
                </td>
                <td className="pr-5 align-top text-border">INFO</td>
                <td className="pr-5 align-top text-studio">{line.message}</td>
                <td
                  className={`align-top whitespace-nowrap tnum ${
                    line.final ? "text-terminal" : "text-border"
                  }`}
                >
                  {line.detail ?? ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
