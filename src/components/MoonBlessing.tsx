"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MoonStar, X } from "lucide-react";
import { useEffect, useRef } from "react";

type MoonBlessingProps = {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
};

export function MoonBlessing({
  open,
  title,
  message,
  onClose,
}: MoonBlessingProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const layer = layerRef.current;
    const card = cardRef.current;
    if (!layer || !card) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    closeButtonRef.current?.focus({ preventScroll: true });

    const backgroundElements = Array.from(
      layer.parentElement?.children ?? [],
    ).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && element !== layer,
    );
    const previousBackgroundState = backgroundElements.map((element) => ({
      element,
      ariaHidden: element.getAttribute("aria-hidden"),
      inert: element.inert,
    }));

    backgroundElements.forEach((element) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        card.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hidden);

      if (focusableElements.length === 0) {
        event.preventDefault();
        card.focus({ preventScroll: true });
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (
        event.shiftKey &&
        (activeElement === firstFocusable || !card.contains(activeElement))
      ) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (
        !event.shiftKey &&
        (activeElement === lastFocusable || !card.contains(activeElement))
      ) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousBackgroundState.forEach(({ element, ariaHidden, inert }) => {
        element.inert = inert;
        if (ariaHidden === null) {
          element.removeAttribute("aria-hidden");
        } else {
          element.setAttribute("aria-hidden", ariaHidden);
        }
      });
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={layerRef}
          className="modal-layer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="moon-blessing-title"
          aria-describedby="moon-blessing-message"
          onClick={onClose}
        >
          <motion.div
            ref={cardRef}
            className="blessing-card glass"
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 170, damping: 22 }}
            onClick={(event) => event.stopPropagation()}
            tabIndex={-1}
          >
            <button
              ref={closeButtonRef}
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="Close hidden blessing"
            >
              <X size={18} />
            </button>
            <MoonStar className="blessing-card__icon" aria-hidden="true" />
            <span className="eyebrow">A hidden blessing</span>
            <h2 id="moon-blessing-title">{title}</h2>
            <p id="moon-blessing-message">{message}</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
