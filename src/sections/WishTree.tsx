"use client";

import { motion, type PanInfo, useReducedMotion } from "framer-motion";
import { Flower2, Grip, Sparkle } from "lucide-react";
import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SectionHeading } from "@/src/components/SectionHeading";
import type { TreeWish, WishTreeCopy } from "@/src/types/site";
import { playChime } from "@/src/lib/audio";

type WishTreeProps = {
  copy: WishTreeCopy;
  wishes: readonly TreeWish[];
  onPlace: (id: string) => void;
};

const LEAF_LAYOUT = [
  [49, 1, -12, 0.9],
  [34, 7, 24, 0.82],
  [63, 8, -34, 0.88],
  [21, 16, 48, 0.78],
  [47, 15, -51, 1],
  [76, 18, 31, 0.84],
  [11, 29, -28, 0.72],
  [31, 27, 61, 0.92],
  [58, 26, 16, 0.86],
  [86, 31, -55, 0.74],
  [18, 40, 38, 0.9],
  [43, 37, -19, 0.82],
  [69, 39, 54, 0.96],
  [5, 51, -46, 0.7],
  [28, 50, 13, 0.88],
  [52, 49, -62, 0.78],
  [82, 51, 27, 0.82],
  [16, 61, 57, 0.74],
  [39, 60, -27, 0.94],
  [64, 61, 42, 0.86],
  [91, 60, -13, 0.68],
  [29, 71, 19, 0.76],
  [50, 69, -44, 0.88],
  [74, 72, 58, 0.72],
  [41, 81, 32, 0.7],
  [61, 80, -18, 0.74],
] as const;

type TreeStyle = CSSProperties & Record<`--${string}`, string | number>;

export function WishTree({ copy, wishes, onPlace }: WishTreeProps) {
  const reduceMotion = useReducedMotion();
  const [placed, setPlaced] = useState<Set<string>>(() => new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [dragged, setDragged] = useState<string | null>(null);
  const [canDrag, setCanDrag] = useState(false);
  const treeRef = useRef<HTMLButtonElement>(null);

  const growth = placed.size / Math.max(1, wishes.length);
  const grownLeafCount = Math.ceil(growth * LEAF_LAYOUT.length);
  const availableWishes = useMemo(
    () => wishes.filter((wish) => !placed.has(wish.id)),
    [placed, wishes],
  );

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateCapability = () => setCanDrag(query.matches);
    updateCapability();
    query.addEventListener("change", updateCapability);
    return () => query.removeEventListener("change", updateCapability);
  }, []);

  const placeWish = (id: string | null) => {
    if (!id || placed.has(id)) return;
    setPlaced((current) => new Set(current).add(id));
    setSelected(null);
    setDragged(null);
    playChime();
    navigator.vibrate?.(18);
    onPlace(id);
  };

  const finishDrag = (id: string, info: PanInfo) => {
    const bounds = treeRef.current?.getBoundingClientRect();
    if (!bounds) {
      setDragged(null);
      return;
    }

    const clientPoint = {
      x: info.point.x - window.scrollX,
      y: info.point.y - window.scrollY,
    };
    const droppedOnTree =
      clientPoint.x >= bounds.left &&
      clientPoint.x <= bounds.right &&
      clientPoint.y >= bounds.top &&
      clientPoint.y <= bounds.bottom;

    if (droppedOnTree) {
      placeWish(id);
    } else {
      setDragged(null);
    }
  };

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
          <div className="wish-tokens" aria-label="Wishes ready to place">
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
                  className={`wish-token glass ${selected === wish.id ? "is-selected" : ""}`}
                  drag={canDrag}
                  dragSnapToOrigin
                  dragElastic={0.12}
                  whileDrag={{ scale: 1.035, zIndex: 4 }}
                  onDragStart={() => {
                    if (canDrag) setDragged(wish.id);
                  }}
                  onDragEnd={(_event, info) => finishDrag(wish.id, info)}
                  onClick={() =>
                    setSelected((current) =>
                      current === wish.id ? null : wish.id,
                    )
                  }
                  aria-pressed={selected === wish.id}
                >
                  <Grip size={15} aria-hidden="true" />
                  <span>{wish.text}</span>
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
            className={`wish-tree ${selected || dragged ? "is-ready" : ""} ${
              placed.size === wishes.length ? "is-complete" : ""
            }`}
            onClick={() => placeWish(selected)}
            aria-label={
              selected
                ? "Place selected wish on the tree"
                : `${placed.size} of ${wishes.length} wishes placed`
            }
            style={{ "--tree-growth": growth } as React.CSSProperties}
          >
            <span className="tree__aura" aria-hidden="true" />
            <span className="tree__trunk" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className="tree__crown" aria-hidden="true">
              {LEAF_LAYOUT.map(([x, y, rotation, scale], index) => (
                <i
                  key={index}
                  className={index < grownLeafCount ? "is-grown" : ""}
                  style={
                    {
                      "--leaf-index": index,
                      "--leaf-x": `${x}%`,
                      "--leaf-y": `${y}%`,
                      "--leaf-rotation": `${rotation}deg`,
                      "--leaf-scale": scale,
                      "--leaf-delay": `${(index % 5) * 45}ms`,
                    } as TreeStyle
                  }
                />
              ))}
            </span>
            <span className="tree__flowers" aria-hidden="true">
              {Array.from({ length: placed.size * 2 }, (_, index) => (
                <Flower2
                  key={index}
                  size={13 + (index % 3) * 2}
                  style={
                    {
                      "--flower-x": `${LEAF_LAYOUT[(index * 7 + 4) % LEAF_LAYOUT.length][0]}%`,
                      "--flower-y": `${LEAF_LAYOUT[(index * 7 + 4) % LEAF_LAYOUT.length][1] + 5}%`,
                      "--flower-delay": `${(index % 4) * 90}ms`,
                      "--flower-rotation": `${(index * 43) % 70 - 35}deg`,
                    } as TreeStyle
                  }
                />
              ))}
            </span>
            <span className="tree__fireflies" aria-hidden="true">
              {Array.from({ length: Math.max(2, placed.size * 3) }, (_, index) => (
                <Sparkle
                  key={index}
                  size={7 + (index % 3)}
                  style={
                    {
                      "--firefly-x": `${8 + ((index * 29) % 84)}%`,
                      "--firefly-y": `${12 + ((index * 37) % 68)}%`,
                      "--firefly-delay": `${-((index * 1.37) % 5.6)}s`,
                      "--firefly-duration": `${3.8 + (index % 5) * 0.63}s`,
                    } as TreeStyle
                  }
                />
              ))}
            </span>
            {placed.size > 0 ? (
              <span className="tree__counter">
                {placed.size}/{wishes.length}
              </span>
            ) : null}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
