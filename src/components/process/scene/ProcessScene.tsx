"use client";

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
import { SceneRoot } from "./SceneRoot";
import { WorkItemRuntime, type WorkItem } from "./useWorkItems";

// Module-scope scratch — never allocate per pointer event.
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();

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
      reducedMotion = "auto",
      quality = "auto",
      className,
      ariaLabel,
    },
    ref,
  ) {
    const runtime = useRef(new WorkItemRuntime()).current;
    const wrapper = useRef<HTMLDivElement>(null);
    const glRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const camRef = useRef<THREE.Camera | null>(null);
    const invalidateRef = useRef<() => void>(() => {});
    const [hovered, setHovered] = useState<StepId | null>(null);
    const [items, setItems] = useState<WorkItem[]>([]);
    const [reduced, setReduced] = useState(reducedMotion === "force");

    // Callbacks are written onto the runtime rather than closed over, so
    // identity churn in the parent never rebuilds it.
    useEffect(() => {
      runtime.handlers = {
        onItemProgress,
        onItemComplete,
        onItemsChanged: setItems,
      };
    }, [runtime, onItemProgress, onItemComplete]);

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

    const hitTest = useCallback(
      (point: { x: number; y: number }): StepId | null => {
        const el = wrapper.current;
        const scene = sceneRef.current;
        const cam = camRef.current;
        if (!el || !scene || !cam) return null;

        const rect = el.getBoundingClientRect();
        ndc.set(
          ((point.x - rect.left) / rect.width) * 2 - 1,
          -(((point.y - rect.top) / rect.height) * 2 - 1),
        );
        raycaster.setFromCamera(ndc, cam);
        const hits = raycaster.intersectObjects(scene.children, true);
        for (const h of hits) {
          const name = h.object.name;
          if (name.startsWith("droppad:")) {
            return name.slice("droppad:".length) as StepId;
          }
        }
        return null;
      },
      [],
    );

    const dropItem = useCallback(
      (sp: StoryPoint, clientPoint?: { x: number; y: number }) => {
        // Traditional: the step you pick genuinely changes the cycle time, so
        // we raycast. AI-driven: a drop anywhere enters the belt, because
        // demanding precision there would contradict the whole claim.
        const step =
          mode === "traditional" && clientPoint
            ? (hitTest(clientPoint) ?? "intake")
            : "intake";
        const id = runtime.spawn(sp, step);
        invalidateRef.current();
        return id;
      },
      [hitTest, mode, runtime],
    );

    useImperativeHandle(
      ref,
      () => ({
        dropItem,
        hitTest,
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
      [dropItem, hitTest, onDropTargetChange, runtime],
    );

    return (
      <div
        ref={wrapper}
        className={className ?? "h-full w-full"}
        role="img"
        aria-label={ariaLabel}
      >
        <Canvas
          /*
           * `flat` is non-negotiable. R3F defaults to ACESFilmic tone mapping,
           * which shifts #E1127A toward salmon and lifts #0F172A — the palette
           * would break silently. `linear` is equally wrong in the other
           * direction, so neither is left to chance.
           */
          flat
          shadows="soft"
          dpr={[1, quality === "low" ? 1 : 1.75]}
          frameloop="demand"
          resize={{ scroll: false }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
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
            quality={quality === "low" ? "low" : "high"}
            hoveredStep={hovered}
            onModeSettled={onModeSettled}
            onReady={onReady}
          />
        </Canvas>
      </div>
    );
  },
);

export default ProcessScene;
