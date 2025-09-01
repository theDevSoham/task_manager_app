import { useState, useEffect } from "react";
import { AuthModal } from "@/components/AuthModal";
import { TaskTable } from "@/components/TaskTable";
import { useAuth } from "@/hooks/useAuth";
import { fetchTasks } from "@/services/api";
import { Button } from "@/components/ui/button";
import type { Task } from "./types/types";

const App = () => {
  const { user, token, login, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(!user);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    console.log("Token: ", token);
    if (!token) return;
    fetchTasks(token).then((res) => setTasks(res.data.tasks));
  }, [token]);

  const handleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (!user) {
    return (
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(currUser, currToken) => {
          console.log("User: ", currUser);
          login(currUser, currToken);
          setShowAuthModal(false);
        }}
      />
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between mb-4">
        <h1>My Tasks</h1>
        <Button onClick={logout}>Logout</Button>
      </div>
      {!showAuthModal && (
        <TaskTable tasks={tasks} selected={selected} onSelect={handleSelect} />
      )}
    </div>
  );
};

export default App;
