import { OAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID!;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET!;

/**
 * Validate Google ID token
 */
export const validateGoogleToken = async (token: string) => {
  try {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) return null;

    if (
      !["accounts.google.com", "https://accounts.google.com"].includes(
        payload.iss || ""
      )
    ) {
      console.warn("Google token issuer mismatch.");
      return null;
    }

    return payload; // contains email, name, sub, etc.
  } catch (err) {
    console.error("Google token validation failed:", err);
    return null;
  }
};
