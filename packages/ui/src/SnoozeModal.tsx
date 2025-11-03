/**
 * SnoozeModal - Complete snooze interface with chips and time picker
 *
 * Combines SnoozeChips and TimeWheelPicker into a modal dialog
 */

import React, { useState } from "react";
import { Modal } from "./Modal";
import { SnoozeChips } from "./SnoozeChips";
import { TimeWheelPicker } from "./TimeWheelPicker";

export interface SnoozeModalProps {
  /** Whether modal is open */
  open: boolean;
  /** Callback when modal closes */
  onClose: () => void;
  /** Callback when snooze selected */
  onSnooze: (value: { minutes?: number; preset?: string; timestamp?: string }) => void;
  /** Loading state */
  loading?: boolean;
}

export function SnoozeModal({
  open,
  onClose,
  onSnooze,
  loading = false
}: SnoozeModalProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const handleQuickSnooze = (value: number | string) => {
    if (typeof value === "number") {
      onSnooze({ minutes: value });
    } else {
      onSnooze({ preset: value });
    }
    onClose();
  };

  const handleCustomSnooze = (date: Date) => {
    onSnooze({ timestamp: date.toISOString() });
    setShowCustomPicker(false);
    onClose();
  };

  const handleClose = () => {
    setShowCustomPicker(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={showCustomPicker ? "Choose Time" : "Snooze Task"}
      maxWidth={showCustomPicker ? 400 : 500}
    >
      {showCustomPicker ? (
        <TimeWheelPicker
          onSelect={handleCustomSnooze}
          onCancel={() => setShowCustomPicker(false)}
        />
      ) : (
        <div>
          <p style={{ marginBottom: 16, color: "#666", fontSize: 14 }}>
            Choose when you want to be reminded:
          </p>
          <SnoozeChips
            onSnooze={handleQuickSnooze}
            onCustom={() => setShowCustomPicker(true)}
            showCustom={true}
            loading={loading}
          />
        </div>
      )}
    </Modal>
  );
}
