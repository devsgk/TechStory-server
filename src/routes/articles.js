const express = require("express");

const articlesController = require("../controllers/articles.controller");

const router = express.Router();

router.get("/", articlesController.getArticle);
router.delete("/:articleId", articlesController.deleteArticle);
router.get("/all", articlesController.getAllArticles);
router.post("/", articlesController.saveArticle);

router.post("/:articleId/review", articlesController.saveReview);
router.delete("/:articleId/review", articlesController.deleteReview);

router.post("/email", articlesController.sendEmail);
router.post("/approve", articlesController.approveArticle);
router.post("/:articleId/publish", articlesController.publishArticle);
router.delete("/:articleId/publish", articlesController.cancelPublishArticle);

module.exports = router;
