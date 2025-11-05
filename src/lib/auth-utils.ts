import { User } from "@supabase/supabase-js";

/**
 * Checks if a user's profile is complete with required metadata
 * @param user - The Supabase user object
 * @returns true if user has both role and full_name in metadata, false otherwise
 */
export function isProfileComplete(user: User | null): boolean {
  if (!user) return false;
  if (!user.user_metadata) return false;

  const hasRole = user.user_metadata.role && user.user_metadata.role.trim() !== "";
  const hasFullName = user.user_metadata.full_name && user.user_metadata.full_name.trim() !== "";

  return hasRole && hasFullName;
}
