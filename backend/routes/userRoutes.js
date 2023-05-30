var express = require("express");
var router = express.Router();
var userController = require("../controllers/userController.js");
const { verifyToken } = require("../config/jwtUtils.js");
const { verifyUser } = require("../config/authMiddleware.js");

router.get("/", verifyUser, userController.list);
router.get("/profile", verifyToken, userController.profile);
router.get("/runs", verifyToken, userController.runs);
router.get("/logout", userController.logout);
router.get("/:id", verifyUser, userController.show);

router.post("/", userController.create);
router.post("/login", userController.login);

router.put("/:id", verifyUser, userController.update);

router.delete("/:id", verifyUser, userController.remove);

module.exports = router;

