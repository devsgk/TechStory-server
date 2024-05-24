import createError from "http-errors";
import { Express } from "express";

export default async function errorHandlerLoader(app: Express) {
  app.use((req, res, next) => {
    next(createError(404));
  });

  app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    res.status(err.status || 500);
    res.json({ message: err.message });
  });
}
