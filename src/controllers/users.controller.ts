import { Request, Response, NextFunction } from "express";

import User from "../models/User.js";

async function getAllArticles(req: Request, res: Response, next: NextFunction) {
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
}

async function checkEmail(req: Request, res: Response, next: NextFunction) {
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
}

const usersController = {
  getAllArticles,
  checkEmail,
};

export default usersController;
