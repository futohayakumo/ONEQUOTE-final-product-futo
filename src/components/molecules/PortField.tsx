"use client";

import { COUNTRY_ORDER, defaultPortIn, portByCode, portsIn } from "@/lib/ports";
import { Flag } from "../atoms/Flag";
import { useT } from "../providers/LocaleProvider";

/**
 * A port, chosen in two steps: the country, then the port in it.
 *
 * Six hundred and ten ports do not fit one list, and a reader who knows
 * they ship from Japan should not scroll past the Netherlands to find
 * Yokohama. Two native selects: keyboard, screen reader and phone all
 * already know how to use them, and the country select is seven long.
 */
export function PortField({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  /** A UN/LOCODE, or "" while nothing is chosen. */
  value: string;
  onChange: (code: string) => void;
  className: string;
}) {
  const t = useT();
  const country = value ? value.slice(0, 2) : "";
  const ports = country ? portsIn(country) : [];

  return (
    <div className="flex flex-col gap-2">
      <span className="type-caption">{label}</span>
      <div className="grid grid-cols-[minmax(0,12rem)_minmax(0,1fr)] gap-2">
        <span className="relative">
          {country ? (
            <Flag
              country={country}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
            />
          ) : null}
          <select
            aria-label={t("port.country")}
            className={`${className} pl-11`}
            value={country}
            onChange={(e) => {
              // Changing the country lands on its main port, so the field is
              // never half-filled and the price never goes blank.
              const first = defaultPortIn(e.target.value);
              onChange(first ? first.code : "");
            }}
          >
            {COUNTRY_ORDER.map((c) => (
              <option key={c} value={c}>
                {t(`country.${c}`)}
              </option>
            ))}
          </select>
        </span>
        <select
          aria-label={t("port.port")}
          className={className}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {ports.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name} ({p.code.slice(2)})
            </option>
          ))}
        </select>
      </div>
      {value && !portByCode(value) ? (
        <span className="type-caption text-crimson">{t("quote.error.unknownPort")}</span>
      ) : null}
    </div>
  );
}
