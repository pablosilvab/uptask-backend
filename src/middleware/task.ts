import type { Request, Response, NextFunction } from "express";
import Task, { ITask } from "../models/task";

declare global {
  namespace Express {
    interface Request {
      task: ITask;
    }
  }
}

export async function validateTaskExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      const error = new Error("Tarea no encontrada");
      return res.status(404).json({ error: error.message });
    }  

    if (task.project.toString() != req.project.id) {
      const error = new Error("Acción no válida");
      return res.status(400).json({ error: error.message });
    }

    req.task = task;
    next();
  } catch (error) {
    res.status(500).json({
      error: "Hubo un error",
    });
  }
}
