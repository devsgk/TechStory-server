import { Express } from "express";

import articlesRouter from "../routes/articles.js";
import authRouter from "../routes/auth.js";
import usersRouter from "../routes/users.js";

async function routerLoader(app: Express): Promise<void> {
  app.use("/auth", authRouter);
  app.use("/articles", articlesRouter);
  app.use("/users", usersRouter);
}

export default routerLoader;
