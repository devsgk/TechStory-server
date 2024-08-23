import Article from "../models/Article.js";
import User from "../models/User.js";
import nodemailer from "nodemailer";

import {
  deleteHighlightedReview,
  deleteAllHighlightedReviews,
} from "../utils/deleteHighlightedReview.js";

import { Request, Response, NextFunction } from "express";
import { SentMessageInfo } from "nodemailer";
import {
  ArticleType,
  CommentObjType,
  Reviewer,
  UserType,
  UserStore,
} from "../types/types.js";

async function deleteArticle(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { articleId } = req.body;

  try {
    const article: ArticleType = await Article.findById(articleId);
    const authorId = article.author;
    const reviewers = article.reviewers;
    const ids: string[] = [];

    for (const reviewer of reviewers) {
      ids.push(reviewer.user);
    }

    await Article.deleteOne({ _id: articleId });
    await User.updateOne(
      { _id: authorId },
      { $pull: { authoredArticles: articleId } },
    );

    for (const id of ids) {
      await User.updateOne(
        { _id: id },
        { $pull: { reviewedArticles: articleId } },
      );
    }

    res
      .status(200)
      .send({ result: "ok", message: "Successfully deleted the article" });
  } catch (error) {
    console.log(error);
  }
}

async function saveArticle(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const {
    user,
    articleContent,
    articleId,
    textContent,
    title,
  }: {
    user: UserType;
    articleContent: string;
    articleId: string;
    textContent: string;
    title: string;
  } = req.body;

  try {
    if (articleId) {
      const article: ArticleType = await Article.findById(articleId);

      article.title = title;
      article.editorContent = articleContent;
      article.previewContent = articleContent;
      article.textContent = textContent;

      await article.save();

      res.status(200).send({ result: "ok", articleId: article._id });
    } else {
      const newArticle: ArticleType = new Article({
        title: title,
        previewContent: articleContent,
        editorContent: articleContent,
        textContent: textContent,
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
}

interface QueryParams {
  articleId?: string;
}

async function getArticle(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { articleId }: QueryParams = req.query;

  try {
    const article: ArticleType =
      await Article.findById(articleId).populate("author");

    const cleanedArticle: string = deleteAllHighlightedReviews(
      article.previewContent,
    );

    if (article) {
      res.status(200).json({ result: "ok", article, cleanedArticle });
    } else {
      res.status(404).send({ result: "fail", message: "Article not found" });
    }
  } catch (error) {
    console.log(error);
  }
}

async function getAllArticles(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const allArticles: ArticleType[] = await Article.find().populate("author");

    if (allArticles.length) {
      res.status(200).json({ result: "ok", allArticles });
    } else {
      res.status(200).send({ result: "no article", message: "No articles" });
    }
  } catch (error) {
    console.log(error);
  }
}

async function sendEmail(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const {
    emailList,
    url,
    articleId,
  }: { emailList: string[]; url: string; articleId: string } = req.body;

  const article: ArticleType = await Article.findById(articleId);

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

  const prevReviewersList: string[] = [];

  for (const prevReviewer of article.reviewers) {
    prevReviewersList.push(prevReviewer.email);
  }

  const removedReviewersList: string[] = prevReviewersList.filter(
    (el) => emailList.indexOf(el) === -1,
  );

  for (let i = 0; i < removedReviewersList.length; i++) {
    const user: UserType = await User.findOne({
      email: removedReviewersList[i],
    });

    if (user) {
      await User.findByIdAndUpdate(user._id, {
        $pull: { reviewedArticles: articleId },
      });
    }
  }

  const newReviewersList: Reviewer[] = [];

  for (let i = 0; i < emailList.length; i++) {
    const reviewerObj: Reviewer = {
      email: emailList[i],
      status: "pending",
    };

    newReviewersList.push(reviewerObj);
  }

  for (let i = 0; i < newReviewersList.length; i++) {
    const user: UserType = await User.findOne({
      email: newReviewersList[i].email,
    });

    if (user) {
      newReviewersList[i].user = user._id;

      await User.findByIdAndUpdate(user._id, {
        $addToSet: { reviewedArticles: articleId },
      });
    }
  }

  article.reviewers = newReviewersList;

  await article.save();

  const sendEmailPromises = emailList.map(
    (emailAddress: string): Promise<string[]> => {
      return new Promise((resolve, reject) => {
        const mailOptions = {
          from: process.env.EMAIL,
          to: emailAddress,
          subject: "Review request",
          text: `Please review my post. ${url}`,
        };

        transporter.sendMail(
          mailOptions,
          (error: Error | null, info: SentMessageInfo) => {
            if (error) {
              console.error(`Error sending email to ${emailAddress}: `, error);
              reject(error);
            } else {
              console.error(`Email sent to ${emailAddress}: ` + info.response);
              resolve(info.response);
            }
          },
        );
      });
    },
  );

  Promise.all(sendEmailPromises)
    .then((responses) => {
      res
        .status(200)
        .send({ result: "ok", message: "Emails sent successfully" });
    })
    .catch((error) => {
      console.error("Error sending one or more emails: ", error);
      res.status(500).send({ result: "error", message: error.message });
    });
}

async function saveReview(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const {
    articleContent,
    articleId,
    commentObj,
  }: {
    articleContent: string;
    articleId: string;
    commentObj: CommentObjType;
  } = req.body;

  try {
    const article: ArticleType = await Article.findById(articleId);
    article.editorContent = articleContent;
    article.previewContent = articleContent;
    article.reviewList.push(commentObj);

    await article.save();

    res.status(200).send({ result: "ok", articleId: article._id });
  } catch (error) {
    console.log(error);
  }
}

async function deleteReview(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const {
    articleId,
    styleId,
  }: {
    articleId: string;
    styleId: string;
  } = req.body;

  try {
    const article: ArticleType = await Article.findById(articleId);
    const newReviewList: CommentObjType[] = [];

    for (let i = 0; i < article.reviewList.length; i++) {
      if (article.reviewList[i].styleId !== styleId) {
        newReviewList.push(article.reviewList[i]);
      }
    }

    article.reviewList = newReviewList;

    const cleanedArticle: string = deleteHighlightedReview(
      article.previewContent,
      styleId,
    );

    article.previewContent = cleanedArticle;
    article.editorContent = cleanedArticle;

    await article.save();

    res.status(200).send({
      result: "ok",
      message: "Successfully deleted comment",
      article,
      cleanedArticle,
    });
  } catch (error) {
    console.log(error);
  }
}

async function approveArticle(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { articleId }: QueryParams = req.query;
  const { user }: UserStore = req.body;

  try {
    await Article.updateOne(
      {
        _id: articleId,
        "reviewers.email": user.email,
      },
      { $set: { "reviewers.$.status": "approved" } },
    );

    res
      .status(200)
      .send({ result: "ok", message: "Status changed to approved" });
  } catch (error) {
    console.log(error);
  }
}

interface Params {
  articleId?: string;
}

async function publishArticle(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { articleId }: Params = req.params;

  try {
    await Article.updateOne(
      { _id: articleId },
      { $set: { isPublished: true } },
    );
    res.status(200).send({ result: "ok", message: "Successfully published" });
  } catch (error) {
    console.log(error);
  }
}

async function cancelPublishArticle(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { articleId }: Params = req.params;

  try {
    await Article.updateOne(
      { _id: articleId },
      { $set: { isPublished: false } },
    );
    res
      .status(200)
      .send({ result: "ok", message: "Successfully cancelled publishing" });
  } catch (error) {
    console.log(error);
  }
}

const articlesController = {
  deleteArticle,
  saveArticle,
  getArticle,
  getAllArticles,
  saveReview,
  deleteReview,
  sendEmail,
  approveArticle,
  publishArticle,
  cancelPublishArticle,
};

export default articlesController;
