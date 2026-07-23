-- ============================================
-- DealFeed: Security hardening
-- 1) Close comment-author spoofing gap
-- 2) Defense-in-depth WITH CHECK on deals_update_own
-- 3) Pin search_path on SECURITY DEFINER / trigger functions
-- 4) Revoke unnecessary EXECUTE grants
-- ============================================

-- 1. Comments: author_id must match the caller (mirrors deals_insert_own)
DROP POLICY IF EXISTS "comments_insert_auth" ON comments;
CREATE POLICY "comments_insert_own" ON comments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

-- 2. Deals: explicit WITH CHECK so RLS itself (not just the trigger) blocks author reassignment
DROP POLICY IF EXISTS "deals_update_own" ON deals;
CREATE POLICY "deals_update_own" ON deals
    FOR UPDATE USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

-- 3. Pin search_path to prevent search_path hijacking on SECURITY DEFINER functions
ALTER FUNCTION public.get_user_role() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_deal_temperature() SET search_path = public;
ALTER FUNCTION public.update_deal_search_vector() SET search_path = public;
ALTER FUNCTION public.update_user_role(uuid, text) SET search_path = public;
ALTER FUNCTION public.prevent_deal_status_change() SET search_path = public;

-- 4. Trigger-only functions should never be callable directly via REST RPC
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_deal_status_change() FROM PUBLIC, anon, authenticated;

-- update_user_role is a legitimate admin RPC (called by AdminPage) — keep it for
-- authenticated (function itself enforces super_admin internally), drop for anon.
REVOKE EXECUTE ON FUNCTION public.update_user_role(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_user_role(uuid, text) TO authenticated;
