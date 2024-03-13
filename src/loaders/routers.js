const articlesRouter = require("../routes/articles");
const authRouter = require("../routes/auth");

async function routerLoader(app) {
  app.use("/auth", authRouter);
  app.use("/articles", articlesRouter);
}

module.exports = routerLoader;
