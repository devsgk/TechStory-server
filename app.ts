import dotenv from "dotenv";
import express from "express";
import appLoader from "./src/loaders/index.js";

dotenv.config();

const app = express();
console.log(process.env.NODE_ENV);
(async () => {
  await appLoader(app);
})();

export default app;
