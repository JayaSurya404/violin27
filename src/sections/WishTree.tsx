"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Flower2, Grip, Sparkle } from "lucide-react";
import { createPortal } from "react-dom";
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SectionHeading } from "@/src/components/SectionHeading";
import { playChime } from "@/src/lib/audio";
import type { TreeWish, WishTreeCopy } from "@/src/types/site";

type WishTreeProps = {
  copy: WishTreeCopy;
  wishes: readonly TreeWish[];
  onPlace: (id: string) => void;
};

type Point = {
  x: number;
  y: number;
};

type BranchLayout = {
  id: string;
  path: string;
  twigs: readonly string[];
  anchor: readonly [number, number];
  flowers: readonly (readonly [number, number])[];
};

type LeafLayout = {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  branch: number;
  order: number;
};

type DragVisual = {
  wish: TreeWish;
  point: Point;
};

type PointerSession = {
  wish: TreeWish;
  pointerId: number;
  pointerType: string;
  element: HTMLButtonElement;
  start: Point;
  current: Point;
  source: Point;
  active: boolean;
};

const WISH_DRAG_EVENT = "purple-aurora:wish-drag";

const BRANCH_LAYOUT: readonly BranchLayout[] = [
  {
    id: "lower-left",
    path: "M49 63 C43 61 38 56 32 52 C25 47 18 47 11 49",
    twigs: [
      "M31 52 C27 55 23 58 18 59",
      "M24 48 C21 44 18 42 14 41",
    ],
    anchor: [12, 49],
    flowers: [
      [20, 47],
      [31, 53],
    ],
  },
  {
    id: "lower-right",
    path: "M52 61 C58 59 63 53 69 49 C76 45 83 45 90 48",
    twigs: [
      "M69 49 C74 52 78 55 83 57",
      "M78 45 C81 41 84 39 88 39",
    ],
    anchor: [89, 48],
    flowers: [
      [69, 50],
      [81, 45],
    ],
  },
  {
    id: "middle-left",
    path: "M50 51 C46 46 43 40 38 35 C33 30 27 27 20 27",
    twigs: [
      "M38 35 C34 37 30 40 26 42",
      "M29 29 C27 25 24 22 21 20",
    ],
    anchor: [20, 27],
    flowers: [
      [28, 30],
      [38, 37],
    ],
  },
  {
    id: "middle-right",
    path: "M52 49 C57 44 60 38 65 33 C71 27 78 24 85 25",
    twigs: [
      "M65 33 C70 35 75 38 79 41",
      "M76 26 C79 22 82 20 86 18",
    ],
    anchor: [85, 25],
    flowers: [
      [66, 32],
      [78, 25],
    ],
  },
  {
    id: "upper-left",
    path: "M51 40 C48 34 46 28 42 23 C39 18 35 14 30 12",
    twigs: [
      "M42 23 C38 24 34 25 30 28",
      "M37 17 C36 13 34 10 31 8",
    ],
    anchor: [30, 12],
    flowers: [
      [39, 20],
      [32, 13],
    ],
  },
  {
    id: "upper-right",
    path: "M51 38 C55 33 57 26 60 21 C63 15 67 11 72 8",
    twigs: [
      "M60 21 C64 23 68 25 72 28",
      "M65 14 C66 10 68 7 71 5",
    ],
    anchor: [72, 8],
    flowers: [
      [59, 21],
      [68, 11],
    ],
  },
] as const;

const LEAF_LAYOUT: readonly LeafLayout[] = [
  { x: 39, y: 58, rotation: -18, scale: 0.78, branch: 0, order: 0 },
  { x: 33, y: 53, rotation: 61, scale: 0.84, branch: 0, order: 1 },
  { x: 27, y: 49, rotation: 18, scale: 0.94, branch: 0, order: 2 },
  { x: 20, y: 47, rotation: 48, scale: 0.88, branch: 0, order: 3 },
  { x: 12, y: 50, rotation: -28, scale: 0.76, branch: 0, order: 4 },
  { x: 61, y: 57, rotation: 38, scale: 0.8, branch: 1, order: 0 },
  { x: 68, y: 52, rotation: -54, scale: 0.9, branch: 1, order: 1 },
  { x: 75, y: 48, rotation: 24, scale: 0.96, branch: 1, order: 2 },
  { x: 82, y: 45, rotation: -34, scale: 0.84, branch: 1, order: 3 },
  { x: 89, y: 49, rotation: 31, scale: 0.74, branch: 1, order: 4 },
  { x: 43, y: 45, rotation: -51, scale: 0.82, branch: 2, order: 0 },
  { x: 37, y: 37, rotation: 13, scale: 0.9, branch: 2, order: 1 },
  { x: 29, y: 31, rotation: 54, scale: 0.88, branch: 2, order: 2 },
  { x: 20, y: 27, rotation: -46, scale: 0.74, branch: 2, order: 3 },
  { x: 58, y: 43, rotation: 42, scale: 0.86, branch: 3, order: 0 },
  { x: 65, y: 34, rotation: -19, scale: 0.94, branch: 3, order: 1 },
  { x: 75, y: 28, rotation: 57, scale: 0.84, branch: 3, order: 2 },
  { x: 85, y: 25, rotation: -55, scale: 0.72, branch: 3, order: 3 },
  { x: 49, y: 36, rotation: -62, scale: 0.8, branch: 4, order: 0 },
  { x: 43, y: 27, rotation: 16, scale: 0.92, branch: 4, order: 1 },
  { x: 37, y: 19, rotation: -27, scale: 0.82, branch: 4, order: 2 },
  { x: 30, y: 12, rotation: 46, scale: 0.72, branch: 4, order: 3 },
  { x: 53, y: 33, rotation: 27, scale: 0.84, branch: 5, order: 0 },
  { x: 59, y: 22, rotation: -44, scale: 0.9, branch: 5, order: 1 },
  { x: 65, y: 14, rotation: 58, scale: 0.8, branch: 5, order: 2 },
  { x: 72, y: 8, rotation: -18, scale: 0.72, branch: 5, order: 3 },
] as const;

type TreeStyle = CSSProperties & Record<`--${string}`, string | number>;

function releasePointer(session: PointerSession) {
  if (session.element.hasPointerCapture(session.pointerId)) {
    session.element.releasePointerCapture(session.pointerId);
  }
}

function pointInsideBounds(point: Point, bounds: DOMRect) {
  return (
    point.x >= bounds.left &&
    point.x <= bounds.right &&
    point.y >= bounds.top &&
    point.y <= bounds.bottom
  );
}

function branchPoint(bounds: DOMRect, branchIndex: number): Point {
  const [x, y] = BRANCH_LAYOUT[branchIndex].anchor;
  return {
    x: bounds.left + bounds.width * (x / 100),
    y: bounds.top + bounds.height * (y / 100),
  };
}

function nearestAvailableBranch(
  point: Point,
  bounds: DOMRect,
  assignments: Readonly<Record<string, number>>,
) {
  const used = new Set(Object.values(assignments));
  const available = BRANCH_LAYOUT.map((_, index) => index).filter(
    (index) => !used.has(index),
  );
  const candidates =
    available.length > 0
      ? available
      : BRANCH_LAYOUT.map((_, index) => index);

  return candidates.reduce((nearest, index) => {
    const candidate = branchPoint(bounds, index);
    const current = branchPoint(bounds, nearest);
    const candidateDistance = Math.hypot(
      point.x - candidate.x,
      point.y - candidate.y,
    );
    const currentDistance = Math.hypot(
      point.x - current.x,
      point.y - current.y,
    );
    return candidateDistance < currentDistance ? index : nearest;
  }, candidates[0]);
}

function firstAvailableBranch(assignments: Readonly<Record<string, number>>) {
  const used = new Set(Object.values(assignments));
  const availableIndex = BRANCH_LAYOUT.findIndex(
    (_, index) => !used.has(index),
  );
  return availableIndex === -1 ? 0 : availableIndex;
}

function ghostTransform(point: Point, scale = 1) {
  return `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%) scale(${scale})`;
}

export function WishTree({ copy, wishes, onPlace }: WishTreeProps) {
  const reduceMotion = useReducedMotion();
  const [placed, setPlaced] = useState<Set<string>>(() => new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [dragged, setDragged] = useState<string | null>(null);
  const [dragVisual, setDragVisual] = useState<DragVisual | null>(null);
  const [receivingBranch, setReceivingBranch] = useState<number | null>(null);
  const [branchAssignments, setBranchAssignments] = useState<
    Record<string, number>
  >({});
  const [announcement, setAnnouncement] = useState("");

  const treeRef = useRef<HTMLButtonElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const pointerSessionRef = useRef<PointerSession | null>(null);
  const placedRef = useRef(placed);
  const branchAssignmentsRef = useRef(branchAssignments);
  const animationRef = useRef<Animation | null>(null);
  const frameRef = useRef(0);
  const pendingPointRef = useRef<Point | null>(null);
  const renderedPointRef = useRef<Point | null>(null);
  const suppressNextClickRef = useRef(false);
  const suppressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const growth = placed.size / Math.max(1, wishes.length);
  const availableWishes = useMemo(
    () => wishes.filter((wish) => !placed.has(wish.id)),
    [placed, wishes],
  );
  const assignmentEntries = useMemo(
    () => Object.entries(branchAssignments),
    [branchAssignments],
  );
  const activeBranches = useMemo(
    () => new Set(Object.values(branchAssignments)),
    [branchAssignments],
  );

  const clearSuppressTimer = useCallback(() => {
    if (suppressTimerRef.current !== null) {
      clearTimeout(suppressTimerRef.current);
      suppressTimerRef.current = null;
    }
  }, []);

  const queueGhostPosition = useCallback((point: Point) => {
    pendingPointRef.current = point;
    if (frameRef.current !== 0) return;

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const nextPoint = pendingPointRef.current;
      const ghost = ghostRef.current;
      if (!nextPoint || !ghost) return;

      const previousPoint = renderedPointRef.current ?? nextPoint;
      const deltaX = nextPoint.x - previousPoint.x;
      const deltaY = nextPoint.y - previousPoint.y;
      const distance = Math.max(1, Math.hypot(deltaX, deltaY));
      ghost.style.transform = ghostTransform(nextPoint);
      ghost.style.setProperty(
        "--wish-trail-x",
        `${(-deltaX / distance) * 22}px`,
      );
      ghost.style.setProperty(
        "--wish-trail-y",
        `${(-deltaY / distance) * 22}px`,
      );
      renderedPointRef.current = nextPoint;
    });
  }, []);

  const animateGhost = useCallback(
    (
      from: Point,
      to: Point,
      outcome: "return" | "place",
      onFinish: () => void,
    ) => {
      if (frameRef.current !== 0) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }

      const ghost = ghostRef.current;
      animationRef.current?.cancel();

      if (!ghost || reduceMotion) {
        onFinish();
        return;
      }

      const isPlacement = outcome === "place";
      const animation = ghost.animate(
        [
          {
            transform: ghostTransform(from),
            opacity: 1,
          },
          {
            transform: ghostTransform(to, isPlacement ? 0.24 : 0.96),
            opacity: isPlacement ? 0.08 : 0,
          },
        ],
        {
          duration: isPlacement ? 470 : 330,
          easing: isPlacement
            ? "cubic-bezier(0.16, 1, 0.3, 1)"
            : "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "forwards",
        },
      );

      animationRef.current = animation;
      animation.onfinish = () => {
        if (animationRef.current !== animation) return;
        animationRef.current = null;
        onFinish();
      };
    },
    [reduceMotion],
  );

  const commitPlacement = useCallback(
    (id: string | null, branchIndex?: number, focusTree = false) => {
      if (!id || placedRef.current.has(id)) return;

      const resolvedBranch =
        branchIndex ?? firstAvailableBranch(branchAssignmentsRef.current);
      const nextPlaced = new Set(placedRef.current);
      nextPlaced.add(id);
      const nextAssignments = {
        ...branchAssignmentsRef.current,
        [id]: resolvedBranch,
      };

      placedRef.current = nextPlaced;
      branchAssignmentsRef.current = nextAssignments;
      setPlaced(nextPlaced);
      setBranchAssignments(nextAssignments);
      setSelected(null);
      setDragged(null);

      const wish = wishes.find((item) => item.id === id);
      setAnnouncement(
        `${copy.placedLabel}${wish ? `: ${wish.text}` : ""}. ${nextPlaced.size} of ${wishes.length}.`,
      );
      playChime();
      navigator.vibrate?.(18);
      onPlace(id);

      if (focusTree) {
        requestAnimationFrame(() => treeRef.current?.focus({ preventScroll: true }));
      }
    },
    [copy.placedLabel, onPlace, wishes],
  );

  const cancelCurrentPointer = useCallback(() => {
    const session = pointerSessionRef.current;
    pointerSessionRef.current = null;
    if (!session) return;

    releasePointer(session);
    setDragged(null);
    setReceivingBranch(null);

    if (!session.active) {
      setDragVisual(null);
      return;
    }

    animateGhost(session.current, session.source, "return", () => {
      setDragVisual(null);
    });
  }, [animateGhost]);

  useEffect(() => {
    if (!dragged) return;

    const blockScroll = (event: Event) => {
      if (event.cancelable) event.preventDefault();
    };

    document.documentElement.classList.add("wish-drag-active");
    document.body.classList.add("wish-drag-active");
    window.dispatchEvent(
      new CustomEvent(WISH_DRAG_EVENT, { detail: { active: true } }),
    );
    window.addEventListener("touchmove", blockScroll, { passive: false });
    window.addEventListener("wheel", blockScroll, { passive: false });

    return () => {
      window.removeEventListener("touchmove", blockScroll);
      window.removeEventListener("wheel", blockScroll);
      document.documentElement.classList.remove("wish-drag-active");
      document.body.classList.remove("wish-drag-active");
      window.dispatchEvent(
        new CustomEvent(WISH_DRAG_EVENT, { detail: { active: false } }),
      );
    };
  }, [dragged]);

  useEffect(() => {
    const cancelOnBlur = () => cancelCurrentPointer();
    const cancelWhenHidden = () => {
      if (document.hidden) cancelCurrentPointer();
    };

    window.addEventListener("blur", cancelOnBlur);
    document.addEventListener("visibilitychange", cancelWhenHidden);
    return () => {
      window.removeEventListener("blur", cancelOnBlur);
      document.removeEventListener("visibilitychange", cancelWhenHidden);
    };
  }, [cancelCurrentPointer]);

  useEffect(
    () => () => {
      if (frameRef.current !== 0) cancelAnimationFrame(frameRef.current);
      animationRef.current?.cancel();
      clearSuppressTimer();
    },
    [clearSuppressTimer],
  );

  const startPointerSession = (
    wish: TreeWish,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (
      pointerSessionRef.current ||
      dragVisual ||
      !event.isPrimary ||
      (event.pointerType === "mouse" && event.button !== 0)
    ) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const point = { x: event.clientX, y: event.clientY };
    const session: PointerSession = {
      wish,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      element: event.currentTarget,
      start: point,
      current: point,
      source: {
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2,
      },
      active: false,
    };

    pointerSessionRef.current = session;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const movePointerSession = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    const session = pointerSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;

    const coalescedEvents = event.nativeEvent.getCoalescedEvents?.();
    const latestEvent =
      coalescedEvents && coalescedEvents.length > 0
        ? coalescedEvents[coalescedEvents.length - 1]
        : event.nativeEvent;
    const point = { x: latestEvent.clientX, y: latestEvent.clientY };
    session.current = point;

    if (!session.active) {
      const deltaX = point.x - session.start.x;
      const deltaY = point.y - session.start.y;
      const threshold = session.pointerType === "touch" ? 9 : 4;
      if (Math.hypot(deltaX, deltaY) < threshold) return;

      if (
        session.pointerType === "touch" &&
        Math.abs(deltaX) > Math.abs(deltaY) * 1.15
      ) {
        pointerSessionRef.current = null;
        releasePointer(session);
        return;
      }

      session.active = true;
      renderedPointRef.current = point;
      setDragged(session.wish.id);
      setDragVisual({ wish: session.wish, point });
    }

    event.preventDefault();
    queueGhostPosition(point);
  };

  const finishPointerSession = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    const session = pointerSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;

    pointerSessionRef.current = null;
    releasePointer(session);

    if (!session.active) return;

    event.preventDefault();
    suppressNextClickRef.current = true;
    clearSuppressTimer();
    suppressTimerRef.current = setTimeout(() => {
      suppressNextClickRef.current = false;
      suppressTimerRef.current = null;
    }, 0);
    setDragged(null);

    const point = { x: event.clientX, y: event.clientY };
    const bounds = treeRef.current?.getBoundingClientRect();
    if (!bounds || !pointInsideBounds(point, bounds)) {
      animateGhost(point, session.source, "return", () => {
        setDragVisual(null);
      });
      return;
    }

    const branchIndex = nearestAvailableBranch(
      point,
      bounds,
      branchAssignmentsRef.current,
    );
    const destination = branchPoint(bounds, branchIndex);
    setReceivingBranch(branchIndex);
    animateGhost(point, destination, "place", () => {
      setReceivingBranch(null);
      setDragVisual(null);
      commitPlacement(session.wish.id, branchIndex, true);
    });
  };

  const handleWishClick = (
    id: string,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    setSelected((current) => (current === id ? null : id));
  };

  const selectedWish = wishes.find((wish) => wish.id === selected);

  return (
    <section className="chapter tree-chapter">
      <div className="chapter-shell">
        <SectionHeading
          eyebrow={copy.eyebrow}
          title={copy.title}
          body={`${copy.introduction} ${copy.instruction}`}
        />

        <motion.div
          className="tree-experience"
          initial={
            reduceMotion
              ? false
              : { opacity: 0, y: 26, scale: 0.992, filter: "blur(7px)" }
          }
          whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.16 }}
          transition={{
            duration: reduceMotion ? 0.12 : 1.05,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <div
            className="wish-tokens"
            role="group"
            aria-label="Wishes ready to place"
          >
            {availableWishes.map((wish, index) => (
              <motion.div
                key={wish.id}
                initial={reduceMotion ? false : { opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <motion.button
                  type="button"
                  data-wish-id={wish.id}
                  className={`wish-token glass ${
                    selected === wish.id ? "is-selected" : ""
                  } ${dragged === wish.id ? "is-dragging" : ""}`}
                  whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                  onPointerDown={(event) => startPointerSession(wish, event)}
                  onPointerMove={movePointerSession}
                  onPointerUp={finishPointerSession}
                  onPointerCancel={cancelCurrentPointer}
                  onLostPointerCapture={(event) => {
                    if (
                      pointerSessionRef.current?.pointerId ===
                      event.pointerId
                    ) {
                      cancelCurrentPointer();
                    }
                  }}
                  onClick={(event) => handleWishClick(wish.id, event)}
                  aria-pressed={selected === wish.id}
                >
                  <span className="wish-token__grip" aria-hidden="true">
                    <Grip size={15} />
                  </span>
                  <span className="wish-token__label">{wish.text}</span>
                </motion.button>
              </motion.div>
            ))}
            {availableWishes.length === 0 ? (
              <motion.div
                className="all-planted glass"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                role="status"
              >
                <Flower2 size={18} aria-hidden="true" />
                {copy.completeTitle}
              </motion.div>
            ) : null}
          </div>

          <button
            ref={treeRef}
            type="button"
            className={`wish-tree ${
              selected || dragged || receivingBranch !== null ? "is-ready" : ""
            } ${receivingBranch !== null ? "is-receiving" : ""} ${
              placed.size === wishes.length ? "is-complete" : ""
            }`}
            onClick={() => commitPlacement(selected)}
            aria-label={
              selectedWish
                ? `Place selected wish on the tree: ${selectedWish.text}`
                : `${placed.size} of ${wishes.length} wishes placed`
            }
            style={{ "--tree-growth": growth } as TreeStyle}
          >
            <span className="tree__aura" aria-hidden="true" />
            <svg
              className="tree__wood"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="wish-tree-trunk" x1="0" x2="1">
                  <stop offset="0" stopColor="#30233b" />
                  <stop offset="0.48" stopColor="#6f527d" />
                  <stop offset="1" stopColor="#3a2a45" />
                </linearGradient>
                <linearGradient id="wish-tree-branch" x1="0" x2="1">
                  <stop offset="0" stopColor="#4a3657" />
                  <stop offset="0.58" stopColor="#674c73" />
                  <stop offset="1" stopColor="#493651" />
                </linearGradient>
              </defs>
              <path
                className="tree__root"
                d="M50 89 C42 90 35 93 28 97 M52 89 C60 91 67 94 74 97 M48 89 C44 94 41 97 37 99 M55 89 C58 94 62 97 67 99"
              />
              {BRANCH_LAYOUT.map((branch, index) => {
                const isAwake = activeBranches.has(index);
                const wishId = assignmentEntries.find(
                  ([, branchIndex]) => branchIndex === index,
                )?.[0];

                return (
                  <g
                    key={branch.id}
                    className={`tree__branch-group ${
                      isAwake ? "is-awake" : ""
                    }`}
                  >
                    <path className="tree__branch" d={branch.path} />
                    {branch.twigs.map((twig) => (
                      <path
                        key={twig}
                        className="tree__twig"
                        d={twig}
                      />
                    ))}
                    <path
                      className="tree__branch-glimmer"
                      d={branch.path}
                      pathLength={1}
                    />
                    {wishId ? (
                      reduceMotion ? (
                        <circle
                          className="tree__branch-particle"
                          cx={branch.anchor[0]}
                          cy={branch.anchor[1]}
                          r="0.75"
                        />
                      ) : (
                        <circle
                          key={wishId}
                          className="tree__branch-particle"
                          r="0.7"
                        >
                          <animateMotion
                            path={branch.path}
                            dur="1.45s"
                            begin="0s"
                            fill="freeze"
                          />
                          <animate
                            attributeName="opacity"
                            values="0;1;0.85;0"
                            keyTimes="0;0.18;0.72;1"
                            dur="1.45s"
                            fill="freeze"
                          />
                        </circle>
                      )
                    ) : null}
                  </g>
                );
              })}
              <path
                className="tree__trunk-core"
                d="M42 91 C45 78 45 67 47 56 C49 44 48 30 51 15 C54 30 52 44 54 56 C56 69 58 80 60 91 Z"
              />
            </svg>
            <span className="tree__crown" aria-hidden="true">
              {LEAF_LAYOUT.map((leaf, index) => (
                <i
                  key={index}
                  className={activeBranches.has(leaf.branch) ? "is-grown" : ""}
                  style={
                    {
                      "--leaf-index": index,
                      "--leaf-x": `${leaf.x}%`,
                      "--leaf-y": `${leaf.y}%`,
                      "--leaf-rotation": `${leaf.rotation}deg`,
                      "--leaf-scale": leaf.scale,
                      "--leaf-delay": `${leaf.order * 70}ms`,
                    } as TreeStyle
                  }
                />
              ))}
            </span>
            <span className="tree__flowers" aria-hidden="true">
              {assignmentEntries.flatMap(([wishId, branchIndex]) =>
                BRANCH_LAYOUT[branchIndex].flowers.map(([x, y], flowerIndex) => (
                  <Flower2
                    key={`${wishId}-${flowerIndex}`}
                    size={13 + flowerIndex * 2}
                    style={
                      {
                        "--flower-x": `${x}%`,
                        "--flower-y": `${y}%`,
                        "--flower-delay": `${flowerIndex * 100}ms`,
                        "--flower-rotation": `${(branchIndex * 29 + flowerIndex * 41) % 70 - 35}deg`,
                      } as TreeStyle
                    }
                  />
                )),
              )}
            </span>
            <span className="tree__fireflies" aria-hidden="true">
              {assignmentEntries.length === 0
                ? [0, 1].map((index) => (
                    <Sparkle
                      key={index}
                      size={7 + index}
                      style={
                        {
                          "--firefly-x": `${42 + index * 16}%`,
                          "--firefly-y": `${31 + index * 14}%`,
                          "--firefly-delay": `${-index * 1.7}s`,
                          "--firefly-duration": `${4.2 + index * 0.55}s`,
                        } as TreeStyle
                      }
                    />
                  ))
                : assignmentEntries.flatMap(([wishId, branchIndex]) => {
                    const [x, y] = BRANCH_LAYOUT[branchIndex].anchor;
                    return [0, 1].map((offset) => (
                      <Sparkle
                        key={`${wishId}-${offset}`}
                        size={7 + ((branchIndex + offset) % 3)}
                        style={
                          {
                            "--firefly-x": `${x + (offset === 0 ? -3 : 5)}%`,
                            "--firefly-y": `${y + (offset === 0 ? 4 : -2)}%`,
                            "--firefly-delay": `${-((branchIndex * 1.17 + offset) % 4.8)}s`,
                            "--firefly-duration": `${4 + ((branchIndex + offset) % 4) * 0.6}s`,
                          } as TreeStyle
                        }
                      />
                    ));
                  })}
            </span>
            {placed.size > 0 ? (
              <span className="tree__counter">
                {placed.size}/{wishes.length}
              </span>
            ) : null}
          </button>
          <span
            className="sr-only"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {announcement}
          </span>
        </motion.div>
      </div>

      {dragVisual && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={ghostRef}
              className="wish-drag-ghost"
              style={{
                transform: ghostTransform(dragVisual.point),
              }}
              aria-hidden="true"
            >
              <span className="wish-drag-ghost__trail">
                <i />
                <i />
                <i />
              </span>
              <span className="wish-drag-ghost__card">
                <Grip size={14} />
                <span>{dragVisual.wish.text}</span>
              </span>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}
