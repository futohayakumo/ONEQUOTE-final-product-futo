import { iconAttrs, type IconProps } from "./base";

export function ChevronRight({ size, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
