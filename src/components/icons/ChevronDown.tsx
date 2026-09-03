import { iconAttrs, type IconProps } from "./base";

export function ChevronDown({ size, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
