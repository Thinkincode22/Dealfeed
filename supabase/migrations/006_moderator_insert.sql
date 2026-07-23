-- ============================================
-- DealFeed: allow moderators/admins to insert deals
-- with status set directly (bypassing the pending queue),
-- while regular users can only ever insert as 'pending'.
-- ============================================

DROP POLICY IF EXISTS "deals_insert_own" ON deals;

CREATE POLICY "deals_insert_own" ON deals
    FOR INSERT WITH CHECK (
        auth.uid() = author_id
        AND auth.role() = 'authenticated'
        AND status = 'pending'
    );

CREATE POLICY "deals_insert_moderator" ON deals
    FOR INSERT WITH CHECK (
        auth.uid() = author_id
        AND get_user_role() IN ('moderator', 'super_admin')
    );
