// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../config/db";
import { getTokenVersion } from "../utils/token_versioning";

interface AuthenticatedRequest extends Request {
  user?: any; // You can type this with Prisma.User if needed
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1] as string;

    // Verify JWT
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Ensure token has userId
    if (!decoded || !decoded.userId || decoded.tokenVersion === undefined) {
      return res.status(401).json({ error: "Token payload invalid" });
    }

    // Check token version validity
    const currentVersion = getTokenVersion(decoded.userId);
    if (currentVersion === null) {
      return res.status(401).json({ error: "User does not exist" });
    }

    console.log(
      decoded.tokenVersion,
      currentVersion,
      decoded.tokenVersion !== currentVersion
    );

    if (decoded.tokenVersion !== currentVersion) {
      return res.status(401).json({ error: "Token is no longer valid" });
    }

    // Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.userId) },
    });

    if (!user) {
      return res.status(401).json({ error: "User does not exist" });
    }

    // check if user is verified
    if (!user.verified) {
      return res
        .status(403)
        .json({ error: "User is not yet verified. Please verify the user" });
    }

    // Attach user to req
    req.user = user;

    return next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
