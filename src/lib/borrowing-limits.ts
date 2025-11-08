/**
 * Borrowing Limits Utilities
 */

import { supabase } from "@/integrations/supabase/client";

export interface BorrowingLimitCheck {
  allowed: boolean;
  reason?: string;
  current?: number;
  limit?: number;
}

/**
 * Check if a member can borrow more books
 * @param memberId - The member's ID
 * @param userId - The library user's ID
 * @param borrowingLimit - The maximum books allowed
 * @returns Object indicating if borrowing is allowed
 */
export async function canMemberBorrow(
  memberId: string,
  userId: string,
  borrowingLimit: number
): Promise<BorrowingLimitCheck> {
  try {
    // Count active borrowings
    const { count, error } = await supabase
      .from("borrowings")
      .select("*", { count: "exact", head: true })
      .eq("member_id", memberId)
      .eq("user_id", userId)
      .eq("status", "Borrowed");

    if (error) throw error;

    const currentCount = count || 0;

    if (currentCount >= borrowingLimit) {
      return {
        allowed: false,
        reason: `Member has reached borrowing limit`,
        current: currentCount,
        limit: borrowingLimit,
      };
    }

    return {
      allowed: true,
      current: currentCount,
      limit: borrowingLimit,
    };
  } catch (error) {
    console.error("Error checking borrowing limit:", error);
    return {
      allowed: false,
      reason: "Error checking borrowing limit",
    };
  }
}

/**
 * Check if a member has unpaid late fees above threshold
 * @param memberId - The member's ID
 * @param userId - The library user's ID
 * @param threshold - The maximum unpaid fees allowed (default $10)
 * @returns Object indicating if borrowing is allowed
 */
export async function checkUnpaidLateFees(
  memberId: string,
  userId: string,
  threshold: number = 10
): Promise<BorrowingLimitCheck> {
  try {
    const { data, error } = await supabase
      .from("borrowings")
      .select("late_fee_amount")
      .eq("member_id", memberId)
      .eq("user_id", userId)
      .eq("fee_paid", false)
      .eq("fee_waived", false);

    if (error) throw error;

    const totalUnpaid = data?.reduce((sum, b) => sum + (b.late_fee_amount || 0), 0) || 0;

    if (totalUnpaid > threshold) {
      return {
        allowed: false,
        reason: `Member has unpaid late fees: $${totalUnpaid.toFixed(2)}`,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Error checking late fees:", error);
    return {
      allowed: false,
      reason: "Error checking late fees",
    };
  }
}
