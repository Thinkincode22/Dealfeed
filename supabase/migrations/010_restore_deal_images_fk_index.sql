-- ============================================
-- DealFeed: Restore deal_images.deal_id index
--
-- Correction to 009_drop_unused_indexes.sql: idx_deal_images_deal_id
-- was mischaracterized as low-stakes. deal_images.deal_id is a
-- foreign key (REFERENCES deals(id) ON DELETE CASCADE), so this index
-- is exactly the kind that should have been kept alongside
-- idx_deals_author_id — it backs cascade deletes (deleting a deal
-- must find all its deal_images rows) and any "images for this deal"
-- lookup. Flagged unused by the advisor for the same near-empty-
-- dev-project reason as idx_deals_author_id, not because it's
-- structurally unnecessary.
-- ============================================

CREATE INDEX IF NOT EXISTS idx_deal_images_deal_id ON deal_images(deal_id);
