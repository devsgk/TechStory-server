import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { UserType, JwtPayloadType } from "../types/types.js";

export function generateAccessToken(user: UserType): string {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1h",
  });
}

export function generateRefreshToken(user: UserType): string {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "2w",
  });
}

export function verifyAccessToken(token: string): {
  isValidate: boolean;
  userId?: string;
  message?: string;
} {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY,
    ) as JwtPayloadType;

    return {
      isValidate: true,
      userId: decoded.userId,
    };
  } catch (error) {
    return {
      isValidate: false,
      message: (error as Error).message,
    };
  }
}

export async function verifyRefreshToken(
  token: string,
  userId: string,
): Promise<boolean> {
  try {
    const user = (await User.findById(userId)) as UserType;

    if (token === user.refreshToken) {
      try {
        jwt.verify(token, process.env.JWT_SECRET_KEY);

        return true;
      } catch (error) {
        return false;
      }
    }

    return false;
  } catch (error) {
    return false;
  }
}
