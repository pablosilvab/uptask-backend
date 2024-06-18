import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";
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

router.post(
  "/login",
  body("email").isEmail().withMessage("Email no válido"),
  body("password").notEmpty().withMessage("El password no puede ser vacío"),
  handleInputErrors,
  AuthController.login
);

router.post(
  "/request-code",
  body("email").isEmail().withMessage("Email no válido"),
  handleInputErrors,
  AuthController.requestConfirmationCode
);

router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("Email no válido"),
  handleInputErrors,
  AuthController.forgotPassword
);

router.post(
  "/validate-token",
  body("token").notEmpty().withMessage("El token no puede ser vacío"),
  handleInputErrors,
  AuthController.validateToken
);

router.post(
  "/update-password/:token",
  param("token").isNumeric().withMessage("Token no válido"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("El password debe tener minimo 6 caracteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password)
      throw new Error("Las contraseñas deben coincidir");
    return true;
  }),
  handleInputErrors,
  AuthController.updatePasswordWithToken
);

router.get("/user", authenticate, AuthController.user);

/** Profile */
router.put(
  "/profile",
  authenticate,
  body("name").notEmpty().withMessage("El nombre no puede ser vacío"),
  body("email").isEmail().withMessage("Email no válido"),
  handleInputErrors,
  AuthController.updateProfile
);

router.post(
  "/update-password",
  authenticate,
  body("current_password")
    .notEmpty()
    .withMessage("El password actual no puede ser vacío"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("El password debe tener minimo 6 caracteres"),
  body("password_confirmation")
    .notEmpty()
    .withMessage("La confirmación de tu password no puede ser vacío")
    .custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error("Las contraseñas deben coincidir");
      return true;
    }),
  handleInputErrors,
  AuthController.updateCurrentUserPassword
);

router.post(
  "/check-password",
  authenticate,
  body("password").notEmpty().withMessage("El password no puede ser vacío"),
  handleInputErrors,
  AuthController.checkPassword
);

export default router;
