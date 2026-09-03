import { iconAttrs, type IconProps } from "../base";

export function PeopleGearIcon({ size = 48, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <circle cx="8" cy="6" r="2.6" />
      <circle cx="16" cy="6" r="2.6" />
      <path d="M2.5 18a5.5 5.5 0 0 1 5.5-5.5M21.5 18a5.5 5.5 0 0 0-5.5-5.5" />
      <circle cx="12" cy="16.5" r="2.4" />
      <path d="M12 12.4v1.3M12 19.3v1.3M8.4 14.4l1.1.7M14.5 18.4l1.1.7M8.4 18.6l1.1-.7M14.5 14.6l1.1-.7" />
    </svg>
  );
}
