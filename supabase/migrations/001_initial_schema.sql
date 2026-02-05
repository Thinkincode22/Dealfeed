-- Supabase Migration: Initial Schema for DealFeed
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    reputation INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deals table
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    discount INTEGER DEFAULT 0,
    image_url TEXT,
    store TEXT,
    store_url TEXT,
    category TEXT,
    temperature INTEGER DEFAULT 0,
    coupon_code TEXT,
    shipping_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table (for upvotes/downvotes)
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    value INTEGER CHECK (value IN (-1, 1)), -- 1 for upvote, -1 for downvote
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(deal_id, user_id) -- One vote per user per deal
);

-- Saved deals (bookmarks)
CREATE TABLE saved_deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(deal_id, user_id)
);

-- Function to update deal temperature based on votes
CREATE OR REPLACE FUNCTION update_deal_temperature()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE deals
    SET temperature = (
        SELECT COALESCE(SUM(value), 0) FROM votes WHERE deal_id = NEW.deal_id
    )
    WHERE id = NEW.deal_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update temperature on vote changes
CREATE TRIGGER on_vote_change
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_deal_temperature();

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_deals ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can read, users can update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Deals: Anyone can read, authenticated users can create
CREATE POLICY "Deals are viewable by everyone" ON deals FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create deals" ON deals FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own deals" ON deals FOR UPDATE USING (auth.uid() = author_id);

-- Comments: Anyone can read, authenticated users can create
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Votes: Anyone can read, authenticated users can vote
CREATE POLICY "Votes are viewable by everyone" ON votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON votes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own votes" ON votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON votes FOR DELETE USING (auth.uid() = user_id);

-- Saved deals: Users can only see and manage their own
CREATE POLICY "Users can view own saved deals" ON saved_deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save deals" ON saved_deals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave deals" ON saved_deals FOR DELETE USING (auth.uid() = user_id);
