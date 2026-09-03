const TERMS = [
  "Global Liner Alliance",
  "Core Quotation Module",
  "Legacy ERP Engine",
  "Volume Loyalty Framework",
  "Agile Delivery Protocol",
];

/**
 * Every proper noun in this portfolio is a virtual name. No client, vessel,
 * vendor or internal project code appears anywhere in the app.
 */
export function VocabularyStrip() {
  return (
    <div className="flex flex-col gap-3 border-t border-border pt-6">
      <p className="type-caption">
        All domain names below are abstracted. No real organisation, system or
        person is identified anywhere in this portfolio.
      </p>
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {TERMS.map((t) => (
          <li key={t} className="type-caption text-charcoal">
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
