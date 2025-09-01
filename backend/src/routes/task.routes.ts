import { Router, Request, Response } from "express";
import prisma from "../config/db";
import z from "zod";
import * as XLSX from "xlsx";
import multer from "multer";
import { sendResponse } from "../utils/response";
import { CustomRequest } from "../utils/types/customRequest";
import { authMiddleware } from "../middleware/auth.middleware";

// File upload config for bulk tasks
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// ✅ Task input validation
const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  effortDays: z.number().int().min(1, "Effort must be at least 1 day"),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
});

// --------------------- Routes ---------------------

// Add single task
router.post(
  "/add",
  authMiddleware,
  async (req: CustomRequest, res: Response) => {
    try {
      const parsed = taskSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendResponse(
          res,
          400,
          false,
          "Invalid input",
          parsed.error.issues
        );
      }

      const { title, description, effortDays, dueDate } = parsed.data;

      const task = await prisma.task.create({
        data: {
          title,
          description: description as string,
          effortDays,
          dueDate: new Date(dueDate),
          userId: req.user!.id,
        },
      });

      return sendResponse(res, 201, true, "Task created successfully", task);
    } catch (err) {
      console.error("Add task error:", err);
      return sendResponse(res, 500, false, "Internal server error");
    }
  }
);

// Bulk task upload from Excel/CSV
router.post(
  "/add/bulk",
  authMiddleware,
  upload.single("file"),
  async (req: CustomRequest, res: Response) => {
    try {
      if (!req.file) {
        return sendResponse(res, 400, false, "No file uploaded");
      }

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0] as string;
      const worksheet = workbook.Sheets[sheetName] as XLSX.WorkSheet;
      const data = XLSX.utils.sheet_to_json<any>(worksheet);

      console.log(data);

      const tasksToCreate = data.map((row) => ({
        title: row.Title,
        description: row.Description ?? "",
        effortDays: Number(row.EffortDays),
        dueDate: new Date(row.DueDate),
        userId: req.user!.id,
      }));

      const createdTasks = await prisma.task.createMany({
        data: tasksToCreate,
      });

      return sendResponse(res, 201, true, "Bulk tasks uploaded", createdTasks);
    } catch (err) {
      console.error("Bulk upload error:", err);
      return sendResponse(res, 500, false, "Internal server error");
    }
  }
);

// Get all tasks for the logged-in user
router.get(
  "/all",
  authMiddleware,
  async (req: CustomRequest, res: Response) => {
    try {
      const tasks = await prisma.task.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: "desc" },
      });

      return sendResponse(res, 200, true, "Tasks fetched successfully", tasks);
    } catch (err) {
      console.error("Fetch tasks error:", err);
      return sendResponse(res, 500, false, "Internal server error");
    }
  }
);

// Get single task by id
router.get(
  "/task/:id",
  authMiddleware,
  async (req: CustomRequest, res: Response) => {
    try {
      const id = Number(req.params.id);
      const task = await prisma.task.findFirst({
        where: { id, userId: req.user!.id },
      });

      if (!task) {
        return sendResponse(res, 404, false, "Task not found");
      }

      return sendResponse(res, 200, true, "Task fetched successfully", task);
    } catch (err) {
      console.error("Fetch task error:", err);
      return sendResponse(res, 500, false, "Internal server error");
    }
  }
);

// Edit task
router.patch(
  "/task/edit/:id",
  authMiddleware,
  async (req: CustomRequest, res: Response) => {
    try {
      const id = Number(req.params.id);
      const parsed = taskSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return sendResponse(
          res,
          400,
          false,
          "Invalid input",
          parsed.error.issues
        );
      }

      const updateData: any = {}; // Will only include fields that are defined

      if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
      if (parsed.data.description !== undefined)
        updateData.description = parsed.data.description;
      if (parsed.data.effortDays !== undefined)
        updateData.effortDays = parsed.data.effortDays;
      if (parsed.data.dueDate !== undefined)
        updateData.dueDate = new Date(parsed.data.dueDate);

      // No userId here, we never update userId

      const task = await prisma.task.update({
        where: { id, userId: req.user!.id },
        data: updateData,
      });

      return sendResponse(res, 200, true, "Task updated successfully", task);
    } catch (err: any) {
      if (err.code === "P2025") {
        return sendResponse(res, 404, false, "Task not found");
      }
      console.error("Edit task error:", err);
      return sendResponse(res, 500, false, "Internal server error");
    }
  }
);
// Delete task
router.delete(
  "/task/delete/:id",
  authMiddleware,
  async (req: CustomRequest, res: Response) => {
    try {
      const id = Number(req.params.id);

      const task = await prisma.task.findFirst({
        where: { id, userId: req.user!.id },
      });

      if (!task) {
        return sendResponse(res, 404, false, "Task not found");
      }

      await prisma.task.delete({
        where: { id: task.id },
      });

      return sendResponse(res, 200, true, "Task deleted successfully", task);
    } catch (err: any) {
      if (err.code === "P2025") {
        return sendResponse(res, 404, false, "Task not found");
      }
      console.error("Delete task error:", err);
      return sendResponse(res, 500, false, "Internal server error");
    }
  }
);

// Export tasks to Excel
router.get(
  "/export/excel",
  authMiddleware,
  async (req: CustomRequest, res: Response) => {
    try {
      const tasks = await prisma.task.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: "desc" },
      });

      const worksheet = XLSX.utils.json_to_sheet(tasks);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      res.setHeader("Content-Disposition", `attachment; filename=tasks.xlsx`);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.send(buffer);
    } catch (err) {
      console.error("Export tasks error:", err);
      return sendResponse(res, 500, false, "Internal server error");
    }
  }
);

export default router;
