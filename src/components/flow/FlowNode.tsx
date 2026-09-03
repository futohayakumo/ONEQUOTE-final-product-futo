"use client";

import cn from "clsx";
import { useCallback } from "react";
import { NODES } from "@/lib/flow-data";
import type { NodeId } from "@/types/flow";
import {
  BarsIcon,
  BellIcon,
  BoxIcon,
  ChatIcon,
  CheckCircleIcon,
  ClipboardIcon,
  DatabaseIcon,
  FlagIcon,
  GlobeIcon,
  LanguageIcon,
  MailIcon,
  MegaphoneIcon,
  RouteIcon,
  ServerIcon,
  WindowIcon,
} from "../icons/flow";

const ICON: Record<NodeId, React.ComponentType<{ size?: number }>> = {
  "new-request": ChatIcon,
  email: MailIcon,
  "api-integration": GlobeIcon,
  "request-intake": WindowIcon,
  validation: CheckCircleIcon,
  "request-tracker": ClipboardIcon,
  "routing-gateway": RouteIcon,
  "quotation-service": BoxIcon,
  "campaign-service": MegaphoneIcon,
  "notification-service": BellIcon,
  "feature-flags": FlagIcon,
  "translation-api": LanguageIcon,
  "erp-system": ServerIcon,
  "data-platform": DatabaseIcon,
  analytics: BarsIcon,
};

export function FlowNode({
  id,
  active,
  onPath,
  register,
}: {
  id: NodeId;
  active: boolean;
  onPath: boolean;
  register: (id: NodeId, el: HTMLElement | null) => void;
}) {
  const Icon = ICON[id];
  const ref = useCallback(
    (el: HTMLDivElement | null) => register(id, el),
    [id, register],
  );

  return (
    <div
      ref={ref}
      className={cn(
        "relative z-10 flex items-center gap-3 px-3 py-3 rounded-sharp transition-colors duration-150",
        active
          ? "border-2 border-crimson bg-tint"
          : onPath
            ? "border border-crimson bg-studio"
            : "border border-border bg-studio",
      )}
    >
      <span className={active || onPath ? "text-crimson" : "text-muted"}>
        <Icon size={20} />
      </span>
      <span className="type-caption text-charcoal">{NODES[id].label}</span>
    </div>
  );
}
