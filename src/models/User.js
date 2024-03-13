const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  photoURL: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    unique: true,
    required: true,
  },
  authoredArticles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
    },
  ],
  reviewedArticles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
