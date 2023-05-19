var express = require("express");
var router = express.Router();
var userController = require("../controllers/userController.js");
const { verifyToken } = require("../config/jwtUtils.js");


router.get("/", userController.list);
router.get("/profile", verifyToken, userController.profile);
router.get("/runs", verifyToken, userController.runs);
router.get("/logout", userController.logout);
router.get("/:id", userController.show);

router.post("/", userController.create);
router.post("/login", userController.login);

router.put("/:id", userController.update);

router.delete("/:id", userController.remove);

module.exports = router;

