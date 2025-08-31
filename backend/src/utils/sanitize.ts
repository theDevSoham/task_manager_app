// utils/sanitize.ts

/**
 * Centralized map of sensitive fields by entity type.
 *
 * Extend this map as you add more entities and sensitive fields.
 */
const sensitiveFieldsMap: Record<"User" | "Admin", string[]> = {
  User: ["password", "otpSecret", "resetToken", "refreshTokenVersion"],
  Admin: ["password", "apiKey", "secretKey"],
  // Add other entity types and their sensitive fields here
};

export function sanitize<T extends Record<string, any>>(
  entity: T,
  entityType: keyof typeof sensitiveFieldsMap
): Partial<T> {
  if (!entity) return entity;

  const sensitiveFields = sensitiveFieldsMap[entityType] || [];

  // Return a sanitized shallow copy
  const sanitized: Partial<T> = { ...entity };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      delete sanitized[field as keyof T];
    }
  }

  return sanitized;
}
