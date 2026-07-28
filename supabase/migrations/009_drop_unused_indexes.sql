-- ============================================
-- DealFeed: Drop unused indexes (performance audit finding)
--
-- Confirmed via Supabase's performance advisor (pg_stat_user_indexes:
-- zero scans) AND independently via source-code review:
--
--   idx_deals_search    — no code path ever calls .textSearch()/
--                          websearch_to_tsquery(); useFilteredDeals.ts
--                          does search entirely client-side over the
--                          already-loaded page via string .includes().
--   idx_deals_category  — category filtering happens client-side in
--   idx_deals_store       useFilteredDeals.ts, never sent as a
--                          Supabase .eq()/.filter() call.
--   idx_deals_temperature — "Trending" sort is client-side too, no
--                            .order('temperature', ...) query exists.
--   idx_comments_created_at,
--   idx_deal_images_deal_id — low-stakes, not FK/RLS-predicate
--                             columns, flagged unused with no
--                             conflicting code-level explanation.
--
-- Deliberately NOT dropping idx_deals_author_id here even though the
-- advisor flags it unused too — it backs a foreign key and is the
-- column checked in nearly every RLS policy on deals
-- (author_id = auth.uid()). "Unused" on a near-empty dev project is
-- not a reliable signal for an FK/RLS-critical index; keep it.
--
-- If server-side search/filtering is ever implemented (see audit
-- notes on useFilteredDeals.ts), idx_deals_search/category/store/
-- temperature should be re-added at that point.
-- ============================================

DROP INDEX IF EXISTS idx_deals_search;
DROP INDEX IF EXISTS idx_deals_category;
DROP INDEX IF EXISTS idx_deals_store;
DROP INDEX IF EXISTS idx_deals_temperature;
DROP INDEX IF EXISTS idx_comments_created_at;
DROP INDEX IF EXISTS idx_deal_images_deal_id;
