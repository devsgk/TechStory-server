import mongoose, { Schema, Model } from "mongoose";
import { UserType } from "../types/types.js";

const userSchema = new Schema({
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
      type: Schema.Types.ObjectId,
      ref: "Article",
    },
  ],
  reviewedArticles: [
    {
      type: Schema.Types.ObjectId,
      ref: "Article",
    },
  ],
});

const User: Model<UserType> = mongoose.model<UserType>("User", userSchema);

export default User;
