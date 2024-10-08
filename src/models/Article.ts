import mongoose, { Schema, Model } from "mongoose";
import { ArticleType } from "../types/types.js";

const reviewerSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

const positionSchema = new Schema({
  top: { type: Number, required: true },
});

const creatorSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, required: true },
  email: { type: String, required: true },
  photoURL: { type: String, required: true },
  displayName: { type: String, required: true },
  authoredArticles: [{ type: Schema.Types.ObjectId, ref: "Article" }],
  reviewedArticles: [{ type: Schema.Types.ObjectId, ref: "Article" }],
  refreshToken: { type: String, required: true },
});

const articleSchema = new Schema({
  title: {
    type: String,
  },
  previewContent: {
    type: String,
  },
  editorContent: {
    type: String,
    required: true,
  },
  textContent: {
    type: String,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reviewers: {
    type: [reviewerSchema],
  },
  reviewList: {
    type: [
      {
        styleId: { type: String, required: true },
        comment: { type: String, required: true },
        position: { type: positionSchema, required: true },
        creator: { type: creatorSchema, required: true },
      },
    ],
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Article: Model<ArticleType> = mongoose.model<ArticleType>(
  "Article",
  articleSchema,
);

export default Article;
