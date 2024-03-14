const Article = require("../models/Article");
const User = require("../models/User");
const nodemailer = require("nodemailer");

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

exports.sendEmail = async function (req, res, next) {
  console.log("send email request");
  const { emailList, url, articleId } = req.body;

  const article = await Article.findById(articleId);
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const prevReviewersList = [];

  for (const prevReviewer of article.reviewers) {
    prevReviewersList.push(prevReviewer.email);
  }

  const removedReviewersList = prevReviewersList.filter(
    (el) => emailList.indexOf(el) === -1,
  );

  for (let i = 0; i < removedReviewersList.length; i++) {
    const user = await User.findOne({ email: removedReviewersList[i] });

    if (user) {
      await User.findByIdAndUpdate(user._id, {
        $pull: { reviewedArticles: articleId },
      });
    }
  }

  const newReviewersList = [];

  for (let i = 0; i < emailList.length; i++) {
    const reviewerObj = { email: emailList[i], status: "pending" };

    newReviewersList.push(reviewerObj);
  }

  for (let i = 0; i < newReviewersList.length; i++) {
    const user = await User.findOne({ email: newReviewersList[i].email });

    if (user) {
      newReviewersList[i].user = user._id;

      await User.findByIdAndUpdate(user._id, {
        $addToSet: { reviewedArticles: articleId },
      });
    }
  }

  article.reviewers = newReviewersList;

  await article.save();

  const sendEmailPromises = emailList.map((el) => {
    return new Promise((resolve, reject) => {
      const mailOptions = {
        from: process.env.EMAIL,
        to: el,
        subject: "Review request",
        text: `Please review my post. ${url}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email to " + email + ": ", error);
          reject(error);
        } else {
          console.log("Email sent to " + email + ": " + info.response);
          resolve(info.response);
        }
      });
    });
  });

  Promise.all(sendEmailPromises)
    .then((responses) => {
      console.log("All emails sent successfully.");

      res
        .status(200)
        .send({ result: "ok", message: "Emails sent successfully" });
    })
    .catch((error) => {
      console.log("Error sending one or more emails: ", error);

      res.status(500).send({ result: "error", message: error.message });
    });
};
