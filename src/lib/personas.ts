export type PersonaId = "business" | "engineering" | "process";

export interface Persona {
  id: PersonaId;
  no: string;
  title: string;
  href: string;
  blurbKey: string;
  /** Panel background — the three panels step through the neutral tokens. */
  surface: string;
}

export const PERSONAS: readonly Persona[] = [
  {
    id: "business",
    no: "01",
    title: "BUSINESS",
    href: "/business",
    blurbKey: "persona.business.blurb",
    surface: "bg-studio",
  },
  {
    id: "engineering",
    no: "02",
    title: "ENGINEERING",
    href: "/engineering",
    blurbKey: "persona.engineering.blurb",
    surface: "bg-tint",
  },
  {
    id: "process",
    no: "03",
    title: "PROCESS",
    href: "/process",
    blurbKey: "persona.process.blurb",
    surface: "bg-canvas",
  },
] as const;
