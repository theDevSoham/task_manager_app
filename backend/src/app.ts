import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "dotenv";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";

config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.send("OK");
});

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

export default app;
