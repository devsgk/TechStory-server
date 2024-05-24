import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  generateAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwtUtils.js";
import { JwtPayloadType } from "../types/types.js";
import { ONE_HOUR_IN_MILLISECONDS } from "../constants/jwtConstants.js";

async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { accessToken } = req.cookies;

    if (accessToken) {
      const accessResult = verifyAccessToken(accessToken);
      const decodedToken = jwt.decode(accessToken);

      if (
        decodedToken &&
        typeof decodedToken !== "string" &&
        "userId" in decodedToken
      ) {
        const tokenPayload = decodedToken as JwtPayloadType;

        const user = await User.findById(decodedToken.userId).lean();

        if (!user) {
          throw new Error("User not found");
        }

        const refreshResult = await verifyRefreshToken(
          user.refreshToken,
          decodedToken.userId,
        );

        if (
          !accessResult.isValidate &&
          accessResult.message === "jwt expired"
        ) {
          if (!refreshResult) {
            return next();
          }

          const newAccessToken = generateAccessToken(decodedToken.userId);

          res.status(201).cookie("accessToken", newAccessToken, {
            maxAge: ONE_HOUR_IN_MILLISECONDS,
            httpOnly: true,
          });

          req.user = decodedToken.userId;

          return next();
        }
        req.user = decodedToken.userId;

        return next();
      }
    } else {
      throw new Error("Invalid token");
    }

    return next();
  } catch (error) {
    (error as any).message = "Unauthorized";
    (error as any).status = 401;

    return next(error);
  }
}

export default verifyToken;
