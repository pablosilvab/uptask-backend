import fs from "fs";
import handlebars from "handlebars";
import path from "path";
import { transporter } from "../config/nodemailer";

interface IEmail {
  email: string;
  name: string;
  token: string;
}

const FRONTEND_URL = process.env.FRONTEND_URL;

export class AuthEmail {
  static sendEmail = async (
    user: IEmail,
    templateName: string,
    urlPath: string,
    subject: string
  ) => {
    const __dirname = path.resolve();
    const filePath = path.join(__dirname, `./public/${templateName}.html`);
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);

    const replacements = {
      name: user.name,
      token: user.token,
      confirmation_link: `${FRONTEND_URL}${urlPath}`,
    };
    const htmlToSend = template(replacements);

    const info = await transporter.sendMail({
      from: "UpTask <uptask27@gmail.com>",
      to: user.email,
      subject: subject,
      text: subject,
      html: htmlToSend,
    });
    console.log("Email sent", info.messageId);
  };

  static sendConfirmationEmail = async (user: IEmail) => {
    await AuthEmail.sendEmail(
      user,
      "confirm-account",
      "/auth/confirm-account",
      "UpTask - Confirmar cuenta"
    );
  };

  static sendPasswordResetToken = async (user: IEmail) => {
    await AuthEmail.sendEmail(
      user,
      "forgot-password",
      "/auth/new-password",
      "UpTask - Restablecer contraseña"
    );
  };
}
