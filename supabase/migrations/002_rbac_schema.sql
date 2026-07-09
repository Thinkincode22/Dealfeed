-- ============================================
-- DealFeed: Complete Schema with RBAC
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (with roles)
-- ============================================
-- Table created in 001_initial_schema.sql
-- Adding role column here
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('super_admin', 'moderator', 'user')) DEFAULT 'user';

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || LEFT(NEW.id::text, 8)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 2. DEALS TABLE
-- ============================================
-- Table created in 001_initial_schema.sql
-- Adding is_active column here
ALTER TABLE deals ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- ============================================
-- 3. COMMENTS TABLE
-- ============================================
-- Table created in 001_initial_schema.sql (identical structure)

-- ============================================
-- 4. VOTES TABLE
-- ============================================
-- Table created in 001_initial_schema.sql (identical structure)

-- ============================================
-- 5. SAVED DEALS TABLE
-- ============================================
-- Table created in 001_initial_schema.sql (identical structure)

-- ============================================
-- 6. IMAGES TABLE (for deal galleries)
-- ============================================
CREATE TABLE deal_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. TEMPERATURE UPDATE TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_deal_temperature()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE deals
    SET temperature = (
        SELECT COALESCE(SUM(value), 0) FROM votes WHERE deal_id = COALESCE(NEW.deal_id, OLD.deal_id)
    )
    WHERE id = COALESCE(NEW.deal_id, OLD.deal_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_vote_change
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_deal_temperature();

-- ============================================
-- 8. HELPER FUNCTION: Get User Role
-- ============================================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT role FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_images ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 10. RLS POLICIES: PROFILES
-- ============================================
-- Anyone can read profiles
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles
    FOR SELECT USING (true);

-- Users can update their own profile (except role)
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Super admin can update any profile (including roles)
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
CREATE POLICY "profiles_update_admin" ON profiles
    FOR UPDATE USING (get_user_role() = 'super_admin');

-- ============================================
-- 11. RLS POLICIES: DEALS
-- ============================================
-- Anyone can read active deals
DROP POLICY IF EXISTS "deals_select_all" ON deals;
CREATE POLICY "deals_select_all" ON deals
    FOR SELECT USING (is_active = true OR author_id = auth.uid() OR get_user_role() IN ('moderator', 'super_admin'));

-- Authenticated users can create deals
DROP POLICY IF EXISTS "deals_insert_auth" ON deals;
CREATE POLICY "deals_insert_auth" ON deals
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own deals
DROP POLICY IF EXISTS "deals_update_own" ON deals;
CREATE POLICY "deals_update_own" ON deals
    FOR UPDATE USING (auth.uid() = author_id);

-- Users can delete their own deals
DROP POLICY IF EXISTS "deals_delete_own" ON deals;
CREATE POLICY "deals_delete_own" ON deals
    FOR DELETE USING (auth.uid() = author_id);

-- Moderators can update any deal
DROP POLICY IF EXISTS "deals_update_moderator" ON deals;
CREATE POLICY "deals_update_moderator" ON deals
    FOR UPDATE USING (get_user_role() = 'moderator');

-- Moderators can delete any deal
DROP POLICY IF EXISTS "deals_delete_moderator" ON deals;
CREATE POLICY "deals_delete_moderator" ON deals
    FOR DELETE USING (get_user_role() = 'moderator');

-- Super admin has full access
DROP POLICY IF EXISTS "deals_all_admin" ON deals;
CREATE POLICY "deals_all_admin" ON deals
    FOR ALL USING (get_user_role() = 'super_admin');

-- ============================================
-- 12. RLS POLICIES: COMMENTS
-- ============================================
-- Anyone can read comments
DROP POLICY IF EXISTS "comments_select_all" ON comments;
CREATE POLICY "comments_select_all" ON comments
    FOR SELECT USING (true);

-- Authenticated users can create comments
DROP POLICY IF EXISTS "comments_insert_auth" ON comments;
CREATE POLICY "comments_insert_auth" ON comments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own comments
DROP POLICY IF EXISTS "comments_update_own" ON comments;
CREATE POLICY "comments_update_own" ON comments
    FOR UPDATE USING (auth.uid() = author_id);

-- Users can delete their own comments
DROP POLICY IF EXISTS "comments_delete_own" ON comments;
CREATE POLICY "comments_delete_own" ON comments
    FOR DELETE USING (auth.uid() = author_id);

-- Moderators can delete any comment
DROP POLICY IF EXISTS "comments_delete_moderator" ON comments;
CREATE POLICY "comments_delete_moderator" ON comments
    FOR DELETE USING (get_user_role() = 'moderator');

-- Super admin has full access
DROP POLICY IF EXISTS "comments_all_admin" ON comments;
CREATE POLICY "comments_all_admin" ON comments
    FOR ALL USING (get_user_role() = 'super_admin');

-- ============================================
-- 13. RLS POLICIES: VOTES
-- ============================================
-- Anyone can read votes
DROP POLICY IF EXISTS "votes_select_all" ON votes;
CREATE POLICY "votes_select_all" ON votes
    FOR SELECT USING (true);

-- Authenticated users can vote
DROP POLICY IF EXISTS "votes_insert_auth" ON votes;
CREATE POLICY "votes_insert_auth" ON votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can change their own vote
DROP POLICY IF EXISTS "votes_update_own" ON votes;
CREATE POLICY "votes_update_own" ON votes
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can remove their own vote
DROP POLICY IF EXISTS "votes_delete_own" ON votes;
CREATE POLICY "votes_delete_own" ON votes
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 14. RLS POLICIES: SAVED DEALS
-- ============================================
-- Users can only see their own saved deals
DROP POLICY IF EXISTS "saved_deals_select_own" ON saved_deals;
CREATE POLICY "saved_deals_select_own" ON saved_deals
    FOR SELECT USING (auth.uid() = user_id);

-- Users can save deals
DROP POLICY IF EXISTS "saved_deals_insert_own" ON saved_deals;
CREATE POLICY "saved_deals_insert_own" ON saved_deals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can unsave deals
DROP POLICY IF EXISTS "saved_deals_delete_own" ON saved_deals;
CREATE POLICY "saved_deals_delete_own" ON saved_deals
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 15. RLS POLICIES: DEAL IMAGES
-- ============================================
-- Anyone can view images
DROP POLICY IF EXISTS "deal_images_select_all" ON deal_images;
CREATE POLICY "deal_images_select_all" ON deal_images
    FOR SELECT USING (true);

-- Deal author can add images
DROP POLICY IF EXISTS "deal_images_insert_owner" ON deal_images;
CREATE POLICY "deal_images_insert_owner" ON deal_images
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM deals WHERE id = deal_id AND author_id = auth.uid())
    );

-- Deal author can delete images
DROP POLICY IF EXISTS "deal_images_delete_owner" ON deal_images;
CREATE POLICY "deal_images_delete_owner" ON deal_images
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM deals WHERE id = deal_id AND author_id = auth.uid())
    );

-- Moderators and admins can manage images
DROP POLICY IF EXISTS "deal_images_all_mod" ON deal_images;
CREATE POLICY "deal_images_all_mod" ON deal_images
    FOR ALL USING (get_user_role() IN ('moderator', 'super_admin'));

-- ============================================
-- 16. SEED DATA: Create first super_admin
-- Run this AFTER you sign up your first user
-- Replace 'your-user-id-here' with actual UUID
-- ============================================
-- UPDATE profiles SET role = 'super_admin' WHERE id = 'your-user-id-here';
