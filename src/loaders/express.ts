import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Express } from "express";

export default async function expressLoader(app: Express) {
  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
}
