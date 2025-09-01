import { Router, Request, Response } from "express";
import prisma from "../config/db";
import { sendResponse } from "../utils/response";
import bcrypt from "bcrypt";
import z from "zod";
import { generateOtp, generateToken } from "../utils/jwt";
import { sendMail } from "../utils/mail";
import { CustomRequest } from "../utils/types/customRequest";
import { sanitize } from "../utils/sanitize";
import { msToHuman } from "../utils/msToHuman";
import { validateGoogleToken } from "../utils/veriify_sso_token";
import { generateHashedPassword } from "../utils/generateRandomPass";

// Rate limiter: store timestamps of requests per email
const otpRateLimiter = new Map<string, number[]>();
const MAX_REQUESTS = 30;
const WINDOW_MS = 1000; // 1 second

// ✅ Signup schema
const signupSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
});

// Login schema
const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

// otp schema
const otpSchema = z.object({
  email: z.email(),
  code: z.string().length(6).regex(/^\d+$/, "OTP must be numeric"),
});

// resend otp schema
const resendOtpSchema = z.object({
  email: z.email("Invalid email format"),
});

// sso login schema
const ssoSchema = z.object({
  email: z.email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  login_mode: z.enum(["google", "facebook"]),
  sso_token: z.string().min(1),
});

const router = Router();

router.post("/signup", async (req: Request, res: Response) => {
  try {
    // Validate input
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));
      return sendResponse(res, 400, false, "Invalid input", errors);
    }

    const { email, password, firstName, lastName } = parsed.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendResponse(res, 400, false, "User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, firstName, lastName },
    });

    // Generate OTP
    const otp = generateOtp();

    // Hash OTP before storing for better security
    const hashedOtp = await bcrypt.hash(otp, 8);

    await prisma.otp.create({
      data: {
        code: hashedOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min expiry
        user: {
          connect: { id: user.id },
        },
        type: "SIGNUP",
      },
    });

    // console.log(`OTP for ${email}: ${otp}`);
    const subject = "Your OTP Code";
    const html = `
    <p>Hello,</p>
    <p>Your OTP code is: <b>${otp}</b></p>
    <p>This code will expire in 10 minutes.</p>
  `;
    await sendMail({
      to: email,
      subject,
      html,
      text: `Your OTP code is: ${otp}`,
    });

    return sendResponse(
      res,
      201,
      true,
      "User created. Please verify with OTP."
    );
  } catch (err) {
    console.error("Signup error:", err);
    return sendResponse(res, 500, false, "Signup failed");
  }
});

router.post("/signup/verify_otp", async (req: CustomRequest, res: Response) => {
  const parsed = otpSchema.safeParse(req.body);

  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path[0],
      message: e.message,
    }));
    return sendResponse(res, 400, false, "Invalid input", errors);
  }

  const { email, code } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return sendResponse(res, 404, false, "User not found");
  }

  if (user.verified) {
    return sendResponse(res, 400, false, "User already verified");
  }

  const otpRecord = await prisma.otp.findFirst({
    where: { userId: user.id, type: "SIGNUP", verified: false },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    return sendResponse(res, 400, false, "No OTP found or already used");
  }

  if (otpRecord.expiresAt < new Date()) {
    return sendResponse(res, 400, false, "OTP expired");
  }

  const isMatch = await bcrypt.compare(code, otpRecord.code);
  if (!isMatch) {
    return sendResponse(res, 400, false, "Invalid OTP");
  }

  // ✅ Mark OTP verified & user verified
  await prisma.$transaction([
    prisma.otp.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { verified: true },
    }),
  ]);

  return sendResponse(
    res,
    200,
    true,
    "User successfully verified. Please login"
  );
});

router.post(
  "/signup/verify_otp/resend",
  async (req: Request, res: Response) => {
    try {
      // Validate input
      const parsed = resendOtpSchema.safeParse(req.body);
      if (!parsed.success) {
        const errors = parsed.error.issues.map((e) => ({
          field: e.path[0],
          message: e.message,
        }));
        return sendResponse(res, 400, false, "Invalid input", errors);
      }

      const { email } = parsed.data;

      // Rate limiting
      const now = Date.now();
      const timestamps = otpRateLimiter.get(email) || [];
      // Filter out timestamps older than 1 second
      const recentRequests = timestamps.filter((ts) => now - ts < WINDOW_MS);

      if (recentRequests.length >= MAX_REQUESTS) {
        return sendResponse(
          res,
          429,
          false,
          "Too many requests. Please wait a moment."
        );
      }

      // Save current request timestamp
      recentRequests.push(now);
      otpRateLimiter.set(email, recentRequests);

      // Check user existence
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return sendResponse(res, 404, false, "User not found");
      }

      if (user.verified) {
        return sendResponse(res, 400, false, "User already verified");
      }

      // Check existing OTP
      const existingOtp = await prisma.otp.findFirst({
        where: { userId: user.id, type: "SIGNUP", verified: false },
        orderBy: { createdAt: "desc" },
      });

      if (existingOtp && existingOtp.expiresAt > new Date()) {
        const remainingMilliseconds = Math.ceil(
          existingOtp.expiresAt.getTime() - new Date().getTime()
        );
        return sendResponse(
          res,
          400,
          false,
          `OTP not expired yet. Try again in ${msToHuman(
            remainingMilliseconds
          )}`
        );
      }

      // Generate new OTP
      const otp = generateOtp();
      const hashedOtp = await bcrypt.hash(otp, 8);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

      if (existingOtp) {
        await prisma.otp.update({
          where: { id: existingOtp.id },
          data: { code: hashedOtp, expiresAt, verified: false },
        });
      } else {
        await prisma.otp.create({
          data: {
            user: { connect: { id: user.id } },
            code: hashedOtp,
            type: "SIGNUP",
            expiresAt,
          },
        });
      }

      // Send OTP email
      const subject = "Your new OTP Code";
      const html = `
      <p>Hello,</p>
      <p>Your OTP code is: <b>${otp}</b></p>
      <p>This code will expire in 10 minutes.</p>
    `;
      await sendMail({
        to: email,
        subject,
        html,
        text: `Your OTP code is: ${otp}`,
      });

      return sendResponse(res, 200, true, "OTP sent successfully");
    } catch (err) {
      console.error("Resend OTP Error:", err);
      return sendResponse(res, 500, false, "Failed to resend OTP");
    }
  }
);

router.post("/login", async (req: Request, res: Response) => {
  try {
    // 1. Validate input
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));
      return sendResponse(res, 400, false, "Invalid input", errors);
    }

    const { email, password } = parsed.data;

    // 2. Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendResponse(res, 401, false, "Invalid credentials");
    }

    // 3. Ensure user is verified
    if (!user.verified) {
      return sendResponse(
        res,
        403,
        false,
        "User not verified. Please verify your email."
      );
    }

    // 4. Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendResponse(res, 401, false, "Invalid credentials");
    }

    // 5. Generate tokens
    const accessToken = generateToken(user.id.toString(), "login");

    // 6. Respond with tokens
    return sendResponse(res, 200, true, "Login successful", {
      accessToken,
      user: sanitize(user, "User"),
    });
  } catch (err) {
    console.error("Login error:", err);
    return sendResponse(res, 500, false, "Login failed");
  }
});

router.post("/login/sso", async (req: Request, res: Response) => {
  try {
    const parsed = ssoSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));
      return sendResponse(res, 400, false, "Invalid input", errors);
    }

    const { email, firstName, lastName, login_mode, sso_token } = parsed.data;

    let ssoData: any = null;

    // Verify SSO token
    switch (login_mode) {
      case "google":
        ssoData = await validateGoogleToken(sso_token);
        break;

      case "facebook":
        // ssoData = await validateGoogleToken(sso_token);
        break;

      default:
        return sendResponse(res, 400, false, "Invalid login mode");
    }

    if (!ssoData) {
      return sendResponse(res, 401, false, "Invalid SSO token");
    }

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create verified user
      user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          password: (await generateHashedPassword()).hashedPassword,
          verified: true,
        },
      });
    }

    const loginToken = generateToken(user.id.toString(), "login");

    return sendResponse(res, 200, true, "Login successful", {
      accessToken: loginToken,
      user: sanitize(user, "User"),
    });
  } catch (err) {
    console.error("SSO login error:", err);
    return sendResponse(res, 500, false, "SSO login failed");
  }
});

export default router;
