-- ============================================
-- DealFeed: Deal status + constraints
-- Run this in Supabase SQL Editor after 001/002/003
-- ============================================

-- 1. Status column
ALTER TABLE deals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected'));

-- 2. CHECK constraints (drop if exist from 003 to avoid conflicts)
ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_title_length;
ALTER TABLE deals ADD CONSTRAINT deals_title_length
    CHECK (char_length(title) >= 5 AND char_length(title) <= 200);

ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_price_positive;
ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_price_non_negative;
ALTER TABLE deals ADD CONSTRAINT deals_price_non_negative
    CHECK (price >= 0);

ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_discount_range;
ALTER TABLE deals ADD CONSTRAINT deals_discount_range
    CHECK (discount >= 0 AND discount <= 100);

-- 3. Drop existing overly-permissive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create deals" ON deals;

CREATE POLICY "Users can create own deals" ON deals
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 4. Drop existing overly-permissive SELECT policy
DROP POLICY IF EXISTS "Deals are viewable by everyone" ON deals;

-- Public feed: only approved deals
-- Author sees their own deals (any status)
-- Moderator / super_admin see everything
CREATE POLICY "Deals feed policy" ON deals
    FOR SELECT USING (
        status = 'approved'
        OR author_id = auth.uid()
        OR get_user_role() IN ('moderator', 'super_admin')
    );

