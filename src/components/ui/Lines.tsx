import { Fragment } from "react";

/**
 * Renders a translated string that carries its own line breaks.
 *
 * Headings on this site break where the writer wants them to, and where that
 * is depends on the language — "From a quote / to a moving world." does not
 * break in the same place in Japanese. So the break lives in the bundle as a
 * newline and is turned into a <br /> here, rather than being hard-coded in
 * the component where a translator cannot reach it.
 */
export function Lines({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 ? <br /> : null}
          {line}
        </Fragment>
      ))}
    </>
  );
}
