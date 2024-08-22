import { Request, Response, NextFunction } from "express";
import { JwtPayloadType } from "../types/types.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadType["userId"];
    }
  }
}

import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwtUtils.js";

import { ONE_HOUR_IN_MILLISECONDS } from "../constants/jwtConstants.js";

async function logIn(req: Request, res: Response, next: NextFunction) {
  const { email, photoURL, displayName } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        photoURL,
        displayName,
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;

    await user.save();

    res.status(201).cookie("accessToken", accessToken, {
      maxAge: ONE_HOUR_IN_MILLISECONDS,
      httpOnly: true,
    });

    res.send({ result: "ok", message: "login successful!", user });
  } catch (error) {
    console.log(error);
  }
}

async function logOut(req: Request, res: Response, next: NextFunction) {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.send({ result: "ok", message: "logOut successful" });
}

async function check(req: Request, res: Response, next: NextFunction) {
  if (!req?.user) {
    return res.status(200).json({ result: false });
  }

  const user = await User.findById(req.user).lean();

  return res.status(200).json({ result: true, user });
}

const authController = {
  logIn,
  logOut,
  check,
};

export default authController;
