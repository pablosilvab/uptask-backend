import type { Request, Response } from "express";
import Project from "../models/project";

export class ProjectController {
  static getAllProjects = async (req: Request, res: Response) => {
    try {
      const projects = await Project.find({});
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body);

    try {
      const newProject = await project.save();
      return res
        .status(201)
        .json({ message: "Proyecto creado exitosamente", newProject });
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static getProjectById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const project = await Project.findById(id).populate("tasks");
      if (!project) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ error: error.message });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static updateProject = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const project = await Project.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!project) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ error: error.message });
      }
      return res.json({
        message: "Proyecto actualizado exitosamente",
        project,
      });
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static deleteProjectById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const project = await Project.findByIdAndDelete(id);
      if (!project) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ error: error.message });
      }
      return res.json({ message: "Proyecto eliminado exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };
}
