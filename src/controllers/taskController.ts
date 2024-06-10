import type { Request, Response } from "express";
import Project from "../models/project";
import Task from "../models/task";

export class TaskController {
  static createTask = async (req: Request, res: Response) => {
    const { projectId } = req.params;

    try {
      const project = await Project.findById(projectId);
      if (!project) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ error: error.message });
      }

      const task = new Task(req.body);
      task.project = project.id
      project.tasks.push(task)
      await task.save()
      await project.save()
      return res.status(201).send("Tarea creada exitosamente");
    } catch (error) {
      console.log(error);
      return res.status(500).send("Error interno. Intente más tarde");
    }
  };
}
