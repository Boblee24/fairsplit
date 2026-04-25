"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";

type Props = {
  value: string;
  onChange: (categoryId: string) => void;
};

export default function CategoryPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const selected = CATEGORIES.find((c) => c.id === value) ?? CATEGORIES[CATEGORIES.length - 1];

  return (
    <div style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0.6rem 0.85rem",
          background: "var(--fs-surface-2)",
          border: `1px solid ${open ? "var(--fs-border-accent)" : "var(--fs-border-mid)"}`,
          borderRadius: "var(--fs-radius-sm)",
          color: "var(--fs-text)",
          fontFamily: "var(--fs-ui)",
          fontSize: "0.875rem",
          cursor: "pointer",
          transition: "border-color .15s, box-shadow .15s",
          boxShadow: open ? "0 0 0 3px var(--fs-accent-dim)" : "none",
          outline: "none",
        }}
      >
        <span style={{ fontSize: "1.05rem" }}>{selected.emoji}</span>
        <span>{selected.label}</span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "var(--fs-mono)",
            fontSize: "9px",
            color: "var(--fs-muted)",
            transition: "transform .2s",
            display: "inline-block",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▾
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            zIndex: 20,
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "var(--fs-surface)",
            border: "1px solid var(--fs-border-accent)",
            borderRadius: "var(--fs-radius)",
            padding: "0.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0.25rem",
            boxShadow: "0 16px 40px rgba(0,0,0,0.45), 0 0 0 1px var(--fs-border-accent)",
          }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = value === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => { onChange(cat.id); setOpen(false); }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "0.6rem 0.4rem",
                  borderRadius: "var(--fs-radius-sm)",
                  border: isSelected
                    ? "1px solid var(--fs-border-accent)"
                    : "1px solid transparent",
                  background: isSelected ? "var(--fs-accent-dim)" : "transparent",
                  color: isSelected ? "var(--fs-accent)" : "var(--fs-muted)",
                  fontFamily: "var(--fs-ui)",
                  fontSize: "0.7rem",
                  cursor: "pointer",
                  transition: "background .15s, color .15s, border-color .15s",
                  lineHeight: 1.3,
                  textAlign: "center",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "var(--fs-surface-2)";
                    e.currentTarget.style.color      = "var(--fs-text-2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color      = "var(--fs-muted)";
                  }
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
