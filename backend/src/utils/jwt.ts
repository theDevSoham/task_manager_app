import jwt, { JwtPayload } from "jsonwebtoken";
import crypto from "crypto";
import { incrementTokenVersion } from "./token_versioning";

const tokenDurations = {
  otp: "10m",
  login: "7d",
} as const;

type TokenType = keyof typeof tokenDurations;

/**
 * Generate JWT token
 * @param userId - The ID of the user
 * @param type - Type of token ("otp" | "login")
 */
const generateToken = (userId: string, type: TokenType = "otp"): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const tokenVersion = incrementTokenVersion(userId);

  return jwt.sign({ userId, tokenVersion, type }, secret, {
    expiresIn: tokenDurations[type],
  });
};

/**
 * Generate a 6-digit OTP
 */
const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Check if the token provided is expired
 * @param decoded
 * @returns is the token expired
 */

const isJwtExpired = (decoded: JwtPayload): boolean => {
  if (!decoded.exp) return true; // treat missing exp as expired/invalid
  return decoded.exp * 1000 <= Date.now();
};

export { generateToken, generateOtp, tokenDurations, isJwtExpired };
