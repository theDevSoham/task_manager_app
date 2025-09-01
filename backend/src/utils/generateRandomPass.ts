import bcrypt from "bcrypt";
import crypto from "crypto";

/**
 * Generate a random password of given length
 * @param length - length of the password (default 12)
 * @returns plain password string
 */
export const generateRandomPassword = (length = 12): string => {
  // Generate random bytes and convert to base64 string
  return crypto.randomBytes(length).toString("base64").slice(0, length);
};

/**
 * Generate a hashed password and return both plain & hashed versions
 */
export const generateHashedPassword = async (length = 12) => {
  const password = generateRandomPassword(length);
  const hashedPassword = await bcrypt.hash(password, 10);
  return { password, hashedPassword };
};
