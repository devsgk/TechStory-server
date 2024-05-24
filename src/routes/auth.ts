import express from "express";
import authController from "../controllers/auth.controller.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/logIn", authController.logIn);
router.get("/logOut", authController.logOut);
router.get("/check", verifyToken, authController.check);

export default router;
