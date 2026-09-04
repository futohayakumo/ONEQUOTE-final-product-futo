"use client";

import { useMemo, useState } from "react";
import {
  CONTAINERS,
  CONTAINER_ORDER,
  LOYALTY_TIERS,
  PORTS,
  PORT_ORDER,
  TIER_ORDER,
  calculateQuote,
  validateQuote,
} from "@/lib/pricing";
import { buildTransactionLog } from "@/lib/simulate-log";
import type { QuoteErrors, QuoteInput, QuoteResult } from "@/types/quote";
import {
  ContainerIcon,
  ShipIcon,
  CubeOutlineIcon,
  UserIcon,
} from "../icons/flow";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { NumberField } from "../ui/NumberField";
import { Panel } from "../ui/Panel";
import { Select } from "../ui/Select";
import { SectionTitle } from "../ui/SectionTitle";
import { StepCallout } from "../ui/StepCallout";
import { QuoteConsole } from "./QuoteConsole";
import { QuoteEmptyState } from "./QuoteEmptyState";
import { QuoteSummary } from "./QuoteSummary";

const EMPTY: QuoteInput = {
  pol: "",
  pod: "",
  cbm: "",
  containerType: "",
  tier: "",
};

export function QuotationCockpit() {
  const [input, setInput] = useState<QuoteInput>(EMPTY);
  const [errors, setErrors] = useState<QuoteErrors>({});
  const [result, setResult] = useState<QuoteResult | null>(null);
  // Captured once, inside the submit handler — never during render.
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);

  const log = useMemo(
    () =>
      result && submittedAt ? buildTransactionLog(result, submittedAt) : [],
    [result, submittedAt],
  );

  const set = <K extends keyof QuoteInput>(k: K, v: QuoteInput[K]) => {
    setInput((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validateQuote(input);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setResult(null);
      return;
    }
    // Safe: validateQuote guarantees every field is populated.
    const quote = calculateQuote({
      pol: input.pol as Exclude<QuoteInput["pol"], "">,
      pod: input.pod as Exclude<QuoteInput["pod"], "">,
      cbm: Number(input.cbm),
      containerType: input.containerType as Exclude<
        QuoteInput["containerType"],
        ""
      >,
      tier: input.tier as Exclude<QuoteInput["tier"], "">,
    });
    setSubmittedAt(Date.now());
    setResult(quote);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] xl:gap-14"
    >
      {/*
        Three separate cards, each paired with its callout in the SAME grid row.
        The callouts align by construction, so no pixel measurement is needed —
        and the three cards map 1:1 onto the three numbered steps.
      */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,17.5rem)] lg:items-start">
        <Panel className="flex flex-col gap-5">
          <SectionTitle as="h3">Route</SectionTitle>

          <Field label="Port of Loading" htmlFor="pol" error={errors.pol}>
            <Select
              id="pol"
              value={input.pol}
              invalid={Boolean(errors.pol)}
              leading={<ShipIcon size={18} />}
              onChange={(e) => set("pol", e.target.value as QuoteInput["pol"])}
            >
              <option value="">Select port of loading</option>
              {PORT_ORDER.map((code) => (
                <option key={code} value={code}>
                  {PORTS[code].city} ({code})
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Port of Discharge" htmlFor="pod" error={errors.pod}>
            <Select
              id="pod"
              value={input.pod}
              invalid={Boolean(errors.pod)}
              leading={<ShipIcon size={18} />}
              onChange={(e) => set("pod", e.target.value as QuoteInput["pod"])}
            >
              <option value="">Select port of discharge</option>
              {PORT_ORDER.map((code) => (
                <option key={code} value={code}>
                  {PORTS[code].city} ({code})
                </option>
              ))}
            </Select>
          </Field>
        </Panel>

        <StepCallout step={1} title="Choose your route">
          Select the port of loading and port of discharge. Lane rates are
          symmetric, so direction does not change the base rate.
        </StepCallout>

        <Panel className="flex flex-col gap-5">
          <SectionTitle as="h3">Cargo</SectionTitle>

          <Field
            label="Cargo Volume"
            htmlFor="cbm"
            error={errors.cbm}
            help="Between 1 and 2000 cubic metres."
          >
            <NumberField
              id="cbm"
              unit="CBM"
              min={1}
              max={2000}
              step="any"
              placeholder="Enter volume"
              invalid={Boolean(errors.cbm)}
              leading={<CubeOutlineIcon size={18} />}
              value={input.cbm}
              onChange={(e) =>
                set("cbm", e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </Field>

          <Field
            label="Container Type"
            htmlFor="container"
            error={errors.containerType}
          >
            <Select
              id="container"
              value={input.containerType}
              invalid={Boolean(errors.containerType)}
              leading={<ContainerIcon size={18} />}
              onChange={(e) =>
                set(
                  "containerType",
                  e.target.value as QuoteInput["containerType"],
                )
              }
            >
              <option value="">Select container type</option>
              {CONTAINER_ORDER.map((code) => (
                <option key={code} value={code}>
                  {CONTAINERS[code].label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Loyalty Tier" htmlFor="tier" error={errors.tier}>
            <Select
              id="tier"
              value={input.tier}
              invalid={Boolean(errors.tier)}
              leading={<UserIcon size={18} />}
              onChange={(e) =>
                set("tier", e.target.value as QuoteInput["tier"])
              }
            >
              <option value="">Select loyalty tier</option>
              {TIER_ORDER.map((code) => (
                <option key={code} value={code}>
                  {LOYALTY_TIERS[code].label}
                </option>
              ))}
            </Select>
          </Field>
        </Panel>

        <StepCallout step={2} title="Set cargo details">
          Volume decides how many container units are required. Type sets the
          rate multiplier, and the tier sets the discount applied to subtotal.
        </StepCallout>

        <Panel className="flex flex-col gap-4">
          <SectionTitle as="h3">Generate</SectionTitle>
          <p className="type-caption">
            Runs the pricing model and replays the transaction between the Core
            Quotation Module and the Legacy ERP Engine.
          </p>
          <Button type="submit" variant="primary" withArrow className="w-full">
            Generate Quote &amp; Simulate Call
          </Button>
        </Panel>

        <StepCallout step={3} title="Generate your quote">
          Identical inputs always produce an identical quote reference and an
          identical trace, so any figure on screen can be reproduced.
        </StepCallout>
      </div>

      <div className="flex flex-col gap-6">
        {result && submittedAt ? (
          <>
            <QuoteSummary quote={result} />
            <QuoteConsole lines={log} />
          </>
        ) : (
          <QuoteEmptyState />
        )}
      </div>
    </form>
  );
}
