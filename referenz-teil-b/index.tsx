"use client";

import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PawPrint, Plus, Trash2, Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────

type Category = "walk" | "feeding" | "grooming" | "play" | "health";
type Priority = "low" | "medium" | "high";

interface Task {
  id: string;
  title: string;
  dueTime: string;
  priority: Priority;
  category: Category;
  completed: boolean;
}

// ─── Constants ─────────────────────────────────────────────────

const API_URL = "http://localhost:3000";

const CATEGORIES: { value: Category; label: string; bg: string; text: string; border: string }[] = [
  { value: "walk", label: "Walk", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  { value: "feeding", label: "Feeding", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  { value: "grooming", label: "Grooming", bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  { value: "play", label: "Play", bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  { value: "health", label: "Health", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
];

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

// ─── Helpers ────────────────────────────────────────────────────

function formatTime(time: string): string {
  const [hourStr, minute] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${ampm}`;
}

function getDefaultTime(): string {
  const now = new Date();
  now.setMinutes(0);
  now.setHours(now.getHours() + 1);
  return `${String(now.getHours()).padStart(2, "0")}:00`;
}

// Backend kennt nur { id, title, completed }. Die restlichen Felder
// (dueTime, priority, category) gibt's dort noch nicht, deshalb setzen
// wir hier feste Platzhalter, damit die bestehende Optik erhalten bleibt.
function mapFromServer(t: { id: number; title: string; completed: boolean }): Task {
  return {
    id: String(t.id),
    title: t.title,
    completed: t.completed,
    dueTime: "12:00",
    priority: "medium",
    category: "walk",
  };
}

// ─── Component ────────────────────────────────────────────────

function Index() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [dueTime, setDueTime] = useState(getDefaultTime);
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<Category>("walk");

  // Schritt 1: Aufgaben beim Start vom Server laden
  useEffect(() => {
    fetch(`${API_URL}/tasks`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.map(mapFromServer));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fehler beim Laden der Tasks:", err);
        setLoading(false);
      });
  }, []);

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.dueTime.localeCompare(b.dueTime);
  });

  const completedCount = tasks.filter((t) => t.completed).length;

  function resetForm() {
    setTitle("");
    setDueTime(getDefaultTime());
    setPriority("medium");
    setCategory("walk");
  }

  // Schritt 2: Neue Aufgabe anlegen -> POST /tasks
  function handleSave() {
    const trimmed = title.trim();
    if (!trimmed) return;

    fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    })
      .then((res) => res.json())
      .then((created) => {
        setTasks((prev) => [...prev, mapFromServer(created)]);
        setDialogOpen(false);
        resetForm();
      })
      .catch((err) => console.error("Fehler beim Anlegen:", err));
  }

  // Schritt 3: Abhaken -> PUT /tasks/:id
  function toggleTask(id: string) {
    fetch(`${API_URL}/tasks/${id}`, { method: "PUT" })
      .then((res) => res.json())
      .then((updated) => {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? mapFromServer(updated) : t))
        );
      })
      .catch((err) => console.error("Fehler beim Abhaken:", err));
  }

  // Schritt 4: Löschen -> DELETE /tasks/:id
  function deleteTask(id: string) {
    fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" })
      .then(() => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      })
      .catch((err) => console.error("Fehler beim Löschen:", err));
  }

  const selectedCat = CATEGORIES.find((c) => c.value === category)!;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-xl items-center gap-2 px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <PawPrint className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight text-foreground">
              Walley&apos;s Tasks
            </h1>
            <p className="text-xs text-muted-foreground">
              {completedCount} of {tasks.length} done
            </p>
          </div>
        </div>
      </header>

      {/* Task List */}
      <main className="mx-auto max-w-xl px-4 pb-28 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-muted-foreground">Lädt...</p>
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <PawPrint className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">No tasks yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tap the + button to add your first task
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => toggleTask(task.id)}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => setDialogOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Add new task"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Add Task Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm gap-0 rounded-2xl border-border bg-card p-0 shadow-xl sm:rounded-2xl">
          <DialogHeader className="px-5 pb-2 pt-5 text-left">
            <DialogTitle className="text-base font-semibold">Add New Task</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 px-5 py-3">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="task-title" className="text-xs font-medium">
                Task title
              </Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="h-10 rounded-xl border-border bg-background"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                }}
                autoFocus
              />
            </div>

            {/* Due time */}
            <div className="space-y-1.5">
              <Label htmlFor="task-time" className="text-xs font-medium">
                Due time
              </Label>
              <Input
                id="task-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="h-10 rounded-xl border-border bg-background"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="h-10 rounded-xl border-border bg-background">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Category</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const active = category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                        active
                          ? cn(cat.bg, cat.text, cat.border)
                          : "border-transparent bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 px-5 pb-5 pt-2">
            <Button
              variant="outline"
              className="h-10 flex-1 rounded-xl border-border"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              className="h-10 flex-1 rounded-xl"
              disabled={!title.trim()}
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Task Card ─────────────────────────────────────────────────

function TaskCard({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const catConfig = CATEGORIES.find((c) => c.value === task.category)!;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors",
        task.completed && "bg-muted/40"
      )}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={onToggle}
        className="mt-0.5 h-5 w-5 shrink-0"
      />

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium leading-snug text-foreground",
            task.completed && "text-muted-foreground line-through"
          )}
        >
          {task.title}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatTime(task.dueTime)}
          </span>

          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none",
              catConfig.bg,
              catConfig.text
            )}
          >
            {catConfig.label}
          </span>
        </div>
      </div>

      <button
        onClick={onDelete}
        className="mt-0.5 shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        aria-label="Delete task"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Route Export ─────────────────────────────────────────────

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Walley's Tasks | Walley's Pet Task Tracker" },
      { name: "description", content: "Track and manage your pet care tasks with Walley's Pet Task Tracker." },
      { property: "og:title", content: "Walley's Pet Task Tracker" },
      { property: "og:description", content: "Track and manage your pet care tasks." },
    ],
  }),
  component: Index,
});
