"use client";

/**
 * Test page for Snooze UI components
 *
 * Demonstrates SnoozeChips, TimeWheelPicker, and SnoozeModal
 */

import React, { useState } from "react";
import {
  Card,
  Button,
  SnoozeChips,
  SnoozeModal,
  TimeWheelPicker,
  useSnooze
} from "@todaypool/ui";

export default function TestSnoozePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [message, setMessage] = useState<string | undefined>();
  const { loading, error, snooze, clearError } = useSnooze();

  // Mock task ID for demo
  const mockTaskId = "demo-task-123";

  const handleQuickSnooze = async (value: number | string) => {
    setMessage(undefined);
    clearError();

    try {
      if (typeof value === "number") {
        await snooze({ taskId: mockTaskId, minutes: value });
        setMessage(`✓ Snoozed for ${value} minutes`);
      } else {
        await snooze({ taskId: mockTaskId, preset: value as any });
        setMessage(`✓ Snoozed until ${value.replace("_", " ")}`);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(undefined), 3000);
    } catch (err) {
      // Error already set by hook
    }
  };

  const handleModalSnooze = async (options: {
    minutes?: number;
    preset?: string;
    timestamp?: string;
  }) => {
    setMessage(undefined);
    clearError();

    try {
      await snooze({ taskId: mockTaskId, ...options });

      if (options.minutes) {
        setMessage(`✓ Snoozed for ${options.minutes} minutes`);
      } else if (options.preset) {
        setMessage(`✓ Snoozed until ${options.preset.replace("_", " ")}`);
      } else if (options.timestamp) {
        const date = new Date(options.timestamp);
        setMessage(`✓ Snoozed until ${date.toLocaleString()}`);
      }

      setTimeout(() => setMessage(undefined), 3000);
    } catch (err) {
      // Error already set by hook
    }
  };

  const handleCustomSnooze = async (date: Date) => {
    setMessage(undefined);
    clearError();

    try {
      await snooze({ taskId: mockTaskId, timestamp: date.toISOString() });
      setMessage(`✓ Snoozed until ${date.toLocaleString()}`);
      setPickerVisible(false);

      setTimeout(() => setMessage(undefined), 3000);
    } catch (err) {
      // Error already set by hook
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
        Snooze UI Components
      </h1>
      <p style={{ marginBottom: 32, color: "#666" }}>
        Test the snooze components for DoFirst
      </p>

      {/* Status Messages */}
      {message && (
        <div
          style={{
            padding: 16,
            borderRadius: 8,
            background: "#d4edda",
            color: "#155724",
            marginBottom: 24,
            border: "1px solid #c3e6cb"
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: 16,
            borderRadius: 8,
            background: "#f8d7da",
            color: "#721c24",
            marginBottom: 24,
            border: "1px solid #f5c6cb"
          }}
        >
          <strong>Error:</strong> {error.message}
          <button
            onClick={clearError}
            style={{
              marginLeft: 12,
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid #721c24",
              background: "transparent",
              color: "#721c24",
              cursor: "pointer",
              fontSize: 12
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. SnoozeChips */}
      <Card style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          1. Snooze Chips
        </h2>
        <p style={{ marginBottom: 16, color: "#666", fontSize: 14 }}>
          Quick snooze actions with preset durations. Click a chip to snooze.
        </p>
        <SnoozeChips
          onSnooze={handleQuickSnooze}
          onCustom={() => setPickerVisible(true)}
          showCustom={true}
          loading={loading}
        />
      </Card>

      {/* 2. Time Wheel Picker */}
      {pickerVisible && (
        <Card style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            2. Time Wheel Picker
          </h2>
          <p style={{ marginBottom: 16, color: "#666", fontSize: 14 }}>
            iOS-style time picker with spinning wheels. Choose relative or specific time.
          </p>
          <TimeWheelPicker
            onSelect={handleCustomSnooze}
            onCancel={() => setPickerVisible(false)}
          />
        </Card>
      )}

      {/* 3. Snooze Modal */}
      <Card style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          3. Snooze Modal
        </h2>
        <p style={{ marginBottom: 16, color: "#666", fontSize: 14 }}>
          Complete snooze interface in a modal dialog. Combines chips and time picker.
        </p>
        <Button onClick={() => setModalOpen(true)} disabled={loading}>
          Open Snooze Modal
        </Button>
      </Card>

      <SnoozeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSnooze={handleModalSnooze}
        loading={loading}
      />

      {/* Component Specs */}
      <Card style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Component Specifications
        </h2>
        <div style={{ fontSize: 14, lineHeight: 1.8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>
            SnoozeChips
          </h3>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li>Preset durations: +10m, +1h, Tonight (9pm), Tomorrow AM (9am)</li>
            <li>Custom option opens time picker</li>
            <li>Supports loading and disabled states</li>
            <li>Fully accessible with keyboard navigation</li>
          </ul>

          <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>
            TimeWheelPicker
          </h3>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li>Two modes: Relative (e.g., 10 minutes) and Absolute (specific date/time)</li>
            <li>Smooth scrolling wheel interface</li>
            <li>Touch-friendly on mobile</li>
            <li>Snap-to-position for easy selection</li>
          </ul>

          <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>
            SnoozeModal
          </h3>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li>Combines chips and picker in modal</li>
            <li>Close on backdrop click or Escape key</li>
            <li>Prevents body scroll when open</li>
            <li>Responsive design</li>
          </ul>

          <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>
            useSnooze Hook
          </h3>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li>Handles API calls to /api/tasks.snooze</li>
            <li>Provides loading, error states</li>
            <li>Supports minutes, presets, and custom timestamps</li>
            <li>Type-safe with TypeScript</li>
          </ul>
        </div>
      </Card>

      {/* Usage Example */}
      <Card>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Usage Example
        </h2>
        <pre
          style={{
            background: "#f5f5f5",
            padding: 16,
            borderRadius: 8,
            overflow: "auto",
            fontSize: 13,
            lineHeight: 1.5
          }}
        >
          {`import { SnoozeModal, useSnooze } from "@todaypool/ui";

function TaskCard({ taskId }) {
  const [showSnooze, setShowSnooze] = useState(false);
  const { snooze, loading } = useSnooze();

  const handleSnooze = async (options) => {
    await snooze({ taskId, ...options });
    setShowSnooze(false);
    // Refresh task list...
  };

  return (
    <>
      <button onClick={() => setShowSnooze(true)}>
        Snooze
      </button>

      <SnoozeModal
        open={showSnooze}
        onClose={() => setShowSnooze(false)}
        onSnooze={handleSnooze}
        loading={loading}
      />
    </>
  );
}`}
        </pre>
      </Card>

      <div style={{ marginTop: 32, padding: 16, background: "#f9f9f9", borderRadius: 8 }}>
        <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
          <strong>Note:</strong> This is a demo page. The snooze actions will call the real API
          but use a mock task ID. In production, you would pass the actual task ID.
        </p>
      </div>
    </div>
  );
}
