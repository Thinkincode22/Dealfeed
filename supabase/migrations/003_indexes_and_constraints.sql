-- ============================================
-- DealFeed: Performance indexes + CHECK constraints
-- Run this in Supabase SQL Editor after 002_rbac_schema.sql
-- ============================================

-- ============================================
-- 1. INDEXES for frequently queried columns
-- ============================================

-- Deals: sorting by date (main feed)
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at DESC);

-- Deals: category filtering
CREATE INDEX IF NOT EXISTS idx_deals_category ON deals(category);

-- Deals: hot/trending sort
CREATE INDEX IF NOT EXISTS idx_deals_temperature ON deals(temperature DESC);

-- Deals: author lookups ("My Deals")
CREATE INDEX IF NOT EXISTS idx_deals_author_id ON deals(author_id);

-- Deals: active deals filter (partial index for RLS)
CREATE INDEX IF NOT EXISTS idx_deals_is_active ON deals(is_active) WHERE is_active = true;

-- Deals: store-based search
CREATE INDEX IF NOT EXISTS idx_deals_store ON deals(store);

-- Comments: deal_id join
CREATE INDEX IF NOT EXISTS idx_comments_deal_id ON comments(deal_id);

-- Comments: ordering by date
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Saved deals: user lookups ("My Saved")
CREATE INDEX IF NOT EXISTS idx_saved_deals_user_id ON saved_deals(user_id);

-- Deal images: deal_id join
CREATE INDEX IF NOT EXISTS idx_deal_images_deal_id ON deal_images(deal_id);

-- ============================================
-- 2. CHECK CONSTRAINTS for data validation
-- ============================================

-- Deals: title length
ALTER TABLE deals ADD CONSTRAINT deals_title_length
    CHECK (char_length(title) >= 3 AND char_length(title) <= 200);

-- Deals: price must be non-negative
ALTER TABLE deals ADD CONSTRAINT deals_price_positive
    CHECK (price >= 0);

-- Deals: original price must be non-negative
ALTER TABLE deals ADD CONSTRAINT deals_original_price_positive
    CHECK (original_price >= 0);

-- Deals: discount range
ALTER TABLE deals ADD CONSTRAINT deals_discount_range
    CHECK (discount >= 0 AND discount <= 100);

-- Comments: content length
ALTER TABLE comments ADD CONSTRAINT comments_content_length
    CHECK (char_length(content) >= 1 AND char_length(content) <= 2000);

-- Profiles: username length
ALTER TABLE profiles ADD CONSTRAINT profiles_username_length
    CHECK (char_length(username) >= 3 AND char_length(username) <= 30);

-- ============================================
-- 3. FULL-TEXT SEARCH INDEX for deals
-- ============================================

-- Add tsvector column for full-text search
ALTER TABLE deals ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_deals_search ON deals USING GIN(search_vector);

-- Populate search_vector from title, description, store, category
CREATE OR REPLACE FUNCTION update_deal_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english',
        COALESCE(NEW.title, '') || ' ' ||
        COALESCE(NEW.description, '') || ' ' ||
        COALESCE(NEW.store, '') || ' ' ||
        COALESCE(NEW.category, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search_vector on insert/update
CREATE TRIGGER on_deal_search_update
    BEFORE INSERT OR UPDATE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION update_deal_search_vector();

-- Update existing rows
UPDATE deals SET search_vector = to_tsvector('english',
    COALESCE(title, '') || ' ' ||
    COALESCE(description, '') || ' ' ||
    COALESCE(store, '') || ' ' ||
    COALESCE(category, '')
);
