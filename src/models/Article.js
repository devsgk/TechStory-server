const mongoose = require("mongoose");

const reviewerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

const articleSchema = new mongoose.Schema({
  previewContent: {
    type: String,
  },
  editorContent: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reviewers: {
    type: [reviewerSchema],
  },
  reviewList: {
    type: Array,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Article", articleSchema);
