import { JwtPayloadType } from "./types.ts";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadType["userId"];
    }
  }
}
