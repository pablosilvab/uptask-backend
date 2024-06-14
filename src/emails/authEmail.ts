import { transporter } from "../config/nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";

interface IEmail {
  email: string;
  name: string;
  token: string;
}

export class AuthEmail {
  static sendConfirmationEmail = async (user: IEmail) => {
    const __dirname = path.resolve();
    const filePath = path.join(__dirname, "./public/confirm-account.html");
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);

    const replacements = {
      name: user.name,
      token: user.token,
    };
    const htmlToSend = template(replacements);

    const info = await transporter.sendMail({
      from: "UpTask <admin@uptask.com>",
      to: user.email,
      subject: "UpTask - Confirmar cuenta",
      text: "UpTask - Confirma tu cuenta",
      html: htmlToSend,
    });

    console.log("Mensaje enviado", info.messageId);
  };
}
