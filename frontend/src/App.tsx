import { useState, useEffect } from "react";
import { AuthModal } from "@/components/AuthModal";
import { TaskTable } from "@/components/TaskTable";
import { useAuth } from "@/hooks/useAuth";
import {
  addBulk,
  addTask,
  deleteTask,
  editTask,
  exportCSV,
  fetchTasks,
} from "@/services/api";
import type { Task } from "./types/types";
import { AlertModal } from "./components/AlertModal";

const App = () => {
  const { user, token, login, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(!user);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteSignature, setDeleteSignature] = useState({
    openModal: false,
    taskId: "",
  });

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetchTasks(token)
      .then((res) => {
        setTasks(res.data as Task[]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const deleteConfirm = async () => {
    setLoading(true);
    try {
      const res = await deleteTask(token as string, deleteSignature.taskId);
      if (!res?.success) {
        return alert("Failed to delete task: " + res?.message);
      }

      alert(res?.message);
      setTasks((prev) => prev.filter((item) => item.id !== res?.data?.id));
      setDeleteSignature({ openModal: false, taskId: "" });
    } catch (error) {
      console.error(error);
      alert("Problem happened on server side. Please try again");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(currUser, currToken) => {
          login(currToken, currUser);
          setShowAuthModal(false);
        }}
      />
    );
  }

  return (
    <>
      <TaskTable
        tasks={tasks}
        loading={loading}
        onLogout={logout}
        onExportRequest={async () => {
          console.log("Exporting...");
          setLoading(true);
          try {
            await exportCSV(token as string);
          } catch (error) {
            console.log(error);
            alert("Failed to upload data");
          } finally {
            setLoading(false);
          }
        }}
        onTaskSubmit={async (task, mode) => {
          setLoading(true);
          switch (mode) {
            case "add": {
              try {
                const res = await addTask(token as string, {
                  title: task.title as string,
                  description: task.description as string,
                  effortDays: task.effortDays as number,
                  dueDate: task.dueDate as string,
                });

                if (!res?.success) {
                  return alert("Failed to add task: " + res?.message);
                }

                alert(res?.message);
                setTasks((prev) => [res.data, ...prev]);
              } catch (error) {
                console.log(error);
                alert("Problem happened on server side. Please try again");
              } finally {
                setLoading(false);
              }
              break;
            }

            case "edit": {
              try {
                const res = await editTask(
                  token as string,
                  (task.id as number)?.toString(),
                  task
                );

                if (!res?.success) {
                  return alert("Failed to add task: " + res?.message);
                }

                alert(res?.message);
                setTasks((prev) =>
                  prev.map((item) =>
                    item.id === res.data.id ? res.data : item
                  )
                );
              } catch (error) {
                console.log(error);
                alert("Problem happened on server side. Please try again");
              } finally {
                setLoading(false);
              }
              break;
            }

            default:
              break;
          }
        }}
        onBulkTaskSubmit={async (file) => {
          setLoading(true);
          try {
            const res = await addBulk(token as string, file);

            if (!res?.success) {
              return alert("Failed to upload data: " + res?.message);
            }

            alert(res?.message);
            const updatedTasks = await fetchTasks(token as string);

            setTasks(updatedTasks?.data as Task[]);
          } catch (error) {
            console.log(error);
            alert("Bulk submit failed. Please try again later");
          } finally {
            setLoading(false);
          }
        }}
        onDeleteTask={async (taskId: number) => {
          setDeleteSignature({
            openModal: true,
            taskId: taskId.toString(),
          });
        }}
      />

      <AlertModal
        open={deleteSignature.openModal}
        onOpenChange={(open) =>
          setDeleteSignature((prev) => ({ ...prev, openModal: open }))
        }
        title="Delete Task?"
        description="This action cannot be undone. Are you sure you want to delete this task?"
        okText="Delete"
        cancelText="Cancel"
        onOk={deleteConfirm}
        onCancel={() => setDeleteSignature({ openModal: false, taskId: "" })}
        closable={false}
      />
    </>
  );
};

export default App;
