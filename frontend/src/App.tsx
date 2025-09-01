import { useRef, useState } from "react";
import { AuthModal } from "@/components/AuthModal";
import { TaskTable, type TaskTableRef } from "@/components/TaskTable";
import { useAuth } from "@/hooks/useAuth";
import {
  addBulk,
  addTask,
  deleteTask,
  editTask,
  exportCSV,
} from "@/services/api";
import { AlertModal } from "./components/AlertModal";

const App = () => {
  const { user, token, login, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(!user);
  const [deleteSignature, setDeleteSignature] = useState({
    openModal: false,
    taskId: "",
  });
  const taskTableRef = useRef<TaskTableRef>(null);

  const handleReloadTasks = () => {
    taskTableRef.current?.loadTasks(); // triggers loadTasks in child
  };

  const deleteConfirm = async () => {
    try {
      const res = await deleteTask(token as string, deleteSignature.taskId);
      if (!res?.success) {
        return alert("Failed to delete task: " + res?.message);
      }

      alert(res?.message);
      setDeleteSignature({ openModal: false, taskId: "" });
      handleReloadTasks();
    } catch (error) {
      console.error(error);
      alert("Problem happened on server side. Please try again");
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
        onLogout={logout}
        onExportRequest={async () => {
          console.log("Exporting...");
          try {
            await exportCSV(token as string);
          } catch (error) {
            console.log(error);
            alert("Failed to upload data");
          }
        }}
        onTaskSubmit={async (task, mode) => {
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
                handleReloadTasks();
              } catch (error) {
                console.log(error);
                alert("Problem happened on server side. Please try again");
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
                handleReloadTasks();
              } catch (error) {
                console.log(error);
                alert("Problem happened on server side. Please try again");
              }
              break;
            }

            default:
              break;
          }
        }}
        onBulkTaskSubmit={async (file) => {
          try {
            const res = await addBulk(token as string, file);

            if (!res?.success) {
              return alert("Failed to upload data: " + res?.message);
            }

            alert(res?.message);
            handleReloadTasks();
          } catch (error) {
            console.log(error);
            alert("Bulk submit failed. Please try again later");
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
