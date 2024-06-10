import type { Request, Response } from "express";
import Project from "../models/project";
import Task from "../models/task";

export class TaskController {
  static createTask = async (req: Request, res: Response) => {
    try {
      const task = new Task(req.body);
      task.project = req.project.id;
      req.project.tasks.push(task);
      await task.save();
      await req.project.save();
      return res.status(201).send("Tarea creada exitosamente");
    } catch (error) {
      console.log(error);
      return res.status(500).send("Error interno. Intente más tarde");
    }
  };
}
