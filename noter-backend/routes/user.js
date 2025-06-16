const router = require("express").Router();
const validation = require("../middleware/user-validation");
const authorization = require("../middleware/user-authorization");
const userController = require("../controllers/user");

router.post("/new", validation, userController.newUser);

router.post("/authenticate", validation, userController.authenticate);

router.post("/logout", userController.logout);

router.get("/refresh", userController.refresh);

router.get("/get", authorization, userController.getUser);

router.patch("/reset-password", validation, userController.resetPassword);

router.patch("/update", validation, userController.updateUser);

router.delete("/delete", authorization, userController.deleteUser);

module.exports = router;
