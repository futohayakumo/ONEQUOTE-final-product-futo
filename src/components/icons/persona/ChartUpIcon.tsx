import { iconAttrs, type IconProps } from "../base";

export function ChartUpIcon({ size = 48, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M3 20h5v-6H3zM10 20h5V9h-5zM17 20h4V4h-4z" />
      <path d="M3 20h18" />
    </svg>
  );
}
