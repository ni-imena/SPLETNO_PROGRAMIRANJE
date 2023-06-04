var express = require("express");
var router = express.Router();
var runController = require("../controllers/runController.js");
const { verifyToken } = require("../config/jwtUtils.js");

//router.get("/", verifyToken, runController.list);
router.get("/nearby/:id", verifyToken, runController.nearbyRuns);
router.get("/:id", verifyToken, runController.show);

router.post("/", runController.create);

//router.put("/:id", runController.update);

//router.delete("/:id", runController.remove);

module.exports = router;
