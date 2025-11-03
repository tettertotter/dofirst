/**
 * Modal - Generic modal/dialog component
 */

import React, { useEffect } from "react";

export interface ModalProps {
  /** Whether modal is open */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Footer content (buttons, etc.) */
  footer?: React.ReactNode;
  /** Max width (default: 500px) */
  maxWidth?: number | string;
  /** Close on backdrop click (default: true) */
  closeOnBackdrop?: boolean;
  /** Close on Escape key (default: true) */
  closeOnEscape?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = 500,
  closeOnBackdrop = true,
  closeOnEscape = true
}: ModalProps) {
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, closeOnEscape, onClose]);

  // Prevent body scroll when modal open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16
      }}
      onClick={() => {
        if (closeOnBackdrop) onClose();
      }}
    >
      <div
        className="modal-content"
        style={{
          background: "#fff",
          borderRadius: 12,
          maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div
            className="modal-header"
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid #e5e5e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{title}</h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: 24,
                cursor: "pointer",
                padding: 0,
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 6,
                color: "#666"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f5f5f5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}

        {/* Body */}
        <div
          className="modal-body"
          style={{
            padding: 24
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="modal-footer"
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #e5e5e5",
              display: "flex",
              gap: 8,
              justifyContent: "flex-end"
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
