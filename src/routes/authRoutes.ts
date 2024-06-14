import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { body } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
const router = Router();

router.post(
  "/create-account",
  body("name").notEmpty().withMessage("El nombre no puede ser vacío"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("El password debe tener minimo 6 caracteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password)
      throw new Error("Las contraseñas deben coincidir");
    return true;
  }),
  body("email").isEmail().withMessage("Email no válido"),
  handleInputErrors,
  AuthController.createAccount
);

router.post(
  "/confirm-account",
  body("token").notEmpty().withMessage("El token no puede ser vacío"),
  handleInputErrors,
  AuthController.confirmAccount
);

export default router;
