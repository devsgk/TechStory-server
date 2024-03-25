const User = require("../models/User");

exports.getAllArticles = async function (req, res, next) {
  console.log("GET request to getAllArticles");
  const { userId } = req.params;

  try {
    const allArticles = await User.findById(userId)
      .populate("authoredArticles")
      .populate("reviewedArticles");

    if (!allArticles) {
      return res
        .status(200)
        .send({ result: "not found", message: "No articles found" });
    }

    const authoredArticles = allArticles.authoredArticles;
    const reviewedArticles = allArticles.reviewedArticles;

    return res.status(200).json({
      result: "ok",
      authoredArticles,
      reviewedArticles,
      message: "Articles found",
    });
  } catch (error) {
    console.log(error);
  }
};

exports.checkEmail = async function (req, res, next) {
  console.log("GET request to checkUser");
  const { email } = req.query;

  try {
    const user = await User.findOne({ email });
    if (user) {
      res
        .status(200)
        .send({ result: "ok", message: "Reviewer is a registered user" });
    } else {
      res
        .status(200)
        .send({ result: "fail", message: "Reviewer is NOT registered" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ result: "fail", message: "Internal server error." });
  }
};
