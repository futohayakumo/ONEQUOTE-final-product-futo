import { iconAttrs, type IconProps } from "./base";

export function ArrowRight({ size, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}
