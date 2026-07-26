"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MoonStar, X } from "lucide-react";

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
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="modal-layer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="moon-blessing-title"
          onClick={onClose}
        >
          <motion.div
            className="blessing-card glass"
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 170, damping: 22 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
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
            <p>{message}</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

