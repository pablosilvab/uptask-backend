import type { Request, Response } from "express";
import Project from "../models/project";
import Task from "../models/task";

export class TaskController {
  static createTask = async (req: Request, res: Response) => {
    try {
      const task = new Task(req.body);
      task.project = req.project.id;
      req.project.tasks.push(task);
      await Promise.allSettled([task.save(), req.project.save()]);
      return res
        .status(201)
        .json({ message: "Tarea creada exitosamente", task });
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static getProjectTasks = async (req: Request, res: Response) => {
    try {
      const tasks = await Task.find({ project: req.project.id }).populate(
        "project"
      );
      return res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static getTaskById = async (req: Request, res: Response) => {
    try {
      const task = await Task.findById(req.task.id)
        .populate({
          path: "completedBy.user",
          select: "id name email",
        })
        .populate({
          path: "notes",
          populate: { path: "createdBy", select: "id name email" },
        });
      return res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static updateTask = async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;
      const task = await Task.findByIdAndUpdate(taskId, req.body, {
        new: true,
      });
      res.json({ message: "Tarea actualizada correctamente", task });
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static deleteTaskById = async (req: Request, res: Response) => {
    const { taskId } = req.params;
    try {
      req.project.tasks = req.project.tasks.filter(
        (task) => task._id.toString() !== taskId
      );

      await Promise.allSettled([req.task.deleteOne(), req.project.save()]);
      res.json({ message: "Tarea eliminada correctamente" });
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static updateStatus = async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      req.task.status = status;
      const data = {
        user: req.user.id,
        status,
      };
      req.task.completedBy.push(data);

      const task = await req.task.save();

      res.json({ message: "Status actualizado correctamente", task });
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };
}
