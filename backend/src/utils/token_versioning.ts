// tokenVersioning.ts
const tokenVersions = new Map<string, number>();

/**
 * Get current token version for a user
 */
export const getTokenVersion = (userId: string): number => {
  return tokenVersions.get(userId) ?? 0;
};

/**
 * Increment token version (invalidate old tokens)
 */
export const incrementTokenVersion = (userId: string): number => {
  const newVersion = getTokenVersion(userId) + 1;
  tokenVersions.set(userId, newVersion);
  return newVersion;
};

/**
 * Set a specific version (optional utility)
 */
export const setTokenVersion = (userId: string, version: number): void => {
  tokenVersions.set(userId, version);
};
