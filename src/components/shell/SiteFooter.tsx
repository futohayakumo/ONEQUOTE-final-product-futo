import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { Wordmark } from "../ui/Wordmark";

const LINKS = [
  { href: "/business", label: "Business" },
  { href: "/engineering", label: "Engineering" },
  { href: "/process", label: "Process" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-studio">
      <div className="mx-auto flex max-w-[86rem] flex-wrap items-center gap-x-8 gap-y-4 px-6 py-8">
        <Wordmark size="sm" />
        <span className="type-caption">{BRAND.tagline}</span>
        <ul className="ml-auto flex items-center gap-7">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="type-caption transition-colors duration-150 hover:text-crimson"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
