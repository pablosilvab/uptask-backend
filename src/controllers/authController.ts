import { Request, Response } from "express";
import User, { userStatus } from "../models/user";
import { checkPassword, hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import Token from "../models/token";
import { AuthEmail } from "../emails/authEmail";
import { generateJWT } from "../utils/jwt";

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      const { password, email } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) {
        const error = new Error("El usuario ya está registrado");
        return res.status(409).json({ error: error.message });
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
        return res.status(401).json({ error: error.message });
      }

      const user = await User.findById(tokenExists.user);
      user.status = userStatus.CONFIRMED;

      //Promise.allSettled([user.save(), tokenExists.deleteOne()]);
      res.json({ message: "Tu cuenta ha sido confirmada exitosamente", user });
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        const error = new Error("Email no registrado.");
        return res.status(404).json({ error: error.message });
      }

      if (user.status !== userStatus.CONFIRMED) {
        const token = new Token();
        token.user = user.id;
        token.token = generateToken();
        await token.save();

        AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token,
        });

        const error = new Error(
          "La cuenta no ha sido confirmada. Hemos enviado un email de confirmación."
        );
        return res.status(401).json({ error: error.message });
      }

      const isPasswordCorrect = await checkPassword(password, user.password);
      if (!isPasswordCorrect) {
        const error = new Error("Credenciales inválidas");
        return res.status(401).json({ error: error.message });
      }

      const token = generateJWT({ id: user.id });

      return res.json({ message: "Iniciando sesión...", token });
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static requestConfirmationCode = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El usuario no está registrado");
        return res.status(404).json({ error: error.message });
      }

      if (user.status === userStatus.CONFIRMED) {
        const error = new Error("El usuario ya está confirmado");
        return res.status(403).json({ error: error.message });
      }

      if (user.status === userStatus.NOT_CONFIRMED) {
        const token = await Token.findOne({ user: user });

        if (!token) {
          const token = new Token();
          token.token = generateToken();
          token.user = user.id;

          AuthEmail.sendConfirmationEmail({
            email: user.email,
            name: user.name,
            token: token.token,
          });

          await Promise.allSettled([user.save(), token.save()]);
          return res.status(200).json({
            message: "Se ha enviado un nuevo código a tu email.",
          });
        } else {
          token.deleteOne();

          AuthEmail.sendConfirmationEmail({
            email: user.email,
            name: user.name,
            token: generateToken(),
          });
        }

        const error = new Error(
          "Debes confirmar tu cuenta. Sigue las instrucciones enviadas a tu email."
        );

        return res.status(409).json({ error: error.message });
      }
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El usuario no está registrado");
        return res.status(404).json({ error: error.message });
      }

      if (user.status === userStatus.NOT_CONFIRMED) {
        const token = await Token.findOne({ user: user });

        if (!token) {
          const token = new Token();
          token.token = generateToken();
          token.user = user.id;
          await token.save();

          AuthEmail.sendPasswordResetToken({
            email: user.email,
            name: user.name,
            token: token.token,
          });

          return res.status(200).json({
            message: "Revisa tu email y sigue las instrucciones.",
          });
        } else {
          token.deleteOne();

          AuthEmail.sendConfirmationEmail({
            email: user.email,
            name: user.name,
            token: generateToken(),
          });
        }

        const error = new Error(
          "Debes confirmar tu cuenta. Sigue las instrucciones enviadas a tu email."
        );

        return res.status(409).json({ error: error.message });
      }
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Token no válido");
        return res.status(401).json({ error: error.message });
      }

      res.json({
        message: "Código validado exitosamente. Define tu nueva contraseña.",
      });
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static updatePasswordWithToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const tokenExists = await Token.findOne({ token });

      if (!tokenExists) {
        const error = new Error("Token no válido");
        return res.status(404).json({ error: error.message });
      }

      const user = await User.findById(tokenExists.user);
      user.password = await hashPassword(req.body.password);

      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
      res.json({
        message: "Contraseña actualizada exitosamente.",
      });
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static user = async (req: Request, res: Response) => {
    return res.json(req.user);
  };

  static updateProfile = async (req: Request, res: Response) => {
    const { name, email } = req.body;
    try {
      const userExists = await User.findOne({ email });
      if (userExists && userExists.id.toString() !== req.user.id.toString()) {
        const error = new Error("Email ya está registrado");
        res.status(409).json({ error: error.message });
      }

      req.user.name = name;
      req.user.email = email;

      await req.user.save();
      res.json({ message: "Perfil actualizado correctamente" });
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    try {
      const { current_password, password } = req.body;
      const user = await User.findById(req.user.id);

      const isPasswordCorrect = await checkPassword(
        current_password,
        user.password
      );

      if (!isPasswordCorrect) {
        const error = new Error("La contraseña actual es incorrecta");
        return res.status(401).json({ error: error.message });
      }

      user.password = await hashPassword(password);
      await user.save();
      res.json({ message: "Tu contraseña ha sido actualizada exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static checkPassword = async (req: Request, res: Response) => {
    try {
      const { password } = req.body;
      const user = await User.findById(req.user.id);
      const isPasswordCorrect = await checkPassword(password, user.password);

      if (!isPasswordCorrect) {
        const error = new Error("La contraseña es incorrecta");
        return res.status(401).json({ error: error.message });
      }
      res.json({ message: "Contraseña correcta" });
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };
}
