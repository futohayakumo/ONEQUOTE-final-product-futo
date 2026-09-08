"use client";

import { buildLog } from "@/lib/trace";
import type { NodeId } from "@/types/flow";

/**
 * Terminal Green measures 1.75:1 on white, so it lives on a charcoal panel and
 * nowhere else — and even here it marks the closing line only. Colouring every
 * detail column green makes the one line that matters, the one carrying the
 * status, indistinguishable from fourteen that do not.
 */
export function RequestLog({ route }: { route: readonly NodeId[] }) {
  const lines = buildLog(route);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="type-label">Request log</h3>
        <span className="type-caption tnum">{lines.length} lines</span>
      </div>

      <div className="overflow-x-auto bg-console p-5 rounded-card">
        <table className="w-full type-console">
          <caption className="sr-only">
            Request log for the highlighted route
          </caption>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i}>
                <td className="pr-5 align-top whitespace-nowrap text-muted tnum">
                  {line.at}
                </td>
                <td className="pr-5 align-top text-border">{line.level}</td>
                <td className="pr-5 align-top text-studio">{line.message}</td>
                <td
                  className={`align-top whitespace-nowrap tnum ${
                    i === lines.length - 1 ? "text-terminal" : "text-border"
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
