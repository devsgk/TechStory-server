const express = require("express");

const articlesController = require("../controllers/articles.controller");

const router = express.Router();

router.get("/", articlesController.getArticle);
router.post("/", articlesController.saveArticle);

router.post("/email", articlesController.sendEmail);

module.exports = router;
