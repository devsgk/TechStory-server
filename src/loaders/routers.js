const articlesRouter = require("../routes/articles");
const authRouter = require("../routes/auth");
const usersRouter = require("../routes/users");

async function routerLoader(app) {
  app.use("/auth", authRouter);
  app.use("/articles", articlesRouter);
  app.use("/users", usersRouter);
}

module.exports = routerLoader;
