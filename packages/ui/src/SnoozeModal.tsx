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
  onSnooze: (value: { minutes?: number; preset?: string; timestamp?: string; alarm_enabled?: boolean }) => void;
  /** Loading state */
  loading?: boolean;
  /** Task being snoozed (for context) */
  task?: any;
}

export function SnoozeModal({
  open,
  onClose,
  onSnooze,
  loading = false,
  task
}: SnoozeModalProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [alarmEnabled, setAlarmEnabled] = useState(false);

  const handleQuickSnooze = (value: number | string) => {
    if (typeof value === "number") {
      onSnooze({ minutes: value, alarm_enabled: alarmEnabled });
    } else {
      onSnooze({ preset: value, alarm_enabled: alarmEnabled });
    }
    onClose();
  };

  const handleCustomSnooze = (date: Date) => {
    onSnooze({ timestamp: date.toISOString(), alarm_enabled: alarmEnabled });
    setShowCustomPicker(false);
    onClose();
  };

  const handleClose = () => {
    setShowCustomPicker(false);
    setAlarmEnabled(false); // Reset alarm state on close
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

          {/* Alarm Toggle */}
          <div style={{
            marginTop: 24,
            padding: 16,
            border: "2px solid #e5e7eb",
            borderRadius: 12,
            backgroundColor: "#f9fafb"
          }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              userSelect: "none"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>🔔</span>
                <div>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#111827",
                    marginBottom: 2
                  }}>
                    Alarm
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: "#6b7280"
                  }}>
                    Play sound when reminder triggers
                  </div>
                </div>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type="checkbox"
                  checked={alarmEnabled}
                  onChange={(e) => setAlarmEnabled(e.target.checked)}
                  style={{ display: "none" }}
                />
                <div style={{
                  width: 48,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: alarmEnabled ? "#3b82f6" : "#d1d5db",
                  transition: "background-color 0.2s",
                  position: "relative"
                }}>
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: "#ffffff",
                    position: "absolute",
                    top: 4,
                    left: alarmEnabled ? 24 : 4,
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
                  }} />
                </div>
              </div>
            </label>
          </div>
        </div>
      )}
    </Modal>
  );
}
