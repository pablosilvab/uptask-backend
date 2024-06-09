import type { Request, Response } from "express";
import Project from "../models/project";

export class ProjectController {
  static getAllProjects = async (req: Request, res: Response) => {
    try {
      const projects = await Project.find({});
      res.json(projects);
    } catch (error) {
      console.log(error);
    }
  };

  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body);

    try {
      await project.save();
      return res.status(201).send("Proyecto creado exitosamente");
    } catch (error) {
      console.log(error);

      return res.status(500).send("Error interno. Intente más tarde");
    }
  };

  static getProjectById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const project = await Project.findById(id);
      if (!project) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ error: error.message });
      }
      res.json(project);
    } catch (error) {
      console.log(error);
    }
  };

  static updateProject = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const project = await Project.findByIdAndUpdate(id, req.body);
      if (!project) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ error: error.message });
      }
      return res.send("Proyecto actualizado exitosamente");
    } catch (error) {
      console.log(error);

      return res.status(500).send("Error interno. Intente más tarde");
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
      return res.send("Proyecto eliminado exitosamente");
    } catch (error) {
      console.log(error);
    }
  };
}
