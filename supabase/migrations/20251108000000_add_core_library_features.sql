-- Add late fees and condition tracking to borrowings table
ALTER TABLE borrowings
ADD COLUMN IF NOT EXISTS late_fee_amount DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS fee_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fee_waived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fee_notes TEXT,
ADD COLUMN IF NOT EXISTS return_condition TEXT CHECK (return_condition IN ('Excellent', 'Good', 'Fair', 'Poor', 'Damaged')),
ADD COLUMN IF NOT EXISTS condition_notes TEXT,
ADD COLUMN IF NOT EXISTS flagged_for_review BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS renewal_count INTEGER DEFAULT 0;

-- Create library_settings table
CREATE TABLE IF NOT EXISTS library_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_late_fee_rate DECIMAL(10, 2) DEFAULT 0.50,
  grace_period_days INTEGER DEFAULT 0,
  max_late_fee_cap DECIMAL(10, 2) DEFAULT 50.00,
  max_renewals_per_loan INTEGER DEFAULT 2,
  member_borrowing_limit INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on library_settings
ALTER TABLE library_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for library_settings
CREATE POLICY "Users can view their own library settings"
  ON library_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own library settings"
  ON library_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own library settings"
  ON library_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_library_settings_user_id ON library_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_borrowings_flagged_for_review ON borrowings(flagged_for_review) WHERE flagged_for_review = TRUE;
CREATE INDEX IF NOT EXISTS idx_borrowings_fee_paid ON borrowings(fee_paid) WHERE fee_paid = FALSE;

-- Update books status enum to include 'Needs Repair'
-- Note: This assumes the status column exists and is a text type
-- If it's an enum, you may need to alter the enum type instead
