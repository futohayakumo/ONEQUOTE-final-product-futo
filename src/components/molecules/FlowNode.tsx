"use client";

import cn from "clsx";
import { useCallback } from "react";
import { NODES } from "@/lib/flow-data";
import type { NodeId } from "@/types/flow";
import { useT } from "../providers/LocaleProvider";
import { ChevronRight } from "../atoms/icons/ChevronRight";
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
} from "../atoms/icons/flow";

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

/**
 * A real button. The previous version was an inert div, and the only way to
 * inspect anything was a separate scrolling bar — which is exactly what people
 * could not find.
 *
 * The hop badge and the deep-dive chevron are absolutely positioned inside a
 * permanently reserved gutter, so selecting a node changes COLOUR ONLY. If
 * selection changed the box height, the ResizeObserver that measures these
 * rects would fire, re-render, and make the connectors flicker.
 */
export function FlowNode({
  id,
  selected,
  hopIndex,
  focused,
  register,
  onSelect,
  onPeek,
  onPeekEnd,
}: {
  id: NodeId;
  selected: boolean;
  hopIndex: number | null;
  focused: boolean;
  register: (id: NodeId, el: HTMLElement | null) => void;
  onSelect: (id: NodeId) => void;
  onPeek: (id: NodeId) => void;
  onPeekEnd: () => void;
}) {
  const t = useT();
  const node = NODES[id];
  const Icon = ICON[id];
  const onRoute = hopIndex !== null;

  const ref = useCallback(
    (el: HTMLButtonElement | null) => register(id, el),
    [id, register],
  );

  return (
    <button
      ref={ref}
      type="button"
      data-node={id}
      aria-pressed={selected}
      tabIndex={focused ? 0 : -1}
      onClick={() => onSelect(id)}
      onMouseEnter={() => onPeek(id)}
      onMouseLeave={onPeekEnd}
      onFocus={() => onPeek(id)}
      onBlur={onPeekEnd}
      className={cn(
        "relative z-10 flex w-full items-center gap-3 py-3.5 pl-9 pr-7 text-left rounded-card transition-colors duration-150",
        selected
          ? "border-2 border-crimson bg-tint shadow-raised"
          : onRoute
            ? "border-2 border-crimson bg-studio shadow-card"
            : "border border-control bg-studio shadow-card hover:border-crimson",
      )}
    >
      {/* Reserved gutter — always present, so geometry never changes. */}
      <span className="absolute left-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center">
        {onRoute ? (
          <span
            aria-hidden
            className="flex h-5 w-5 items-center justify-center bg-crimson type-console text-studio tnum"
            /* A hop number is a mark, not a container — outside the 4px rule. */
            style={{ borderRadius: 9999 }}
          >
            {hopIndex + 1}
          </span>
        ) : null}
      </span>

      <span className={onRoute ? "text-crimson" : "text-muted"}>
        <Icon size={20} />
      </span>
      <span className="type-label">{node.label}</span>

      {node.componentId ? (
        <span
          aria-hidden
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted"
          title={t("flow.node.deepDive")}
        >
          <ChevronRight size={14} />
        </span>
      ) : null}
    </button>
  );
}
