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

/**
 * Bulk upload tasks using a file (CSV or Excel).
 */
export async function addBulk(token: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return (
    await axios.post(`${API_BASE_URL}/tasks/add/bulk`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    })
  ).data;
}

/**
 * Export tasks as Excel (downloads the file).
 */
export async function exportCSV(token: string) {
  const response = await axiosClient.get(`/export/excel`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob", // get binary data
  });

  // Create a blob link to download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "tasks.xlsx");
  document.body.appendChild(link);
  link.click();
  link.remove();
}
