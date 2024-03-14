const Article = require("../models/Article");
const User = require("../models/User");

exports.saveArticle = async function (req, res, next) {
  console.log("POST request to save article");
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
