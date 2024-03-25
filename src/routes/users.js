const express = require("express");
const usersController = require("../controllers/users.controller");
const router = express.Router();

router.get("/:userId/articles", usersController.getAllArticles);
router.get("/:check-email", usersController.checkEmail);

module.exports = router;
