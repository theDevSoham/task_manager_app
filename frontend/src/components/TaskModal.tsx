import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import type { Task } from "@/types/types";

// Discriminated union for strict typing
type TaskModalProps =
  | {
      isOpen: boolean;
      mode: "add" | "edit";
      initialData?: Partial<Task>;
      onClose: () => void;
      onSubmit: (task: Partial<Task>) => void;
    }
  | {
      isOpen: boolean;
      mode: "bulk";
      initialData?: never; // no initial data in bulk mode
      onClose: () => void;
      onSubmit: (file: File) => void;
    };

export default function TaskModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmit,
}: TaskModalProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    description: "",
    effortDays: 1,
    dueDate: new Date().toISOString(),
  });

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData(initialData);
    } else if (mode === "add") {
      setFormData({
        title: "",
        description: "",
        effortDays: 1,
        dueDate: new Date().toISOString(),
      });
    }
    if (mode === "bulk") {
      setFile(null);
    }
  }, [mode, initialData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "effortDays" ? Number(value) : value,
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        dueDate: date.toISOString(),
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (mode === "bulk") {
      if (file) {
        onSubmit(file);
      }
    } else {
      onSubmit(formData);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add"
              ? "Add Task"
              : mode === "edit"
              ? "Update Task"
              : "Bulk Upload Tasks"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Fill in the details to add a new task."
              : mode === "edit"
              ? "Modify the details of this task."
              : "Upload a .xlsx file to create multiple tasks at once."}
          </DialogDescription>
        </DialogHeader>

        {/* Form content switches depending on mode */}
        {mode !== "bulk" ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter task title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter task description"
              />
            </div>

            <div>
              <Label htmlFor="effortDays">Effort (Days)</Label>
              <Input
                id="effortDays"
                type="number"
                min="1"
                name="effortDays"
                value={formData.effortDays}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? (
                      format(new Date(formData.dueDate), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      formData.dueDate ? new Date(formData.dueDate) : undefined
                    }
                    onSelect={handleDateChange}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Label htmlFor="file">Upload File</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
            />
            {file && (
              <p className="text-sm text-gray-600">
                Selected file: <strong>{file.name}</strong>
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {mode === "add"
              ? "Add Task"
              : mode === "edit"
              ? "Update Task"
              : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
