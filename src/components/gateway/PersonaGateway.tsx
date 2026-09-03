import { PERSONAS } from "@/lib/personas";
import { ChartUpIcon } from "../icons/persona/ChartUpIcon";
import { CubesIcon } from "../icons/persona/CubesIcon";
import { PeopleGearIcon } from "../icons/persona/PeopleGearIcon";
import { PersonaPanel } from "./PersonaPanel";

const ICON = {
  business: <ChartUpIcon size={52} />,
  engineering: <CubesIcon size={52} />,
  process: <PeopleGearIcon size={52} />,
} as const;

export function PersonaGateway() {
  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      {PERSONAS.map((p) => (
        <PersonaPanel key={p.id} persona={p} icon={ICON[p.id]} />
      ))}
    </div>
  );
}
