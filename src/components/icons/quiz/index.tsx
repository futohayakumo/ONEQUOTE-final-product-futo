import { iconAttrs, type IconProps } from "../base";

export function LightbulbIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M12 2.5a6 6 0 0 1 3.6 10.8V16h-7.2v-2.7A6 6 0 0 1 12 2.5z" />
      <path d="M9.4 18.5h5.2M10.4 21h3.2" />
    </svg>
  );
}

export function CheckIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} strokeWidth={2} {...rest}>
      <path d="M4 12.4l5 5L20 6.5" />
    </svg>
  );
}

export function CrossIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} strokeWidth={2} {...rest}>
      <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
    </svg>
  );
}
