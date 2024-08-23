import { Document } from "mongoose";
import { Jwt } from "jsonwebtoken";

export interface Reviewer {
  user: string;
  email: string;
  status: string;
}

type Position = {
  top: number;
};

export interface ReviewList {
  styleId: string;
  comment: string;
  position: Position;
  creator: UserType;
}

export interface ArticleType extends Document {
  title: string;
  previewContent: string;
  editorContent: string;
  textContent: string;
  author: string;
  reviewers: Reviewer[];
  reviewList: ReviewList[];
  isPublished: boolean;
}

export interface UserType extends Document {
  _id: string;
  refreshToken: string;
  email: string;
  photoURL: string;
  displayName: string;
  authoredArticles: string[];
  reviewedArticles: string[];
}

export interface JwtPayloadType extends Jwt {
  userId: string;
}
