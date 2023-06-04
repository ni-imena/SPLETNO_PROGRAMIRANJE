var express = require("express");
var router = express.Router();
var userController = require("../controllers/userController.js");
const { verifyToken } = require("../config/jwtUtils.js");

router.get("/", verifyToken, userController.list);
router.get("/profile", verifyToken, userController.profile);
router.get("/runs", verifyToken, userController.runs);
router.get("/logout", userController.logout);
//router.get("/:id", verifyToken, userController.show);

router.post("/", userController.create);
router.post("/login", userController.login);
router.post("/assignruns/:id", verifyToken, userController.assignRuns);

router.put("/:id", verifyToken, userController.update);
router.put("/strava/:id", verifyToken, userController.setStravaId);

router.delete("/:id", verifyToken, userController.remove);

module.exports = router;

