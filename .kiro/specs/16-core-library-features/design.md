# Design Document: Core Library Features

## Overview

This design document outlines the architecture and implementation approach for essential library management features including late fees calculation, book condition tracking, renewal limits, and member borrowing limits. These features enforce library policies and provide operational data tracking.

### Key Objectives

- Automatic late fee calculation based on configurable policies
- Track book condition over time to identify maintenance needs
- Enforce renewal limits to ensure fair circulation
- Enforce borrowing limits to share resources equitably
- Provide configurable settings for library administrators
- Maintain audit trail for fees and conditions

## Architecture

### High-Level System Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Library Settings                                │
│                     (Configurable Policies)                              │
│  - Daily Late Fee Rate                                                   │
│  - Grace Period                                                          │
│  - Max Late Fee Cap                                                      │
│  - Max Renewals Per Loan                                                 │
│  - Member Borrowing Limit                                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Policy Enforcement                               │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐│
│  │  Late Fees   │  │  Condition   │  │   Renewal    │  │  Borrowing  ││
│  │ Calculation  │  │  Assessment  │  │    Limits    │  │   Limits    ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Data Storage & Tracking                           │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Borrowings Table                               │  │
│  │  - late_fee_amount                                                │  │
│  │  - fee_paid / fee_waived                                          │  │
│  │  - return_condition                                               │  │
│  │  - condition_notes                                                │  │
│  │  - renewal_count                                                  │  │
│  │  - flagged_for_review                                             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                 Library Settings Table                            │  │
│  │  - daily_late_fee_rate                                            │  │
│  │  - grace_period_days                                              │  │
│  │  - max_late_fee_cap                                               │  │
│  │  - max_renewals_per_loan                                          │  │
│  │  - member_borrowing_limit                                         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
Settings Page
│
├── Library Policies Section (New)
│   ├── Late Fee Configuration
│   │   ├── Daily Rate Input
│   │   ├── Grace Period Input
│   │   └── Maximum Cap Input
│   ├── Circulation Policies
│   │   ├── Max Renewals Input
│   │   └── Borrowing Limit Input
│   └── Save Settings Button
│
Active Loans Page (Enhanced)
│
├── Loans Table
│   ├── Late Fee Display (in badge/column)
│   └── Renewal Count Display
│
├── Renewal Dialog (Enhanced)
│   ├── Current Renewal Count
│   ├── Remaining Renewals
│   └── Limit Warning
│
└── Return Dialog (New)
    ├── Condition Assessment
    │   ├── Condition Dropdown
    │   └── Notes Textarea
    ├── Late Fee Display
    │   ├── Calculated Amount
    │   └── Payment Options
    │       ├── Mark as Paid
    │       └── Waive Fee
    └── Confirm Return Button

Member Detail Page (Enhanced)
│
├── Borrowing Status Card
│   ├── Current Borrowed Count
│   ├── Borrowing Limit
│   └── Progress Bar
│
└── Late Fees Card
    ├── Outstanding Fees Total
    ├── Fee History List
    └── Payment Actions

Book Detail Page (Enhanced)
│
├── Condition History Section
│   ├── Condition Timeline
│   └── Flagged for Review Badge
│
└── Repair Status
    ├── Needs Repair Badge
    └── Mark as Repaired Button
```

## Data Models

### Library Settings

```typescript
interface LibrarySettings {
  id: string;
  user_id: string;
  daily_late_fee_rate: number;      // Default: 0.50
  grace_period_days: number;        // Default: 0
  max_late_fee_cap: number;         // Default: 50.00
  max_renewals_per_loan: number;    // Default: 2
  member_borrowing_limit: number;   // Default: 5
  created_at: string;
  updated_at: string;
}
```

### Enhanced Borrowing Record

```typescript
interface Borrowing {
  id: string;
  book_id: string;
  member_id: string;
  checkout_date: string;
  due_date: string;
  return_date: string | null;
  status: 'Borrowed' | 'Returned';
  
  // Late Fees
  late_fee_amount: number;
  fee_paid: boolean;
  fee_waived: boolean;
  fee_notes: string | null;
  
  // Condition Tracking
  return_condition: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Damaged' | null;
  condition_notes: string | null;
  flagged_for_review: boolean;
  
  // Renewal Tracking
  renewal_count: number;
  
  user_id: string;
}
```

## Core Algorithms

### Late Fee Calculation

```typescript
function calculateLateFee(
  dueDate: Date,
  returnDate: Date,
  settings: LibrarySettings
): number {
  // Calculate days overdue
  const diffTime = returnDate.getTime() - dueDate.getTime();
  const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Apply grace period
  const chargeableDays = Math.max(0, daysOverdue - settings.grace_period_days);
  
  // Calculate fee
  let fee = chargeableDays * settings.daily_late_fee_rate;
  
  // Apply maximum cap
  if (settings.max_late_fee_cap > 0) {
    fee = Math.min(fee, settings.max_late_fee_cap);
  }
  
  return Math.round(fee * 100) / 100; // Round to 2 decimals
}
```

### Borrowing Limit Check

```typescript
async function canMemberBorrow(
  memberId: string,
  userId: string,
  settings: LibrarySettings
): Promise<{ allowed: boolean; reason?: string }> {
  // Count active borrowings
  const { count } = await supabase
    .from('borrowings')
    .select('*', { count: 'exact', head: true })
    .eq('member_id', memberId)
    .eq('user_id', userId)
    .eq('status', 'Borrowed');
  
  if (count >= settings.member_borrowing_limit) {
    return {
      allowed: false,
      reason: `Member has reached borrowing limit (${settings.member_borrowing_limit} books)`
    };
  }
  
  // Check for unpaid late fees
  const { data: unpaidFees } = await supabase
    .from('borrowings')
    .select('late_fee_amount')
    .eq('member_id', memberId)
    .eq('user_id', userId)
    .eq('fee_paid', false)
    .eq('fee_waived', false);
  
  const totalUnpaid = unpaidFees?.reduce((sum, b) => sum + b.late_fee_amount, 0) || 0;
  
  if (totalUnpaid > 10) { // $10 threshold
    return {
      allowed: false,
      reason: `Member has unpaid late fees: $${totalUnpaid.toFixed(2)}`
    };
  }
  
  return { allowed: true };
}
```

### Renewal Limit Check

```typescript
function canRenewLoan(
  borrowing: Borrowing,
  settings: LibrarySettings
): { allowed: boolean; reason?: string } {
  if (borrowing.renewal_count >= settings.max_renewals_per_loan) {
    return {
      allowed: false,
      reason: `Maximum renewals reached (${settings.max_renewals_per_loan})`
    };
  }
  
  return { allowed: true };
}
```

## User Interface Design

### Settings Page - Library Policies Section

```
┌─────────────────────────────────────────────────────────────┐
│ Library Policies                                            │
│ Configure lending rules and fee structures                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Late Fee Configuration                                      │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Daily Late Fee Rate:  [$0.50    ] per day              ││
│ │ Grace Period:         [0        ] days                  ││
│ │ Maximum Fee Cap:      [$50.00   ] per book             ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Circulation Policies                                        │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Max Renewals:         [2        ] per loan              ││
│ │ Borrowing Limit:      [5        ] books per member      ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│                                    [Save Settings]          │
└─────────────────────────────────────────────────────────────┘
```

### Return Dialog with Condition Assessment

```
┌─────────────────────────────────────────────────────────────┐
│ Return Book                                              [X]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Book Cover]  The Great Gatsby                              │
│               by F. Scott Fitzgerald                        │
│               Borrowed by: John Doe                         │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ Book Condition Assessment                                   │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Condition: [Excellent ▼]                                ││
│ │                                                         ││
│ │ Notes (optional):                                       ││
│ │ ┌─────────────────────────────────────────────────────┐││
│ │ │                                                     │││
│ │ └─────────────────────────────────────────────────────┘││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ⚠️ Late Fee: $3.50 (7 days overdue)                        │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ [Mark as Paid]  [Waive Fee]                            ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│                        [Cancel]  [Confirm Return]          │
└─────────────────────────────────────────────────────────────┘
```

### Enhanced Renewal Dialog

```
┌─────────────────────────────────────────────────────────────┐
│ Renew Book Loan                                          [X]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Book Cover]  The Great Gatsby                              │
│               by F. Scott Fitzgerald                        │
│               Borrowed by: John Doe                         │
│                                                             │
│ Current Due Date:  Nov 15, 2024                             │
│                                                             │
│ ℹ️ Renewals Used: 1 of 2                                    │
│                                                             │
│ Extension Duration:                                         │
│ [7 Days] [15 Days] [30 Days]                               │
│ Custom: [15] days                                           │
│                                                             │
│ New Due Date: Nov 30, 2024                                  │
│                                                             │
│                        [Cancel]  [Confirm Renewal]          │
└─────────────────────────────────────────────────────────────┘
```

### Member Detail - Borrowing Status

```
┌─────────────────────────────────────────────────────────────┐
│ Borrowing Status                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Currently Borrowed: 3 of 5 books                            │
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                             │
│ Outstanding Late Fees: $12.50                               │
│ ⚠️ Member cannot borrow until fees are paid                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling

### Policy Violation Errors

```typescript
interface PolicyViolation {
  type: 'borrowing_limit' | 'renewal_limit' | 'late_fees' | 'book_condition';
  message: string;
  details: {
    current?: number;
    limit?: number;
    amount?: number;
  };
  canOverride: boolean;
}
```

### Error Display Component

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Cannot Complete Action                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Member has reached borrowing limit                          │
│                                                             │
│ Current: 5 books borrowed                                   │
│ Limit: 5 books                                              │
│                                                             │
│ Please return a book before borrowing another.              │
│                                                             │
│                        [OK]  [Override (Staff Only)]        │
└─────────────────────────────────────────────────────────────┘
```

## Testing Strategy

### Unit Tests

1. **Late Fee Calculation**
   - Test with various overdue periods
   - Test grace period application
   - Test maximum cap enforcement
   - Test edge cases (same day return, negative dates)

2. **Limit Checks**
   - Test borrowing limit enforcement
   - Test renewal limit enforcement
   - Test boundary conditions

3. **Condition Assessment**
   - Test all condition values
   - Test flagging logic
   - Test status updates

### Integration Tests

1. **Return Flow**
   - Complete return with condition assessment
   - Late fee calculation and recording
   - Fee payment/waiver

2. **Renewal Flow**
   - Renewal with limit check
   - Renewal count increment
   - Limit reached prevention

3. **Checkout Flow**
   - Borrowing limit check
   - Late fee check
   - Book condition check

### User Acceptance Tests

1. Configure library settings and verify application
2. Process returns with various conditions
3. Test renewal limits
4. Test borrowing limits
5. Verify late fee calculations
6. Test staff override functionality

## Performance Considerations

1. **Database Indexes**
   - Index on `borrowings.flagged_for_review`
   - Index on `borrowings.fee_paid`
   - Index on `library_settings.user_id`

2. **Query Optimization**
   - Use aggregation for fee totals
   - Cache settings in React Query
   - Batch condition history queries

3. **Real-time Updates**
   - Invalidate queries after mutations
   - Optimistic updates for better UX

## Security Considerations

1. **Row Level Security**
   - Library settings scoped to user_id
   - Borrowings scoped to user_id
   - Prevent unauthorized access

2. **Staff Override**
   - Require confirmation dialogs
   - Log override actions
   - Consider audit trail

3. **Data Validation**
   - Validate fee amounts (non-negative)
   - Validate limit values (positive integers)
   - Validate condition enum values

## Migration Strategy

1. **Database Migration**
   - Add new columns with defaults
   - Create new table with RLS
   - Add indexes

2. **Backward Compatibility**
   - Existing borrowings work without new fields
   - Default settings applied if not configured
   - Graceful handling of null values

3. **Data Migration**
   - No existing data needs migration
   - New fields start with default values
   - Settings created on first save
