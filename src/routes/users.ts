import express from "express";
import usersController from "../controllers/users.controller.js";

const router = express.Router();

router.get("/:userId/articles", usersController.getAllArticles);
router.get("/:check-email", usersController.checkEmail);

export default router;
