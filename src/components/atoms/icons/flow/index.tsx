import { iconAttrs, type IconProps } from "../base";

export function ChatIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M3 5h18v11H8l-5 4z" />
      <path d="M8 10.5h.01M12 10.5h.01M16 10.5h.01" />
    </svg>
  );
}

export function MailIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M2.5 5h19v14h-19z" />
      <path d="M2.5 5l9.5 7 9.5-7" />
    </svg>
  );
}

export function GlobeIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.6 2.4 4 5.5 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.5-4-9s1.4-6.6 4-9z" />
    </svg>
  );
}

export function WindowIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M3 4h18v16H3z" />
      <path d="M3 9h18" />
      <path d="M6 6.5h.01M9 6.5h.01" />
    </svg>
  );
}

export function CheckCircleIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.2l2.6 2.6L16 9.4" />
    </svg>
  );
}

export function ClipboardIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M5 4h14v17H5z" />
      <path d="M9 2.5h6V6H9z" />
      <path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" />
    </svg>
  );
}

/** Routing gateway — one line in, branching out. */
export function RouteIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M2.5 12h6" />
      <path d="M8.5 12c4 0 4-6 8-6h4M8.5 12c4 0 4 6 8 6h4" />
      <path d="M18.5 3.5l3 2.5-3 2.5M18.5 15.5l3 2.5-3 2.5" />
    </svg>
  );
}

export function BoxIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M12 2.5l8.5 4.6v9.8L12 21.5l-8.5-4.6V7.1z" />
      <path d="M3.5 7.1L12 11.8l8.5-4.7M12 11.8v9.7" />
    </svg>
  );
}

export function MegaphoneIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M3 9.5h4l9-5v15l-9-5H3z" />
      <path d="M19 9v6" />
      <path d="M7 14.5V19h3.5" />
    </svg>
  );
}

export function BellIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M6 10a6 6 0 1 1 12 0v5l2 3H4l2-3z" />
      <path d="M10 21h4" />
    </svg>
  );
}

export function ServerIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M3 4h18v6H3zM3 14h18v6H3z" />
      <path d="M6.5 7h.01M6.5 17h.01" />
    </svg>
  );
}

export function DatabaseIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z" />
      <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
      <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </svg>
  );
}

export function BarsIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M4 20h16" />
      <path d="M6.5 20v-7M11.5 20V6M16.5 20v-10" />
    </svg>
  );
}

export function FlagIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M5 21V3" />
      <path d="M5 4h13l-2.5 4L18 12H5z" />
    </svg>
  );
}

export function LanguageIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M3 5h9M7.5 3v2" />
      <path d="M10.5 5c0 4-3 7.5-7.5 9" />
      <path d="M5.5 10.5c1.7 2.2 3.7 3.6 6 4.5" />
      <path d="M12.5 21l4-11 4 11M14 17.5h5" />
    </svg>
  );
}

export function GridIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
    </svg>
  );
}

export function ShipIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M3 17l1.8-5.5h14.4L21 17" />
      <path d="M6.5 11.5V7h11v4.5" />
      <path d="M12 7V4" />
      <path d="M2.5 20c1.6 0 1.6-1.2 3.2-1.2S7.3 20 8.9 20s1.6-1.2 3.1-1.2S13.6 20 15.2 20s1.6-1.2 3.2-1.2S20 20 21.5 20" />
    </svg>
  );
}

export function ContainerIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M3 6h18v13H3z" />
      <path d="M7 6v13M11 6v13M15 6v13M19 6v13" />
    </svg>
  );
}

export function UserIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

export function CubeOutlineIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...iconAttrs(size)} {...rest}>
      <path d="M12 3l7.5 4.2v9.6L12 21l-7.5-4.2V7.2z" />
    </svg>
  );
}
