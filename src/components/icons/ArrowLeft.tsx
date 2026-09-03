import { iconAttrs, type IconProps } from "./base";

export function ArrowLeft({ size, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M20 12H5" />
      <path d="M11 18l-6-6 6-6" />
    </svg>
  );
}
