"use client";

import React, { useState, useEffect } from "react";
import { getSupabaseClient } from "../../../lib/supabase-client";
import {
  Card,
  Spinner,
  useTheme,
  spacing,
  Button,
  Badge,
  Skeleton,
  Modal,
  ModalHeader,
  ModalFooter,
  Input,
  Textarea,
  Select,
  DatePicker,
  type SelectOption
} from "@todaypool/design-system";
import { SnoozeChips, SnoozeModal } from "@todaypool/ui";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: number | null;
  due_at: string | null;
  status: string;
  visibility: string;
  created_at: string;
  pool_id: string;
  remind_at?: string | null;
  alarm_enabled?: boolean;
  sort_order?: number;
}

interface PriorityLabel {
  priority_number: number;
  label: string;
}

export default function PoolPage() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | undefined>();
  const { resolvedColors } = useTheme();

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("open");

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<number>(3);
  const [editDueAt, setEditDueAt] = useState("");
  const [editVisibility, setEditVisibility] = useState<string>("owner_only");
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Priority labels and drag-and-drop state
  const [priorityLabels, setPriorityLabels] = useState<PriorityLabel[]>([]);
  const [currentPoolId, setCurrentPoolId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Swipe gesture state
  const [swipeTaskId, setSwipeTaskId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipeStartX, setSwipeStartX] = useState(0);

  // Drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required to start drag
      },
    })
  );

  // Propose modal state
  const [proposeDateModalOpen, setProposeDateModalOpen] = useState(false);
  const [proposingTask, setProposingTask] = useState<Task | null>(null);
  const [proposing, setProposing] = useState(false);

  const priorityOptions: SelectOption[] = [
    { value: "5", label: "Urgent (5)" },
    { value: "4", label: "High (4)" },
    { value: "3", label: "Medium (3)" },
    { value: "2", label: "Low (2)" },
    { value: "1", label: "Info (1)" }
  ];

  const filterOptions: SelectOption[] = [
    { value: "all", label: "All Priorities" },
    { value: "unsorted", label: "Unsorted" },
    { value: "5", label: "Urgent (5)" },
    { value: "4", label: "High (4)" },
    { value: "3", label: "Medium (3)" },
    { value: "2", label: "Low (2)" },
    { value: "1", label: "Info (1)" }
  ];

  const visibilityOptions: SelectOption[] = [
    { value: "owner_only", label: "Private (Owner Only)" },
    { value: "household", label: "Household" },
    { value: "work", label: "Work" },
    { value: "public", label: "Public" }
  ];

  const statusFilterOptions: SelectOption[] = [
    { value: "all", label: "All Status" },
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "done", label: "Done" },
    { value: "archived", label: "Archived" }
  ];

  // Filter tasks based on search query, priority, and status
  const filteredTasks = tasks.filter(task => {
    // Search filter - check title and description
    const matchesSearch = searchQuery.trim() === "" ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Priority filter - handle null priority (unsorted)
    const matchesPriority = priorityFilter === "all" ||
      (priorityFilter === "unsorted" && task.priority === null) ||
      (priorityFilter !== "unsorted" && task.priority === Number(priorityFilter));

    // Status filter
    const matchesStatus = statusFilter === "all" ||
      task.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Snooze modal state
  const [snoozeModalOpen, setSnoozeModalOpen] = useState(false);
  const [snoozeTask, setSnoozeTask] = useState<Task | null>(null);

  const openSnoozeModal = (task: Task) => {
    setSnoozeTask(task);
    setSnoozeModalOpen(true);
  };

  const closeSnoozeModal = () => {
    setSnoozeTask(null);
    setSnoozeModalOpen(false);
  };

  const handleSnooze = async (taskId: string, options: { minutes?: number; preset?: string; timestamp?: string; alarm_enabled?: boolean }) => {
    try {
      const body: any = { taskId };
      if (options.minutes !== undefined) {
        body.minutes = options.minutes;
      } else if (options.preset) {
        body.preset = options.preset;
      } else if (options.timestamp) {
        body.timestamp = options.timestamp;
      }

      // Include alarm_enabled if specified
      if (options.alarm_enabled !== undefined) {
        body.alarm_enabled = options.alarm_enabled;
      }

      const res = await fetch("/api/tasks.snooze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to snooze task");
      }

      setMessage(options.alarm_enabled ? "✓ Task snoozed with alarm" : "✓ Task snoozed successfully");
      await fetchTasks();
      closeSnoozeModal();
      setTimeout(() => setMessage(undefined), 3000);
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Failed to snooze task"}`);
    }
  };

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTasks();
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        return;
      }

      // Get user's pool memberships
      const { data: memberships } = await supabase
        .from("pool_members")
        .select("pool_id")
        .eq("user_id", session.user.id);

      if (!memberships || memberships.length === 0) {
        setTasks([]);
        setLoading(false);
        return;
      }

      const poolIds = memberships.map(m => m.pool_id);

      // Fetch all tasks from user's pools (filter by status client-side)
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .in("pool_id", poolIds)
        .order("due_at", { ascending: true, nullsFirst: false })
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTasks(data || []);

      // Fetch priority labels for the first pool
      if (poolIds.length > 0) {
        await fetchPriorityLabels(poolIds[0]);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setMessage(`Error: ${err instanceof Error ? err.message : "Failed to load tasks"}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriorityLabels = async (poolId: string) => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("priority_labels")
        .select("priority_number, label")
        .eq("pool_id", poolId)
        .order("priority_number", { ascending: true });

      if (error) throw error;

      setPriorityLabels(data || []);
      setCurrentPoolId(poolId);
    } catch (err) {
      console.error("Failed to fetch priority labels:", err);
    }
  };

  const handleComplete = async (taskId: string) => {
    setActionLoading(taskId);
    setMessage(undefined);

    try {
      const res = await fetch("/api/tasks.complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to complete task");
      }

      setMessage("✓ Task completed!");
      await fetchTasks();

      setTimeout(() => setMessage(undefined), 3000);
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Failed to complete task"}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusTransition = async (taskId: string, newStatus: string, successMessage: string) => {
    setActionLoading(taskId);
    setMessage(undefined);

    try {
      const res = await fetch("/api/tasks.update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to update task status");
      }

      setMessage(successMessage);
      await fetchTasks();

      setTimeout(() => setMessage(undefined), 3000);
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Failed to update task status"}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleProposeForToday = async (task: Task) => {
    setProposing(true);
    setActionLoading(task.id);
    setMessage(undefined);

    try {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const res = await fetch("/api/today.propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId: task.pool_id,
          taskId: task.id,
          date: dateStr
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to propose task");
      }

      setMessage(`✓ Proposed "${task.title}" for today`);

      setTimeout(() => setMessage(undefined), 3000);
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Failed to propose task"}`);
    } finally {
      setProposing(false);
      setActionLoading(null);
    }
  };

  const handleOpenProposeDateModal = (task: Task) => {
    setProposingTask(task);
    setProposeDateModalOpen(true);
  };

  const handleProposeDateSelect = async (date: Date) => {
    if (!proposingTask) return;

    setProposing(true);
    setActionLoading(proposingTask.id);
    setMessage(undefined);

    try {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      const res = await fetch("/api/today.propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId: proposingTask.pool_id,
          taskId: proposingTask.id,
          date: dateStr
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to propose task");
      }

      const formattedDate = date.toLocaleDateString();
      setMessage(`✓ Proposed "${proposingTask.title}" for ${formattedDate}`);

      setProposeDateModalOpen(false);
      setProposingTask(null);

      setTimeout(() => setMessage(undefined), 3000);
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Failed to propose task"}`);
    } finally {
      setProposing(false);
      setActionLoading(null);
    }
  };

  const handleQuickSnooze = async (taskId: string, minutes: number) => {
    setActionLoading(taskId);
    setMessage(undefined);

    try {
      const res = await fetch("/api/tasks.snooze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, minutes })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to snooze task");
      }

      setMessage(`✓ Task snoozed ${minutes}m`);
      await fetchTasks();

      setTimeout(() => setMessage(undefined), 3000);
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Failed to snooze task"}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditPriority(task.priority);
    setEditVisibility(task.visibility || "owner_only");
    // Convert ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
    if (task.due_at) {
      const date = new Date(task.due_at);
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      setEditDueAt(localDate.toISOString().slice(0, 16));
    } else {
      setEditDueAt("");
    }
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingTask(null);
    setEditTitle("");
    setEditDescription("");
    setEditPriority(3);
    setEditDueAt("");
    setEditVisibility("owner_only");
  };

  const handleSaveEdit = async () => {
    if (!editingTask) return;

    setSaving(true);

    try {
      // Convert datetime-local format back to ISO string
      const dueAtISO = editDueAt ? new Date(editDueAt).toISOString() : null;

      const res = await fetch("/api/tasks.update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: editingTask.id,
          title: editTitle,
          description: editDescription,
          priority: editPriority,
          dueAt: dueAtISO,
          visibility: editVisibility
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to update task");
      }

      setMessage("✓ Task updated successfully");
      await fetchTasks();
      handleCloseEditModal();

      setTimeout(() => setMessage(undefined), 3000);
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Failed to update task"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteModal = (task: Task) => {
    setDeletingTask(task);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletingTask(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTask) return;

    setDeleting(true);

    try {
      const res = await fetch("/api/tasks.delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: deletingTask.id })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to delete task");
      }

      setMessage("✓ Task deleted successfully");
      await fetchTasks();
      handleCloseDeleteModal();

      setTimeout(() => setMessage(undefined), 3000);
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Failed to delete task"}`);
    } finally {
      setDeleting(false);
    }
  };

  const getPriorityColor = (priority: number | null) => {
    if (priority === null) return "#94a3b8"; // slate for unsorted
    if (priority === 1) return "#ef4444"; // red for Today
    if (priority === 2) return "#f59e0b"; // amber for This Week
    if (priority >= 3 && priority <= 5) return "#3b82f6"; // blue
    return "#6b7280"; // gray for others
  };

  const getPriorityLabel = (priority: number) => {
    if (priority === 5) return "Urgent";
    if (priority === 4) return "High";
    if (priority === 3) return "Med";
    if (priority === 2) return "Low";
    return "Info";
  };

  const formatDueDate = (dueAt: string | null) => {
    if (!dueAt) return null;
    const date = new Date(dueAt);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < -60) {
      return { text: "Overdue", color: "#ef4444" };
    } else if (diffMins < 0) {
      return { text: `${Math.abs(diffMins)}m overdue`, color: "#ef4444" };
    } else if (diffMins < 60) {
      return { text: `${diffMins}m`, color: "#f59e0b" };
    } else if (diffHours < 24) {
      return { text: `${diffHours}h`, color: "#3b82f6" };
    } else if (diffDays < 7) {
      return { text: `${diffDays}d`, color: "#6b7280" };
    } else {
      return { text: date.toLocaleDateString(), color: "#6b7280" };
    }
  };

  const getPriorityLabelText = (priority: number | null): string => {
    if (priority === null) return "Unsorted";
    const label = priorityLabels.find(l => l.priority_number === priority);
    if (label) return label.label;
    if (priority === 1) return "Today";
    if (priority === 2) return "This Week";
    return `Priority ${priority}`;
  };

  const groupedTasks = React.useMemo(() => {
    const groups = new Map<number | null, Task[]>();

    filteredTasks.forEach(task => {
      const priority = task.priority;
      if (!groups.has(priority)) {
        groups.set(priority, []);
      }
      groups.get(priority)!.push(task);
    });

    groups.forEach((taskList, priority) => {
      taskList.sort((a, b) => {
        const orderA = a.sort_order ?? 0;
        const orderB = b.sort_order ?? 0;
        return orderA - orderB;
      });
    });

    const priorityOrder: (number | null)[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, null];
    return priorityOrder
      .filter(p => groups.has(p))
      .map(p => ({
        priority: p,
        label: getPriorityLabelText(p),
        tasks: groups.get(p)!
      }));
  }, [filteredTasks, priorityLabels]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setOverId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeTaskId = active.id as string;
    const overTaskId = over.id as string;

    // Check if dropping on priority section header
    const priorityDropMatch = overTaskId.match(/^priority-(\d+|null)$/);
    if (priorityDropMatch) {
      const targetPriority = priorityDropMatch[1] === 'null' ? null : Number(priorityDropMatch[1]);
      await handleReorder(activeTaskId, targetPriority, []);
      return;
    }

    // Dropping on another task - calculate new sort orders
    const activeTask = tasks.find(t => t.id === activeTaskId);
    const overTask = tasks.find(t => t.id === overTaskId);

    if (!activeTask || !overTask) return;

    const targetPriority = overTask.priority;
    const zoneTasks = tasks.filter(t => t.priority === targetPriority);

    const updates: { id: string; sort_order: number }[] = [];
    const overIndex = zoneTasks.findIndex(t => t.id === overTaskId);

    let newOrder = 0;
    zoneTasks.forEach((task, index) => {
      if (task.id === activeTaskId) return;
      if (index === overIndex) {
        updates.push({ id: activeTaskId, sort_order: newOrder++ });
      }
      updates.push({ id: task.id, sort_order: newOrder++ });
    });

    if (!updates.find(u => u.id === activeTaskId)) {
      updates.push({ id: activeTaskId, sort_order: newOrder });
    }

    await handleReorder(activeTaskId, targetPriority, updates);
  };

  const handleReorder = async (taskId: string, targetPriority: number | null, updates: { id: string; sort_order: number }[]) => {
    try {
      const res = await fetch("/api/tasks.reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, targetPriority, updates })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reorder task");
      }

      await fetchTasks();
      setMessage("✓ Task moved successfully");
      setTimeout(() => setMessage(undefined), 2000);
    } catch (err) {
      console.error("Reorder error:", err);
      setMessage(`Error: ${err instanceof Error ? err.message : "Failed to reorder"}`);
    }
  };

  // Swipe gesture handlers
  const handleSwipeStart = (e: React.MouseEvent | React.TouchEvent, taskId: string) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setSwipeTaskId(taskId);
    setSwipeStartX(clientX);
    setSwipeOffset(0);
  };

  const handleSwipeMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!swipeTaskId) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const delta = clientX - swipeStartX;
    setSwipeOffset(delta);
  };

  const handleSwipeEnd = () => {
    const SWIPE_THRESHOLD = 200; // Increased from 100px - need to swipe ~50% of card width
    if (Math.abs(swipeOffset) > SWIPE_THRESHOLD && swipeTaskId) {
      // Swipe threshold reached - trigger action based on direction
      if (swipeOffset > 0) {
        // Swipe right - mark as complete
        const task = tasks.find(t => t.id === swipeTaskId);
        if (task) {
          handleComplete(task.id);
        }
      } else {
        // Swipe left - open snooze modal to let user choose duration
        const task = tasks.find(t => t.id === swipeTaskId);
        if (task) {
          openSnoozeModal(task);
        }
      }
    }
    setSwipeTaskId(null);
    setSwipeOffset(0);
    setSwipeStartX(0);
  };

  // Sortable task card component with drag handle and swipe
  function SortableTaskCard({ task }: { task: Task }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: task.id });

    const dueInfo = formatDueDate(task.due_at);
    const isLoading = actionLoading === task.id;
    const isSwipingThis = swipeTaskId === task.id;
    const currentSwipeOffset = isSwipingThis ? swipeOffset : 0;

    // Combine drag-and-drop transform with swipe offset
    const combinedTransform = transform
      ? `${CSS.Transform.toString(transform)} translateX(${currentSwipeOffset}px)`
      : `translateX(${currentSwipeOffset}px)`;

    const style: React.CSSProperties = {
      transform: combinedTransform,
      transition: isSwipingThis ? 'none' : transition,
      opacity: isDragging ? 0.5 : 1,
      position: 'relative',
    };

    const dragHandleStyle: React.CSSProperties = {
      cursor: 'grab',
      touchAction: 'none',
      padding: spacing.sm,
      display: 'flex',
      alignItems: 'center',
      color: resolvedColors.text.tertiary,
      fontSize: '20px',
      userSelect: 'none',
    };

    // Prevent swipe from starting on buttons or drag handle
    const stopSwipePropagation = (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
    };

    return (
      <div ref={setNodeRef} style={style}>
        {/* Swipe action indicators */}
        {isSwipingThis && (
          <>
            {/* Right swipe indicator (Complete) - only show when swiping right */}
            {currentSwipeOffset > 0 && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#22c55e',
                opacity: Math.min(currentSwipeOffset / 200, 1),
                borderRadius: '12px 0 0 12px',
                zIndex: 0,
              }}>
                <span style={{ color: 'white', fontSize: '24px' }}>✓</span>
              </div>
            )}

            {/* Left swipe indicator (Snooze) - only show when swiping left */}
            {currentSwipeOffset < 0 && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f59e0b',
                opacity: Math.min(Math.abs(currentSwipeOffset) / 200, 1),
                borderRadius: '0 12px 12px 0',
                zIndex: 0,
              }}>
                <span style={{ color: 'white', fontSize: '24px' }}>💤</span>
              </div>
            )}
          </>
        )}

        <Card
          onMouseDown={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('[data-drag-handle]')) {
              return;
            }
            handleSwipeStart(e, task.id);
          }}
          onTouchStart={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('[data-drag-handle]')) {
              return;
            }
            handleSwipeStart(e, task.id);
          }}
          onMouseMove={handleSwipeMove}
          onTouchMove={handleSwipeMove}
          onMouseUp={handleSwipeEnd}
          onTouchEnd={handleSwipeEnd}
          onMouseLeave={() => {
            if (isSwipingThis) handleSwipeEnd();
          }}
          style={{ zIndex: 1, position: 'relative' }}
        >
          <div style={{ padding: '6px 8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Drag handle - compact */}
            <div
              {...attributes}
              {...listeners}
              data-drag-handle="true"
              style={{
                cursor: 'grab',
                touchAction: 'none',
                padding: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                color: resolvedColors.text.tertiary,
                fontSize: '14px',
                userSelect: 'none',
              }}
              onMouseDown={stopSwipePropagation}
              onTouchStart={stopSwipePropagation}
            >
              ⋮⋮
            </div>

            {/* Task content - single row layout */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Title - truncate if too long */}
              <h3 style={{
                fontSize: '13px',
                fontWeight: 500,
                color: resolvedColors.text.primary,
                margin: 0,
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {task.title}
              </h3>

              {/* Badges - compact */}
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                {dueInfo && (
                  <Badge color={dueInfo.color} size="sm" style={{ fontSize: '10px', padding: '1px 6px' }}>
                    {dueInfo.text}
                  </Badge>
                )}
                <Badge
                  color={getPriorityColor(task.priority)}
                  size="sm"
                  style={{ fontSize: '10px', padding: '1px 6px' }}
                >
                  {task.priority !== null ? getPriorityLabel(task.priority) : 'Unsorted'}
                </Badge>
              </div>

              {/* Actions - icon buttons only */}
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center',
                  flexShrink: 0
                }}
                onMouseDown={stopSwipePropagation}
                onTouchStart={stopSwipePropagation}
              >
                <button
                  onClick={() => openSnoozeModal(task)}
                  disabled={isLoading}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: 'white',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.5 : 1,
                  }}
                  title="Snooze"
                >
                  💤
                </button>
                <button
                  onClick={() => handleComplete(task.id)}
                  disabled={isLoading}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    border: '1px solid #22c55e',
                    borderRadius: '4px',
                    background: '#22c55e',
                    color: 'white',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.5 : 1,
                  }}
                  title="Complete"
                >
                  ✓
                </button>
                <button
                  onClick={() => handleOpenEditModal(task)}
                  disabled={isLoading}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: 'white',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.5 : 1,
                  }}
                  title="Edit/More options"
                >
                  ⋯
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: spacing.xl }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: resolvedColors.text.primary,
            margin: 0,
            marginBottom: spacing.xs
          }}>
            Pool
          </h1>
          <p style={{
            fontSize: '14px',
            color: resolvedColors.text.secondary,
            margin: 0
          }}>
            All your tasks in one place
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <div style={{ padding: spacing.md }}>
                <Skeleton width="60%" height={20} style={{ marginBottom: spacing.sm }} />
                <Skeleton width="100%" height={16} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <div style={{ marginBottom: spacing.xl }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: resolvedColors.text.primary,
            margin: 0
          }}>
            Pool
          </h1>
        </div>
        <Card>
          <div style={{ padding: spacing.xl, textAlign: 'center' }}>
            <p style={{ color: resolvedColors.text.secondary }}>
              Please sign in to view your tasks.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: spacing.xl }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: resolvedColors.text.primary,
          margin: 0,
          marginBottom: spacing.xs
        }}>
          Pool
        </h1>
        <p style={{
          fontSize: '14px',
          color: resolvedColors.text.secondary,
          margin: 0
        }}>
          {filteredTasks.length} of {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filter Controls */}
      <div style={{
        display: 'flex',
        gap: spacing.md,
        marginBottom: spacing.lg,
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="md"
          />
        </div>
        <div style={{ minWidth: '160px' }}>
          <Select
            options={statusFilterOptions}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            size="md"
          />
        </div>
        <div style={{ minWidth: '180px' }}>
          <Select
            options={filterOptions}
            value={priorityFilter}
            onChange={(value) => setPriorityFilter(value)}
            size="md"
          />
        </div>
      </div>

      {/* Status Messages */}
      {message && (
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            background: message.startsWith("Error") ? "#fee" : "#efe",
            color: message.startsWith("Error") ? "#c00" : "#060",
            marginBottom: spacing.lg,
            fontSize: 14
          }}
        >
          {message}
        </div>
      )}

      {tasks.length === 0 ? (
        <Card>
          <div style={{ padding: spacing.xl, textAlign: 'center' }}>
            <p style={{
              color: resolvedColors.text.secondary,
              marginBottom: spacing.lg
            }}>
              No open tasks. Use the + Add button to create your first task.
            </p>
          </div>
        </Card>
      ) : filteredTasks.length === 0 ? (
        <Card>
          <div style={{ padding: spacing.xl, textAlign: 'center' }}>
            <p style={{
              color: resolvedColors.text.secondary,
              marginBottom: spacing.sm
            }}>
              No tasks match your filters.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setPriorityFilter("all");
                setStatusFilter("open");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {groupedTasks.map(({ priority, label, tasks: priorityTasks }) => (
              <div key={`priority-${priority}`}>
                {/* Priority Section Header - compact */}
                <div
                  id={`priority-${priority}`}
                  style={{
                    padding: '6px 10px',
                    marginBottom: '4px',
                    borderLeft: `3px solid ${getPriorityColor(priority)}`,
                    backgroundColor: resolvedColors.bg.secondary,
                    borderRadius: '4px',
                  }}
                >
                  <h2 style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: resolvedColors.text.primary,
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {label} ({priorityTasks.length})
                  </h2>
                </div>

                {/* Sortable task list - compact spacing */}
                <SortableContext
                  items={priorityTasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {priorityTasks.map((task) => (
                      <SortableTaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </SortableContext>
              </div>
            ))}
          </div>

          {/* Drag Overlay - shows the dragged task */}
          <DragOverlay>
            {activeId ? (
              (() => {
                const activeTask = tasks.find(t => t.id === activeId);
                if (!activeTask) return null;

                const dueInfo = formatDueDate(activeTask.due_at);

                return (
                  <Card style={{
                    opacity: 0.9,
                    cursor: 'grabbing',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    transform: 'rotate(-2deg)'
                  }}>
                    <div style={{ padding: '6px 8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{
                        padding: '2px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        color: resolvedColors.text.tertiary,
                        fontSize: '14px',
                      }}>
                        ⋮⋮
                      </div>

                      <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <h3 style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: resolvedColors.text.primary,
                          margin: 0,
                          flex: 1,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {activeTask.title}
                        </h3>

                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                          {dueInfo && (
                            <Badge color={dueInfo.color} size="sm" style={{ fontSize: '10px', padding: '1px 6px' }}>
                              {dueInfo.text}
                            </Badge>
                          )}
                          <Badge
                            color={getPriorityColor(activeTask.priority)}
                            size="sm"
                            style={{ fontSize: '10px', padding: '1px 6px' }}
                          >
                            {activeTask.priority !== null ? getPriorityLabel(activeTask.priority) : 'Unsorted'}
                          </Badge>
                        </div>

                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                          <button style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            background: 'white',
                          }}>
                            💤
                          </button>
                          <button style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            border: '1px solid #22c55e',
                            borderRadius: '4px',
                            background: '#22c55e',
                            color: 'white',
                          }}>
                            ✓
                          </button>
                          <button style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            background: 'white',
                          }}>
                            ⋯
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })()
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Edit Modal */}
      <Modal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        size="md"
      >
        <ModalHeader>
          Edit Task
        </ModalHeader>
        <div style={{ padding: spacing.lg }}>
          <div style={{ marginBottom: spacing.md }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: resolvedColors.text.primary,
              marginBottom: spacing.xs
            }}>
              Title
            </label>
            <Input
              type="text"
              placeholder="Task title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              disabled={saving}
              size="md"
            />
          </div>
          <div style={{ marginBottom: spacing.md }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: resolvedColors.text.primary,
              marginBottom: spacing.xs
            }}>
              Description
            </label>
            <Textarea
              placeholder="Optional description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              disabled={saving}
              rows={3}
            />
          </div>
          <div style={{ marginBottom: spacing.md }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: resolvedColors.text.primary,
              marginBottom: spacing.xs
            }}>
              Priority
            </label>
            <Select
              options={priorityOptions}
              value={String(editPriority)}
              onChange={(value) => setEditPriority(Number(value))}
              disabled={saving}
              size="md"
            />
          </div>
          <div style={{ marginBottom: spacing.md }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: resolvedColors.text.primary,
              marginBottom: spacing.xs
            }}>
              Visibility
            </label>
            <Select
              options={visibilityOptions}
              value={editVisibility}
              onChange={(value) => setEditVisibility(value)}
              disabled={saving}
              size="md"
            />
            <p style={{
              fontSize: '12px',
              color: resolvedColors.text.secondary,
              marginTop: spacing.xs,
              marginBottom: 0
            }}>
              Controls who can see this task in the pool
            </p>
          </div>
          <div style={{ marginBottom: spacing.md }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: resolvedColors.text.primary,
              marginBottom: spacing.xs
            }}>
              Due Date & Time
            </label>
            <input
              type="datetime-local"
              value={editDueAt}
              onChange={(e) => setEditDueAt(e.target.value)}
              disabled={saving}
              style={{
                width: '100%',
                padding: spacing.sm,
                fontSize: '14px',
                borderRadius: '8px',
                border: `1px solid ${resolvedColors.border.default}`,
                backgroundColor: resolvedColors.surface.default,
                color: resolvedColors.text.primary
              }}
            />
            <p style={{
              fontSize: '12px',
              color: resolvedColors.text.secondary,
              marginTop: spacing.xs,
              marginBottom: 0
            }}>
              Leave empty to remove due date
            </p>
          </div>
        </div>
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={handleCloseEditModal}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveEdit}
            disabled={saving || !editTitle.trim()}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        size="sm"
      >
        <ModalHeader>
          Delete Task
        </ModalHeader>
        <div style={{ padding: spacing.lg }}>
          <p style={{
            fontSize: '14px',
            color: resolvedColors.text.primary,
            marginBottom: spacing.sm
          }}>
            Are you sure you want to delete this task?
          </p>
          <p style={{
            fontSize: '16px',
            fontWeight: 600,
            color: resolvedColors.text.primary,
            marginBottom: spacing.sm
          }}>
            {deletingTask?.title}
          </p>
          <p style={{
            fontSize: '13px',
            color: resolvedColors.text.secondary,
            marginBottom: 0
          }}>
            This action cannot be undone. The task and all associated data will be permanently removed.
          </p>
        </div>
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={handleCloseDeleteModal}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Task'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Snooze Modal */}
      <SnoozeModal
        task={snoozeTask}
        open={snoozeModalOpen}
        onClose={closeSnoozeModal}
        onSnooze={(options) => snoozeTask && handleSnooze(snoozeTask.id, options)}
      />

      {/* Propose Date Picker Modal */}
      <DatePicker
        open={proposeDateModalOpen}
        onClose={() => {
          setProposeDateModalOpen(false);
          setProposingTask(null);
        }}
        onSelect={handleProposeDateSelect}
        title="Propose for which date?"
      />
    </div>
  );
}
