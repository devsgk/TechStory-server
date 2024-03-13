const express = require("express");
const authController = require("../controllers/auth.controller");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

router.post("/logIn", authController.logIn);
router.get("/logOut", authController.logOut);
router.get("/check", verifyToken, authController.check);

module.exports = router;
