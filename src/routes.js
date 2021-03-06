const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("./authenticate");
const user_controller = require("./controllers/user_controller");
const group_controller = require("./controllers/group_controller");
const task_controller = require("./controllers/task_controller");

router.get("/",user_controller.index);
router.get("/acerca_de", user_controller.about);
router.get("/ingreso", user_controller.login);
router.get("/registro", user_controller.register);
router.post("/users/add", user_controller.add_user);
router.post("/users/entry", user_controller.entry_user);
router.get("/grupos", isAuthenticated, group_controller.groups);
router.post("/groups/add", isAuthenticated, group_controller.add_group);
router.get("/grupos/:id_group", isAuthenticated, group_controller.group);
router.put("/groups/:id_group/edit-name", isAuthenticated, group_controller.edit_name_group);
router.put("/groups/join", isAuthenticated, group_controller.join_group);
router.delete("/groups/:id_group/delete", isAuthenticated, group_controller.delete_group);
router.put("/groups/:id_group/exit", isAuthenticated, group_controller.exit_group);
router.put("/groups/:id_group/add_member", isAuthenticated, group_controller.add_member_group);
router.put("/groups/:id_group/delete_member/:id_user", isAuthenticated, group_controller.delete_member_group);
router.get("/users/logout", isAuthenticated, user_controller.logout);
router.get("/tareas", isAuthenticated, task_controller.tasks);
router.post("/tasks/personal/add", isAuthenticated, task_controller.add_personal_task);
router.put("/tasks/:id_task/edit", isAuthenticated, task_controller.edit_task);
router.delete("/tasks/:id_task/delete", isAuthenticated, task_controller.delete_task);
router.put("/tasks/:id_task/finish", isAuthenticated, task_controller.finish_task);
router.get("/tareas/:id_task", isAuthenticated, task_controller.task);
router.post("/tasks/group/:id_group/add", isAuthenticated, task_controller.add_group_task);

module.exports = router;