const Article = require("../models/Article");
const User = require("../models/User");

exports.saveArticle = async function (req, res, next) {
  const { user, articleContent, articleId } = req.body;

  try {
    if (articleId) {
      const article = await Article.findById(articleId);

      article.editorContent = articleContent;
      article.previewContent = articleContent;

      await article.save();

      res.status(200).send({ result: "ok", articleId: article._id });
    } else {
      const newArticle = new Article({
        previewContent: articleContent,
        editorContent: articleContent,
        author: user,
      });

      await User.findByIdAndUpdate(user._id, {
        $push: { authoredArticles: newArticle._id },
      });

      await newArticle.save();
      res.status(200).send({ result: "ok", articleId: newArticle._id });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.getArticle = async function (req, res, next) {
  const { articleId } = req.query;

  try {
    const article = await Article.findById(articleId);

    if (article) {
      res.status(200).json({ result: "ok", article });
    } else {
      res.status(404).send({ result: "fail", message: "Article not found" });
    }
  } catch (error) {
    console.log(error);
  }
};
