/**
 * SnoozeChips - Quick snooze action buttons
 *
 * Provides preset snooze durations with icon and label:
 * - +10m: Quick 10 minute snooze
 * - +1h: 1 hour snooze
 * - Tonight: Snooze until 9pm today (or tomorrow if already past)
 * - Tomorrow AM: Snooze until 9am tomorrow
 * - Custom: Opens time picker for custom snooze
 */

import React from "react";

export interface SnoozeOption {
  id: string;
  label: string;
  icon?: string;
  description?: string;
  /** Minutes to snooze (for relative) or preset name */
  value: number | string;
}

export interface SnoozeChipsProps {
  /** Callback when snooze option selected */
  onSnooze: (value: number | string) => void;
  /** Callback when custom option selected */
  onCustom?: () => void;
  /** Show custom option */
  showCustom?: boolean;
  /** Custom snooze options (defaults to standard presets) */
  options?: SnoozeOption[];
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
}

const DEFAULT_OPTIONS: SnoozeOption[] = [
  {
    id: "10m",
    label: "+10m",
    icon: "⏰",
    description: "10 minutes",
    value: 10
  },
  {
    id: "1h",
    label: "+1h",
    icon: "⏱️",
    description: "1 hour",
    value: 60
  },
  {
    id: "tonight",
    label: "Tonight",
    icon: "🌙",
    description: "9pm today",
    value: "tonight"
  },
  {
    id: "tomorrow",
    label: "Tomorrow AM",
    icon: "☀️",
    description: "9am tomorrow",
    value: "tomorrow_am"
  },
  {
    id: "weekend",
    label: "This Weekend",
    icon: "🏖️",
    description: "Saturday 9am",
    value: "this_weekend"
  },
  {
    id: "next_week",
    label: "Next Week",
    icon: "📆",
    description: "Monday 9am",
    value: "next_week"
  }
];

export function SnoozeChips({
  onSnooze,
  onCustom,
  showCustom = true,
  options = DEFAULT_OPTIONS,
  disabled = false,
  loading = false
}: SnoozeChipsProps) {
  return (
    <div className="snooze-chips" style={{
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      alignItems: "center"
    }}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSnooze(option.value)}
          disabled={disabled || loading}
          className="snooze-chip"
          title={option.description}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 20,
            border: "1px solid #ddd",
            background: "#fff",
            fontSize: 14,
            fontWeight: 500,
            cursor: disabled || loading ? "not-allowed" : "pointer",
            opacity: disabled || loading ? 0.5 : 1,
            transition: "all 0.15s ease",
            whiteSpace: "nowrap"
          }}
          onMouseEnter={(e) => {
            if (!disabled && !loading) {
              e.currentTarget.style.background = "#f5f5f5";
              e.currentTarget.style.borderColor = "#999";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.borderColor = "#ddd";
          }}
        >
          {option.icon && <span role="img" aria-label={option.label}>{option.icon}</span>}
          <span>{option.label}</span>
        </button>
      ))}

      {showCustom && onCustom && (
        <button
          onClick={onCustom}
          disabled={disabled || loading}
          className="snooze-chip snooze-chip-custom"
          title="Choose custom time"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 20,
            border: "1px solid #ddd",
            background: "#fff",
            fontSize: 14,
            fontWeight: 500,
            cursor: disabled || loading ? "not-allowed" : "pointer",
            opacity: disabled || loading ? 0.5 : 1,
            transition: "all 0.15s ease",
            whiteSpace: "nowrap"
          }}
          onMouseEnter={(e) => {
            if (!disabled && !loading) {
              e.currentTarget.style.background = "#f5f5f5";
              e.currentTarget.style.borderColor = "#999";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.borderColor = "#ddd";
          }}
        >
          <span role="img" aria-label="Custom">📅</span>
          <span>Custom</span>
        </button>
      )}
    </div>
  );
}
