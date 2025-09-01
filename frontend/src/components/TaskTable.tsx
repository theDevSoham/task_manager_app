import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, LogOut, Plus, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import type { Task } from "@/types/types";
import TaskModal from "./TaskModal";
import { useAuth } from "@/hooks/useAuth";

interface TaskTableProps {
  tasks: Task[];
  loading?: boolean;
  onLogout?: () => void;
  onTaskSubmit?: (task: Partial<Task>, mode: "add" | "edit") => void;
  onBulkTaskSubmit?: (file: File) => void;
  onDeleteTask?: (taskId: number) => void;
  onExportRequest?: () => void;
}

export const TaskTable = ({
  tasks,
  loading = false,
  onLogout,
  onTaskSubmit,
  onBulkTaskSubmit,
  onDeleteTask,
  onExportRequest,
}: TaskTableProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "bulk">("add");
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  const { user } = useAuth();

  const handleAdd = () => {
    setModalMode("add");
    setSelectedTask(undefined);
    setIsModalOpen(true);
  };

  const handleBulkAdd = () => {
    setModalMode("bulk");
    setSelectedTask(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setModalMode("edit");
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = (taskId: number) => {
    onDeleteTask?.(taskId);
  };

  const onExportCSV = () => {
    if (onExportRequest) {
      onExportRequest();
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background text-foreground p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-muted-foreground">
              Here's a list of tasks you created.
            </p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Avatar className="cursor-pointer hover:scale-105 transition-transform shadow-md">
                <AvatarImage src="/avatar.png" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-40 bg-popover text-popover-foreground border border-border"
            >
              <Button
                variant="ghost"
                className="w-full flex items-center gap-2 text-destructive"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4" /> Logout
              </Button>
              <Button
                className="w-full flex items-center gap-2 text-destructive"
                onClick={onExportCSV}
              >
                Export CSV
              </Button>
            </PopoverContent>
          </Popover>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
          <div className="flex gap-2">
            <Input placeholder="Filter tasks..." className="w-64" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Task
            </Button>
            <Button onClick={handleBulkAdd} size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Bulk Task
            </Button>
          </div>
        </div>

        {/* Loader */}
        {loading && (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="animate-spin h-10 w-10 text-muted-foreground" />
          </div>
        )}

        {/* Empty */}
        {!loading && tasks.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <p className="text-lg font-medium">No tasks yet ✨</p>
              <p className="text-sm mt-1">Add new tasks to get started.</p>
              <Button onClick={handleAdd} size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add Task
              </Button>
            </motion.div>
          </div>
        )}

        {/* Task List */}
        {!loading && tasks.length > 0 && (
          <div className="flex-1 overflow-x-auto rounded-xl shadow bg-card border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableCell className="p-3 text-center">Task</TableCell>
                  <TableCell className="p-3 text-center">Deadline</TableCell>
                  <TableCell className="p-3 text-center">Title</TableCell>
                  <TableCell className="p-3 text-center">Description</TableCell>
                  <TableCell className="p-3 text-center">Action</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className="hover:bg-muted/30 transition"
                  >
                    <TableCell className="p-3 text-center">{task.id}</TableCell>
                    <TableCell className="p-3 text-center">
                      <Badge variant="secondary" className="mr-2">
                        {task.effortDays} Days
                      </Badge>
                    </TableCell>
                    <TableCell className="p-3 text-center">
                      {task.title}
                    </TableCell>
                    <TableCell className="p-3 text-center">
                      {task.description}
                    </TableCell>
                    <TableCell className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(task)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add/Edit Task Modal */}
      {(modalMode === "add" || modalMode === "edit") && (
        <TaskModal
          isOpen={isModalOpen}
          mode={modalMode} // ✅ narrowed to "add" | "edit"
          initialData={selectedTask}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(task) => {
            onTaskSubmit?.(task, modalMode);
            setIsModalOpen(false);
          }}
        />
      )}

      {/* Bulk Upload Modal */}
      {modalMode === "bulk" && (
        <TaskModal
          isOpen={isModalOpen}
          mode="bulk" // ✅ narrowed to "bulk"
          onClose={() => setIsModalOpen(false)}
          onSubmit={(file) => {
            // file is File
            onBulkTaskSubmit?.(file);
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
};
