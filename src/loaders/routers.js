const articlesRouter = require("../routes/articles");
async function routerLoader(app) {
  app.use("/articles", articlesRouter);
}

module.exports = routerLoader;
