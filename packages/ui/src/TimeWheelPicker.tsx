/**
 * TimeWheelPicker - iOS-style time picker with spinning wheels
 *
 * Allows selecting custom snooze times with:
 * - Relative time (minutes, hours, days from now)
 * - Specific date and time
 */

import React, { useState, useRef, useEffect } from "react";

export type TimePickerMode = "relative" | "absolute";

export interface TimeWheelPickerProps {
  /** Initial mode */
  initialMode?: TimePickerMode;
  /** Initial date (for absolute mode) */
  initialDate?: Date;
  /** Callback when time selected */
  onSelect: (date: Date) => void;
  /** Callback when cancelled */
  onCancel: () => void;
}

interface WheelProps {
  options: (string | number)[];
  selectedIndex: number;
  onChange: (index: number) => void;
  height?: number;
}

function Wheel({ options, selectedIndex, onChange, height = 180 }: WheelProps) {
  const itemHeight = 40;
  const wheelRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!wheelRef.current) return;
    const scrollTop = wheelRef.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    onChange(Math.max(0, Math.min(options.length - 1, index)));
  };

  useEffect(() => {
    if (wheelRef.current) {
      wheelRef.current.scrollTop = selectedIndex * itemHeight;
    }
  }, [selectedIndex]);

  return (
    <div
      ref={wheelRef}
      onScroll={handleScroll}
      style={{
        height,
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        position: "relative",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        msOverflowStyle: "none"
      }}
    >
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Padding at top */}
      <div style={{ height: height / 2 - itemHeight / 2 }} />

      {options.map((option, index) => (
        <div
          key={index}
          onClick={() => {
            onChange(index);
            if (wheelRef.current) {
              wheelRef.current.scrollTop = index * itemHeight;
            }
          }}
          style={{
            height: itemHeight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: index === selectedIndex ? 600 : 400,
            color: index === selectedIndex ? "#000" : "#999",
            cursor: "pointer",
            scrollSnapAlign: "center",
            transition: "all 0.2s ease"
          }}
        >
          {option}
        </div>
      ))}

      {/* Padding at bottom */}
      <div style={{ height: height / 2 - itemHeight / 2 }} />

      {/* Selection highlight */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: itemHeight,
          transform: "translateY(-50%)",
          borderTop: "1px solid #ddd",
          borderBottom: "1px solid #ddd",
          background: "rgba(0, 0, 0, 0.02)",
          pointerEvents: "none"
        }}
      />
    </div>
  );
}

export function TimeWheelPicker({
  initialMode = "relative",
  initialDate,
  onSelect,
  onCancel
}: TimeWheelPickerProps) {
  const [mode, setMode] = useState<TimePickerMode>(initialMode);

  // Relative mode state
  const [relativeValue, setRelativeValue] = useState(10);
  const [relativeUnit, setRelativeUnit] = useState<"minutes" | "hours" | "days">("minutes");

  // Absolute mode state
  const now = new Date();
  const [date, setDate] = useState(initialDate || new Date(now.getTime() + 60 * 60 * 1000)); // Default: 1 hour from now

  const relativeValues = Array.from({ length: 60 }, (_, i) => i + 1); // 1-60
  const relativeUnits: ("minutes" | "hours" | "days")[] = ["minutes", "hours", "days"];

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  const handleConfirm = () => {
    let selectedDate: Date;

    if (mode === "relative") {
      const multiplier = relativeUnit === "minutes" ? 1 : relativeUnit === "hours" ? 60 : 1440;
      selectedDate = new Date(now.getTime() + relativeValue * multiplier * 60 * 1000);
    } else {
      selectedDate = date;
    }

    onSelect(selectedDate);
  };

  return (
    <div className="time-wheel-picker">
      {/* Mode tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          padding: 4,
          background: "#f5f5f5",
          borderRadius: 8
        }}
      >
        <button
          onClick={() => setMode("relative")}
          style={{
            flex: 1,
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            background: mode === "relative" ? "#fff" : "transparent",
            fontWeight: mode === "relative" ? 600 : 400,
            cursor: "pointer",
            transition: "all 0.15s ease"
          }}
        >
          Relative
        </button>
        <button
          onClick={() => setMode("absolute")}
          style={{
            flex: 1,
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            background: mode === "absolute" ? "#fff" : "transparent",
            fontWeight: mode === "absolute" ? 600 : 400,
            cursor: "pointer",
            transition: "all 0.15s ease"
          }}
        >
          Specific Time
        </button>
      </div>

      {/* Wheels */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 24
        }}
      >
        {mode === "relative" ? (
          <>
            <Wheel
              options={relativeValues}
              selectedIndex={relativeValue - 1}
              onChange={(index) => setRelativeValue(relativeValues[index])}
            />
            <Wheel
              options={relativeUnits}
              selectedIndex={relativeUnits.indexOf(relativeUnit)}
              onChange={(index) => setRelativeUnit(relativeUnits[index])}
            />
          </>
        ) : (
          <>
            <Wheel
              options={days}
              selectedIndex={Math.floor((date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))}
              onChange={(index) => {
                const newDate = new Date(now);
                newDate.setDate(newDate.getDate() + index);
                newDate.setHours(date.getHours());
                newDate.setMinutes(date.getMinutes());
                setDate(newDate);
              }}
            />
            <Wheel
              options={hours}
              selectedIndex={date.getHours()}
              onChange={(index) => {
                const newDate = new Date(date);
                newDate.setHours(index);
                setDate(newDate);
              }}
            />
            <Wheel
              options={minutes}
              selectedIndex={date.getMinutes()}
              onChange={(index) => {
                const newDate = new Date(date);
                newDate.setMinutes(index);
                setDate(newDate);
              }}
            />
          </>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "#fff",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer"
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border: "none",
            background: "#000",
            color: "#fff",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer"
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
