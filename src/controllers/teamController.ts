import { Request, Response } from "express";
import User from "../models/user";
import Project from "../models/project";

export class TeamController {
  static findMemberByEmail = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email }).select("id email name");
      if (!user) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static addMemberById = async (req: Request, res: Response) => {
    const { id } = req.body;
    try {
      const user = await User.findById(id).select("id");

      if (!user) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }

      if (
        req.project.team.some((team) => team.toString() === user.id.toString())
      ) {
        const error = new Error("El usuario ya existe en el proyecto");
        return res.status(409).json({ error: error.message });
      }

      req.project.team.push(user.id);
      await req.project.save();
      res.json({ message: "Usuario agregado exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static removeMemberById = async (req: Request, res: Response) => {
    const { id } = req.body;
    try {
      if (!req.project.team.some((team) => team.toString() === id)) {
        const error = new Error("El usuario no existe en el proyecto");
        return res.status(409).json({ error: error.message });
      }

      req.project.team = req.project.team.filter(
        (teamMember) => teamMember.toString() !== id
      );
      await req.project.save();
      res.json({ message: "Usuario eliminado del equipo exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static getProjectTeam = async (req: Request, res: Response) => {
    try {
      const project = await Project.findById(req.project.id).populate({
        path: "team",
        select: "id email name",
      });
      res.json(project.team);
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };
}
