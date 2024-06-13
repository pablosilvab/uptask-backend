import { Request, Response } from "express";
import User from "../models/user";
import { hashPassword } from "../utils/auth";

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      const { password, email } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) {
        const error = new Error("El usuario ya está registrado");
        return res.status(409).json({ message: error.message });
      }

      const user = new User(req.body);
      user.password = await hashPassword(password);
      await user.save();
      res.status(201).json({
        message:
          "Tu cuenta ha sido creada. Revisa tu email con un link de confirmación.",
      });
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };
}
