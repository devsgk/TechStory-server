import { Document } from "mongoose";
import { Jwt } from "jsonwebtoken";

export interface Reviewer {
  user?: string;
  email: string;
  status: string;
}

type Position = {
  top: number;
};

export type CommentObjType = {
  styleId: string;
  comment: string;
  position: Position;
  creator: UserType;
};

export interface ArticleType extends Document {
  title: string;
  previewContent: string;
  editorContent: string;
  textContent: string;
  author: string;
  reviewers: Reviewer[];
  reviewList: CommentObjType[];
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

export interface UserStore {
  identity: string;
  isLoggedIn: boolean;
  user: UserType | null;
  setIdentity: (identity: string) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUser: (user: UserType) => void;
}

export interface JwtPayloadType extends Jwt {
  userId: string;
}
