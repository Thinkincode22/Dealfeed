-- ============================================
-- DealFeed: RLS performance fix (0003_auth_rls_initplan)
-- Wrap auth.uid() in a subselect so Postgres evaluates it once per
-- statement (initPlan) instead of once per row.
-- ============================================

-- deals_delete_own: users can delete their own deals
DROP POLICY IF EXISTS "deals_delete_own" ON deals;
CREATE POLICY "deals_delete_own" ON deals
    FOR DELETE USING ((select auth.uid()) = author_id);
