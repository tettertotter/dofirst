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
  type SelectOption
} from "@todaypool/design-system";
import { SnoozeChips, SnoozeModal, useSnooze } from "@todaypool/ui";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: number;
  due_at: string | null;
  status: string;
  visibility: string;
  created_at: string;
  pool_id: string;
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

  const priorityOptions: SelectOption[] = [
    { value: "5", label: "Urgent (5)" },
    { value: "4", label: "High (4)" },
    { value: "3", label: "Medium (3)" },
    { value: "2", label: "Low (2)" },
    { value: "1", label: "Info (1)" }
  ];

  const filterOptions: SelectOption[] = [
    { value: "all", label: "All Priorities" },
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

    // Priority filter
    const matchesPriority = priorityFilter === "all" ||
      task.priority === Number(priorityFilter);

    // Status filter
    const matchesStatus = statusFilter === "all" ||
      task.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Snooze modal state
  const { modalTask, openSnoozeModal, closeSnoozeModal, handleSnooze } = useSnooze({
    onSuccess: async () => {
      setMessage("✓ Task snoozed successfully");
      await fetchTasks();
      setTimeout(() => setMessage(undefined), 3000);
    },
    onError: (error) => {
      setMessage(`Error: ${error}`);
    },
  });

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
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setMessage(`Error: ${err instanceof Error ? err.message : "Failed to load tasks"}`);
    } finally {
      setLoading(false);
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

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return "#ef4444"; // red
    if (priority === 3) return "#f59e0b"; // amber
    return "#6b7280"; // gray
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          {filteredTasks.map((task) => {
            const dueInfo = formatDueDate(task.due_at);
            const isLoading = actionLoading === task.id;

            return (
              <Card key={task.id}>
                <div style={{ padding: spacing.md }}>
                  {/* Header: Title + Priority + Due */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: spacing.sm
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: resolvedColors.text.primary,
                      margin: 0,
                      flex: 1
                    }}>
                      {task.title}
                    </h3>
                    <div style={{ display: 'flex', gap: spacing.xs, alignItems: 'center' }}>
                      <Badge
                        color={getPriorityColor(task.priority)}
                        size="sm"
                      >
                        {getPriorityLabel(task.priority)}
                      </Badge>
                      {dueInfo && (
                        <Badge color={dueInfo.color} size="sm">
                          {dueInfo.text}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p style={{
                      fontSize: '14px',
                      color: resolvedColors.text.secondary,
                      margin: 0,
                      marginBottom: spacing.sm
                    }}>
                      {task.description}
                    </p>
                  )}

                  {/* Actions: Edit + Delete + Snooze + Complete */}
                  <div style={{
                    display: 'flex',
                    gap: spacing.sm,
                    marginTop: spacing.md,
                    flexWrap: 'wrap'
                  }}>
                    <Button
                      onClick={() => handleOpenEditModal(task)}
                      variant="secondary"
                      size="sm"
                      disabled={isLoading}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleOpenDeleteModal(task)}
                      variant="danger"
                      size="sm"
                      disabled={isLoading}
                    >
                      Delete
                    </Button>
                    <SnoozeChips
                      taskId={task.id}
                      onQuickSnooze={(id, minutes) => handleQuickSnooze(id, minutes)}
                      onMoreOptions={(id) => openSnoozeModal(task)}
                      disabled={isLoading}
                    />
                    <Button
                      onClick={() => handleComplete(task.id)}
                      variant="success"
                      size="sm"
                      disabled={isLoading}
                    >
                      {isLoading ? <Spinner size="sm" /> : "✓ Done"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        size="md"
      >
        <ModalHeader onClose={handleCloseEditModal}>
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
                backgroundColor: resolvedColors.surface.primary,
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
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        size="sm"
      >
        <ModalHeader onClose={handleCloseDeleteModal}>
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
        task={modalTask}
        open={!!modalTask}
        onClose={closeSnoozeModal}
        onSnooze={handleSnooze}
      />
    </div>
  );
}
