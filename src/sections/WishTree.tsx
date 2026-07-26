"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Flower2, Grip, Sparkle } from "lucide-react";
import { type DragEvent, useMemo, useState } from "react";
import { SectionHeading } from "@/src/components/SectionHeading";
import type { TreeWish, WishTreeCopy } from "@/src/types/site";
import { playChime } from "@/src/lib/audio";

type WishTreeProps = {
  copy: WishTreeCopy;
  wishes: readonly TreeWish[];
  onPlace: (id: string) => void;
};

export function WishTree({ copy, wishes, onPlace }: WishTreeProps) {
  const reduceMotion = useReducedMotion();
  const [placed, setPlaced] = useState<Set<string>>(() => new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [dragged, setDragged] = useState<string | null>(null);

  const growth = placed.size / Math.max(1, wishes.length);
  const availableWishes = useMemo(
    () => wishes.filter((wish) => !placed.has(wish.id)),
    [placed, wishes],
  );

  const placeWish = (id: string | null) => {
    if (!id || placed.has(id)) return;
    setPlaced((current) => new Set(current).add(id));
    setSelected(null);
    setDragged(null);
    playChime();
    navigator.vibrate?.(18);
    onPlace(id);
  };

  const dropWish = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    placeWish(event.dataTransfer.getData("text/plain") || dragged);
  };

  return (
    <section className="chapter tree-chapter">
      <div className="chapter-shell">
        <SectionHeading
          eyebrow={copy.eyebrow}
          title={copy.title}
          body={`${copy.introduction} ${copy.instruction}`}
        />

        <div className="tree-experience">
          <div className="wish-tokens" aria-label="Wishes ready to place">
            {availableWishes.map((wish, index) => (
              <motion.div
                key={wish.id}
                initial={reduceMotion ? false : { opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <button
                  type="button"
                  className={`wish-token glass ${selected === wish.id ? "is-selected" : ""}`}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", wish.id);
                    setDragged(wish.id);
                  }}
                  onDragEnd={() => setDragged(null)}
                  onClick={() =>
                    setSelected((current) =>
                      current === wish.id ? null : wish.id,
                    )
                  }
                  aria-pressed={selected === wish.id}
                >
                  <Grip size={15} aria-hidden="true" />
                  <span>{wish.text}</span>
                </button>
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
            type="button"
            className={`wish-tree ${selected || dragged ? "is-ready" : ""} ${
              placed.size === wishes.length ? "is-complete" : ""
            }`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={dropWish}
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
            </span>
            <span className="tree__crown" aria-hidden="true">
              {Array.from({ length: 26 }, (_, index) => (
                <i
                  key={index}
                  className={index < placed.size * 5 ? "is-grown" : ""}
                  style={{ "--leaf-index": index } as React.CSSProperties}
                />
              ))}
            </span>
            <span className="tree__flowers" aria-hidden="true">
              {Array.from({ length: placed.size * 2 }, (_, index) => (
                <Flower2 key={index} size={13 + (index % 3) * 2} />
              ))}
            </span>
            <span className="tree__fireflies" aria-hidden="true">
              {Array.from({ length: Math.max(2, placed.size * 3) }, (_, index) => (
                <Sparkle key={index} size={8} />
              ))}
            </span>
            {placed.size > 0 ? (
              <span className="tree__counter">
                {placed.size}/{wishes.length}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </section>
  );
}
