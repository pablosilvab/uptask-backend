import { Request, Response } from "express";
import User from "../models/user";
import { hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import Token from "../models/token";
import { AuthEmail } from "../emails/authEmail";

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

      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);
      res.status(201).json({
        message:
          "Tu cuenta ha sido creada. Revisa tu email con un link de confirmación.",
      });
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Token no válido");
        res.status(401).json({ message: error.message });
      }

      const user = await User.findById(tokenExists.user)
      user.confirmed = true

      Promise.allSettled([user.save(), tokenExists.deleteOne()])
      res.json({message: 'Tu cuenta ha sido confirmada exitosamente'})
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };
}
