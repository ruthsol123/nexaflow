const express = require("express");
const { body, param } = require("express-validator");
const auth = require("../controllers/authController");
const api = require("../controllers/apiController");
const { authenticateUser, requireEmployer } = require("../middleware/auth");
const { email, password, validate } = require("../utils/validation");

const router = express.Router();
const protectedRouter = express.Router();
protectedRouter.use(authenticateUser);
const idValidation = param("id").trim().notEmpty().withMessage("A record id is required");

const accountEmail = body().custom((value) => /\S+@\S+\.\S+/.test(String(value.email || value.companyEmail || ""))).withMessage("A valid email is required");
router.post("/auth/register", [body("fullName").trim().isLength({ min: 2 }).withMessage("A valid full name is required"), accountEmail, password(), body("confirmPassword").custom((value, { req }) => value === req.body.password).withMessage("Passwords do not match"), validate], auth.register);
router.post("/auth/login", [accountEmail, body("password").isString().notEmpty().withMessage("Password is required"), validate], auth.login);
protectedRouter.post("/auth/logout", auth.logout);
protectedRouter.get("/auth/me", auth.me);

protectedRouter.post("/users/employees", requireEmployer, [body("fullName").optional().trim().isLength({ min: 2 }), body("name").optional().trim().isLength({ min: 2 }), email("email"), password(), validate], api.createEmployee);
protectedRouter.get("/users/employees", requireEmployer, api.listEmployees);
protectedRouter.get("/users/employees/:id", requireEmployer, idValidation, validate, api.employee);
protectedRouter.patch("/users/employees/:id", requireEmployer, idValidation, validate, api.updateEmployee);
protectedRouter.delete("/users/employees/:id", requireEmployer, idValidation, validate, api.deleteEmployee);

protectedRouter.post("/teams", requireEmployer, api.teamCreate);
protectedRouter.get("/teams", api.list.bind(null, "teams"));
protectedRouter.get("/teams/:id", idValidation, validate, api.get.bind(null, "teams"));
protectedRouter.patch("/teams/:id", requireEmployer, idValidation, validate, api.teamUpdate);
protectedRouter.delete("/teams/:id", requireEmployer, idValidation, validate, api.deleteRecord.bind(null, "teams"));

protectedRouter.post("/projects", requireEmployer, api.createRecord.bind(null, "projects", "project"));
protectedRouter.get("/projects", api.list.bind(null, "projects"));
protectedRouter.get("/projects/:id", idValidation, validate, api.get.bind(null, "projects"));
protectedRouter.patch("/projects/:id", requireEmployer, idValidation, validate, api.updateRecord.bind(null, "projects"));
protectedRouter.delete("/projects/:id", requireEmployer, idValidation, validate, api.deleteRecord.bind(null, "projects"));

protectedRouter.post("/tasks", requireEmployer, api.createRecord.bind(null, "tasks", "task"));
protectedRouter.get("/tasks", api.list.bind(null, "tasks"));
protectedRouter.get("/tasks/:id", idValidation, validate, api.get.bind(null, "tasks"));
protectedRouter.patch("/tasks/:id", api.updateTask);
protectedRouter.delete("/tasks/:id", requireEmployer, idValidation, validate, api.deleteRecord.bind(null, "tasks"));

protectedRouter.get("/notifications", api.notifications);
protectedRouter.get("/notifications/unread", api.unread);
protectedRouter.patch("/notifications/:id/read", api.markRead);
protectedRouter.patch("/notifications/read-all", api.readAll);
protectedRouter.delete("/notifications/:id", api.deleteNotification);

router.use(protectedRouter);
module.exports = router;