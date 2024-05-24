import mongooseLoader from "./mongoose.js";
import expressLoader from "./express.js";
import routerLoader from "./routers.js";
import errorHandlerLoader from "./errorHandler.js";
import { Express } from "express";

export default async function appLoader(app: Express) {
  await mongooseLoader();
  await expressLoader(app);
  await routerLoader(app);
  await errorHandlerLoader(app);
}
