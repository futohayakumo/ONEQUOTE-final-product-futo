export type PersonaId = "business" | "engineering" | "process";

export interface Persona {
  id: PersonaId;
  no: string;
  title: string;
  href: string;
  blurb: string;
  /** Panel background — the three panels step through the neutral tokens. */
  surface: string;
}

export const PERSONAS: readonly Persona[] = [
  {
    id: "business",
    no: "01",
    title: "BUSINESS",
    href: "/business",
    blurb:
      "Quoting logic, lane pricing, and how TEU volume turns into tiered rewards.",
    surface: "bg-studio",
  },
  {
    id: "engineering",
    no: "02",
    title: "ENGINEERING",
    href: "/engineering",
    blurb:
      "Service boundaries, request routing, and the trade-offs behind each layer.",
    surface: "bg-tint",
  },
  {
    id: "process",
    no: "03",
    title: "PROCESS",
    href: "/process",
    blurb:
      "Two delivery models compared, then a knowledge check on the team's rules.",
    surface: "bg-canvas",
  },
] as const;
