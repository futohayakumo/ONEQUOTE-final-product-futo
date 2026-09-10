"use client";

import cn from "clsx";
import { Canvas } from "@react-three/fiber";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import type {
  ProcessSceneHandle,
  ProcessSceneProps,
  StepId,
  StoryPoint,
} from "@/types/process-scene";
import { useT } from "../../shell/LocaleProvider";
import { SceneRoot } from "./SceneRoot";
import { WorkItemRuntime, type WorkItem } from "./useWorkItems";

/**
 * The chunk boundary. three.js is imported here and in this directory only;
 * an ESLint restricted-import zone enforces that the other five screens never
 * pay for the renderer.
 */
const ProcessScene = forwardRef<ProcessSceneHandle, ProcessSceneProps>(
  function ProcessScene(
    {
      mode,
      onItemProgress,
      onItemComplete,
      onDropTargetChange,
      onModeSettled,
      onReady,
      onUnavailable,
      onAnchors,
      onBacklogChanged,
      reducedMotion = "auto",
      quality = "auto",
      className,
      ariaLabel,
    },
    ref,
  ) {
    const t = useT();
    const runtime = useRef(new WorkItemRuntime()).current;
    const wrapper = useRef<HTMLDivElement>(null);
    const glRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const camRef = useRef<THREE.Camera | null>(null);
    const invalidateRef = useRef<() => void>(() => {});
    const [, setHovered] = useState<StepId | null>(null);
    const [items, setItems] = useState<WorkItem[]>([]);
    const [box, setBox] = useState<{ w: number; h: number } | null>(null);
    // The canvas is transparent until it paints, so the placeholder has to
    // survive past mount — not just until the element exists.
    const [painted, setPainted] = useState(false);
    const [reduced, setReduced] = useState(reducedMotion === "force");

    // Callbacks are written onto the runtime rather than closed over, so
    // identity churn in the parent never rebuilds it.
    useEffect(() => {
      runtime.handlers = {
        onItemProgress,
        onItemComplete,
        onItemsChanged: setItems,
        onBacklogChanged,
      };
    }, [runtime, onItemProgress, onItemComplete, onBacklogChanged]);

    useEffect(() => {
      if (reducedMotion !== "auto") {
        setReduced(reducedMotion === "force");
        return;
      }
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReduced(mq.matches);
      const onChange = () => setReduced(mq.matches);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }, [reducedMotion]);

    /**
     * Drop targets are DOM elements positioned from the projected station
     * anchors, so the caller already knows which step was hit. Raycasting into
     * the canvas is gone — it was the source of the misaligned drop positions.
     */
    const dropItem = useCallback(
      (sp: StoryPoint, step?: StepId) => {
        const id = runtime.spawn(sp, step);
        invalidateRef.current();
        return id;
      },
      [runtime],
    );

    useImperativeHandle(
      ref,
      () => ({
        dropItem,
        setHoveredStep: (step) => {
          runtime.hoveredStep = step;
          setHovered(step);
          onDropTargetChange?.(step);
          invalidateRef.current();
        },
        cancelItem: (id) => {
          runtime.cancel(id);
          invalidateRef.current();
        },
        reset: () => {
          runtime.reset();
          invalidateRef.current();
        },
        captureFrame: () => {
          const gl = glRef.current;
          const scene = sceneRef.current;
          const cam = camRef.current;
          if (!gl || !scene || !cam) return "";
          gl.render(scene, cam);
          return gl.domElement.toDataURL("image/png");
        },
      }),
      [dropItem, onDropTargetChange, runtime],
    );

    /**
     * R3F measures its parent once, at mount. This component is lazily
     * imported INTO a subtree that is mid route-transition, so that first
     * measurement can land before layout settles — leaving the canvas stuck at
     * its 300x150 default and the scene invisible.
     *
     * Rather than nudge it afterwards, the canvas is simply not mounted until
     * the wrapper has a real measured size. ResizeObserver reports the current
     * box immediately on observe, so this costs one extra render and removes
     * the race entirely.
     */
    // rAF is suspended while the tab is hidden, but performance.now() keeps
    // running — so time away was charged to the run. Pausing the runtime's
    // clock means you come back to where you left off.
    useEffect(() => {
      const onVisibility = () => {
        if (document.visibilityState === "visible") runtime.resume();
        else runtime.pause();
      };
      document.addEventListener("visibilitychange", onVisibility);
      return () =>
        document.removeEventListener("visibilitychange", onVisibility);
    }, [runtime]);

    useEffect(() => {
      const el = wrapper.current;
      if (!el) return;
      const ro = new ResizeObserver(([entry]) => {
        const r = entry.contentRect;
        if (r.width > 0 && r.height > 0) {
          setBox({ w: Math.round(r.width), h: Math.round(r.height) });
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    return (
      <div
        ref={wrapper}
        className={cn("relative h-full w-full", className)}
        role="img"
        aria-label={ariaLabel}
      >
        {painted ? null : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="type-caption">{t("sim.loading")}</span>
          </div>
        )}
        {box ? (
          <Canvas
            /*
             * `flat` is non-negotiable. R3F defaults to ACESFilmic tone mapping,
             * which shifts #B01838 toward salmon and lifts #0F172A — the palette
             * would break silently. `linear` is equally wrong in the other
             * direction, so neither is left to chance.
             */
            flat
            /*
             * "percentage" maps to PCFShadowMap. Both "soft" AND the bare boolean
             * map to PCFSoftShadowMap, which three deprecated: it warns (not
             * warnOnce) and resets the field each time, and R3F re-applies it on
             * every Canvas render — so either spelling produces a steady stream
             * of console noise for a shadow type that gets downgraded anyway.
             * Naming the type we actually get is the honest version.
             */
            shadows="percentage"
            dpr={[1, quality === "low" ? 1 : 1.75]}
            /*
             * The scene is never static: workers keep their hands moving, the
             * gantries sweep, and the camera eases. "demand" starved every one
             * of those — and worse, the camera fit lives in useFrame, so a
             * scheduled frame is what applies it. Reduced motion is genuinely
             * static, so it keeps the on-demand loop.
             */
            frameloop={reduced ? "demand" : "always"}
            resize={{ scroll: false }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
            }}
            onCreated={({ gl, scene, camera, invalidate }) => {
              gl.toneMapping = THREE.NoToneMapping;
              gl.outputColorSpace = THREE.SRGBColorSpace;
              glRef.current = gl;
              sceneRef.current = scene;
              camRef.current = camera;
              invalidateRef.current = invalidate;
              gl.domElement.addEventListener("webglcontextlost", (e) => {
                e.preventDefault();
                onUnavailable?.("context-lost");
              });
            }}
          >
            <SceneRoot
              runtime={runtime}
              items={items}
              mode={mode}
              reduced={reduced}
              onAnchors={onAnchors}
              onModeSettled={onModeSettled}
              onReady={() => {
                setPainted(true);
                onReady?.();
              }}
            />
          </Canvas>
        ) : null}
      </div>
    );
  },
);

export default ProcessScene;
