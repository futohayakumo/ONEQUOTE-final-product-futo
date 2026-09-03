import { iconAttrs, type IconProps } from "../base";

/** Three isometric cubes — the "composed of services" mark. */
export function CubesIcon({ size = 48, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M12 2l4 2.3v4.6L12 11.2 8 8.9V4.3z" />
      <path d="M7 12l4 2.3v4.6L7 21.2 3 18.9v-4.6z" />
      <path d="M17 12l4 2.3v4.6L17 21.2l-4-2.3v-4.6z" />
    </svg>
  );
}
