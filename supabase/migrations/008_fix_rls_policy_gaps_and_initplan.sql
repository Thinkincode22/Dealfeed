-- ============================================
-- DealFeed: Security audit fixes
--
-- PART A — close real authorization gaps (not just perf):
--   Earlier migrations added stricter policies but dropped the wrong
--   policy name (or none at all), leaving old permissive policies
--   active alongside the new ones. Postgres OR's all policies of the
--   same command together, so one leftover permissive policy defeats
--   every stricter one layered on top of it.
--
--   1. deals SELECT: "deals_select_all" (002_rbac_schema.sql) used
--      `is_active = true OR ...`. is_active defaults to TRUE and is
--      unrelated to the moderation `status` column added later, so
--      pending/rejected deals were publicly readable via the REST API
--      regardless of "Deals feed policy" (004). The app's own
--      `.eq('status','approved')` filter is not a security boundary.
--   2. deals INSERT: "deals_insert_auth" (002) had no author_id/status
--      check at all, and "Users can create own deals" (004) had no
--      status check — both left active alongside deals_insert_own /
--      deals_insert_moderator (006), letting any authenticated user
--      insert a deal under someone else's author_id and/or with
--      status='approved', bypassing the moderation queue entirely.
--
-- PART B — auth_rls_initplan: wrap auth.*()/get_user_role() in a
--   subselect so Postgres evaluates them once per statement (initPlan)
--   instead of once per row. Logic is unchanged in this part.
-- ============================================

-- ============================================
-- PART A: drop leftover permissive policies
-- ============================================
DROP POLICY IF EXISTS "deals_select_all" ON deals;
DROP POLICY IF EXISTS "deals_insert_auth" ON deals;
DROP POLICY IF EXISTS "Users can create own deals" ON deals;

-- ============================================
-- PART B: initplan fixes (logic unchanged)
-- ============================================

-- profiles
DROP POLICY IF EXISTS "profiles_update_own_no_role" ON public.profiles;
CREATE POLICY "profiles_update_own_no_role" ON public.profiles
FOR UPDATE
USING ((select auth.uid()) = id)
WITH CHECK (
  (select auth.uid()) = id
  AND (
    role IS NOT DISTINCT FROM (
      SELECT role
      FROM public.profiles
      WHERE id = (select auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
CREATE POLICY "profiles_update_admin" ON profiles
    FOR UPDATE USING ((select get_user_role()) = 'super_admin');

-- deals
DROP POLICY IF EXISTS "Deals feed policy" ON deals;
CREATE POLICY "Deals feed policy" ON deals
    FOR SELECT USING (
        status = 'approved'
        OR author_id = (select auth.uid())
        OR (select get_user_role()) IN ('moderator', 'super_admin')
    );

DROP POLICY IF EXISTS "deals_insert_own" ON deals;
CREATE POLICY "deals_insert_own" ON deals
    FOR INSERT WITH CHECK (
        (select auth.uid()) = author_id
        AND (select auth.role()) = 'authenticated'
        AND status = 'pending'
    );

DROP POLICY IF EXISTS "deals_insert_moderator" ON deals;
CREATE POLICY "deals_insert_moderator" ON deals
    FOR INSERT WITH CHECK (
        (select auth.uid()) = author_id
        AND (select get_user_role()) IN ('moderator', 'super_admin')
    );

DROP POLICY IF EXISTS "deals_update_own" ON deals;
CREATE POLICY "deals_update_own" ON deals
    FOR UPDATE USING ((select auth.uid()) = author_id)
    WITH CHECK ((select auth.uid()) = author_id);

DROP POLICY IF EXISTS "deals_delete_own" ON deals;
CREATE POLICY "deals_delete_own" ON deals
    FOR DELETE USING ((select auth.uid()) = author_id);

DROP POLICY IF EXISTS "deals_update_moderator" ON deals;
CREATE POLICY "deals_update_moderator" ON deals
    FOR UPDATE USING ((select get_user_role()) = 'moderator');

DROP POLICY IF EXISTS "deals_delete_moderator" ON deals;
CREATE POLICY "deals_delete_moderator" ON deals
    FOR DELETE USING ((select get_user_role()) = 'moderator');

DROP POLICY IF EXISTS "deals_all_admin" ON deals;
CREATE POLICY "deals_all_admin" ON deals
    FOR ALL USING ((select get_user_role()) = 'super_admin');

-- comments
DROP POLICY IF EXISTS "comments_insert_own" ON comments;
CREATE POLICY "comments_insert_own" ON comments
    FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated' AND (select auth.uid()) = author_id);

DROP POLICY IF EXISTS "comments_update_own" ON comments;
CREATE POLICY "comments_update_own" ON comments
    FOR UPDATE USING ((select auth.uid()) = author_id);

DROP POLICY IF EXISTS "comments_delete_own" ON comments;
CREATE POLICY "comments_delete_own" ON comments
    FOR DELETE USING ((select auth.uid()) = author_id);

DROP POLICY IF EXISTS "comments_delete_moderator" ON comments;
CREATE POLICY "comments_delete_moderator" ON comments
    FOR DELETE USING ((select get_user_role()) = 'moderator');

DROP POLICY IF EXISTS "comments_all_admin" ON comments;
CREATE POLICY "comments_all_admin" ON comments
    FOR ALL USING ((select get_user_role()) = 'super_admin');

-- votes
DROP POLICY IF EXISTS "votes_insert_auth" ON votes;
CREATE POLICY "votes_insert_auth" ON votes
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "votes_update_own" ON votes;
CREATE POLICY "votes_update_own" ON votes
    FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "votes_delete_own" ON votes;
CREATE POLICY "votes_delete_own" ON votes
    FOR DELETE USING ((select auth.uid()) = user_id);

-- saved_deals
DROP POLICY IF EXISTS "saved_deals_select_own" ON saved_deals;
CREATE POLICY "saved_deals_select_own" ON saved_deals
    FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "saved_deals_insert_own" ON saved_deals;
CREATE POLICY "saved_deals_insert_own" ON saved_deals
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "saved_deals_delete_own" ON saved_deals;
CREATE POLICY "saved_deals_delete_own" ON saved_deals
    FOR DELETE USING ((select auth.uid()) = user_id);

-- deal_images
DROP POLICY IF EXISTS "deal_images_insert_owner" ON deal_images;
CREATE POLICY "deal_images_insert_owner" ON deal_images
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM deals WHERE id = deal_id AND author_id = (select auth.uid()))
    );

DROP POLICY IF EXISTS "deal_images_delete_owner" ON deal_images;
CREATE POLICY "deal_images_delete_owner" ON deal_images
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM deals WHERE id = deal_id AND author_id = (select auth.uid()))
    );

DROP POLICY IF EXISTS "deal_images_all_mod" ON deal_images;
CREATE POLICY "deal_images_all_mod" ON deal_images
    FOR ALL USING ((select get_user_role()) IN ('moderator', 'super_admin'));
