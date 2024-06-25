import { Request, Response } from "express";
import { AuthEmail } from "../emails/authEmail";
import User, { userStatus } from "../models/user";
import { hashPassword } from "../utils/auth";
import Token from "../models/token";
import { generateToken } from "../utils/token";

export class InvitationController {
  static inviteMemberToProject = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email }).select("id email name");

      if (user) {
        if (req.project.team.includes(user.id)) {
          const error = new Error("El usuario ya pertenece al proyecto");
          return res.status(409).json({ error: error.message });
        }

        AuthEmail.sendInvitationProjectEmail({
          email: user.email,
          name: user.name,
          name_sender: req.user.name,
          project_name: req.project.projectName,
        });

        req.project.team.push(user.id);
        await req.project.save();

        return res.json({ message: "Se ha vinculado el usuario al proyecto." });
      }
      console.log("invitando usuario a uptask");

      // Invite user to join UpTask
      const newUser = new User({
        email: email,
        name: "User",
        password: await hashPassword(
          (Math.random() + 1).toString(36).substring(7)
        ),
        status: userStatus.INVITED,
      });

      const token = new Token();
      token.token = generateToken();
      token.user = newUser.id;

      AuthEmail.sendInvitationUpTaskEmail({
        email: email,
        nameSender: req.user.name,
        projectName: req.project.projectName,
        token: token.token,
      });

      req.project.team.push(newUser);

      await Promise.allSettled([
        newUser.save(),
        token.save(),
        req.project.save(),
      ]);

      res.json({
        message:
          "Se ha enviado la invitación al usuario. Una vez aceptada será parte del proyecto",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static completeAccount = async (req: Request, res: Response) => {
    console.log(req.body);

    try {
      const { name, email, password } = req.body;
    
      const user = await User.findOne({email});

      user.name = name;
      user.password = await hashPassword(password);
      user.status = userStatus.CONFIRMED;

      await user.save();

      res.json({
        message:
          "Cuenta completada exitosamente!",
      });
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };
}
