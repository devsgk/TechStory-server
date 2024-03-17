const express = require("express");

const articlesController = require("../controllers/articles.controller");

const router = express.Router();

router.get("/", articlesController.getArticle);
router.post("/", articlesController.saveArticle);

router.post("/review", articlesController.saveReview);
router.delete("/review", articlesController.deleteReview);

router.post("/email", articlesController.sendEmail);

module.exports = router;
