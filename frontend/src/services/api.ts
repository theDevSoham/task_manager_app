// api.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE;

const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}/tasks`,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function fetchTasks(token: string) {
  return (
    await axiosClient.get(`/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  ).data;
}

export async function addTask(
  token: string,
  task: {
    title: string;
    description: string;
    effortDays: number;
    dueDate: string;
  }
) {
  return (
    await axiosClient.post(`/add`, task, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  ).data;
}

export async function editTask(
  token: string,
  taskId: string,
  task: {
    title?: string;
    description?: string;
    effortDays?: number;
    dueDate?: string;
  }
) {
  return (
    await axiosClient.patch(`/task/edit/${taskId}`, task, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  ).data;
}

export async function deleteTask(token: string, taskId: string) {
  return (
    await axiosClient.delete(`/task/delete/${taskId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  ).data;
}
