import { Router } from "express";
import { ProjectController } from "../controllers/projectController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/taskController";
import { validateProjectExists } from "../middleware/project";
import { hasAuthorization, validateTaskExists } from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamController } from "../controllers/teamController";
import { NoteController } from "../controllers/noteController";

const router = Router();
router.use(authenticate);

router.post(
  "/",
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del proyecto es obligatorio"),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del cliente es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción del proyecto es obligatorio"),
  handleInputErrors,
  ProjectController.createProject
);

router.get("/", ProjectController.getAllProjects);

router.get(
  "/:id",
  param("id").isMongoId().withMessage("ID no válido"),
  handleInputErrors,
  ProjectController.getProjectById
);

router.put(
  "/:id",
  param("id").isMongoId().withMessage("ID no válido"),
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del proyecto es obligatorio"),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del cliente es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción del proyecto es obligatorio"),
  handleInputErrors,
  ProjectController.updateProject
);

router.delete(
  "/:id",
  param("id").isMongoId().withMessage("ID no válido"),
  handleInputErrors,
  ProjectController.deleteProjectById
);

/**
 * Routes for tasks
 */
router.param("projectId", validateProjectExists);

router.post(
  "/:projectId/tasks",
  hasAuthorization,
  body("name").notEmpty().withMessage("El nombre de la tarea es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción de la tarea es obligatorio"),
  handleInputErrors,
  TaskController.createTask
);

router.get("/:projectId/tasks", TaskController.getProjectTasks);

router.get(
  "/:projectId/tasks/:taskId",
  param("taskId").isMongoId().withMessage("ID no válido"),
  validateTaskExists,
  handleInputErrors,
  TaskController.getTaskById
);

router.put(
  "/:projectId/tasks/:taskId",
  hasAuthorization,
  param("taskId").isMongoId().withMessage("ID no válido"),
  body("name").notEmpty().withMessage("El nombre de la tarea es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción de la tarea es obligatorio"),
  validateTaskExists,
  handleInputErrors,
  TaskController.updateTask
);

router.delete(
  "/:projectId/tasks/:taskId",
  hasAuthorization,
  param("taskId").isMongoId().withMessage("ID no válido"),
  validateTaskExists,
  handleInputErrors,
  TaskController.deleteTaskById
);

router.patch(
  "/:projectId/tasks/:taskId/status",
  param("taskId").isMongoId().withMessage("ID no válido"),
  body("status").notEmpty().withMessage("El estado es obligatorio"),
  validateTaskExists,
  handleInputErrors,
  TaskController.updateStatus
);

router.post(
  "/:projectId/team/find",
  body("email").isEmail().toLowerCase().withMessage("Email no válido"),
  handleInputErrors,
  TeamController.findMemberByEmail
);

router.post(
  "/:projectId/team",
  body("id").isMongoId().withMessage("Usuario no es válido"),
  handleInputErrors,
  TeamController.addMemberById
);

router.delete(
  "/:projectId/team/:userId",
  param("userId").isMongoId().withMessage("Usuario no es válido"),
  handleInputErrors,
  TeamController.removeMemberById
);

router.get("/:projectId/team", TeamController.getProjectTeam);

/** Routes for notes */
router.post(
  "/:projectId/tasks/:taskId/notes",
  body("content")
    .notEmpty()
    .withMessage("El contenido de la nota es obligatorio"),
  validateTaskExists,
  handleInputErrors,
  NoteController.createNote
);

router.get(
  "/:projectId/tasks/:taskId/notes",
  validateTaskExists,
  handleInputErrors,
  NoteController.getTasksNotes
);

router.delete(
  "/:projectId/tasks/:taskId/notes/:noteId",

  param("noteId").isMongoId().withMessage("Id no es válido"),
  validateTaskExists,
  handleInputErrors,
  NoteController.removeNote
);

export default router;
