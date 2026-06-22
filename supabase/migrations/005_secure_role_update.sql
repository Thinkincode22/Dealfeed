-- ============================================
-- DealFeed: Secure role update function
-- Only super_admin can change user roles
-- ============================================

-- Drop direct profile update ability for the 'role' column
-- by replacing the permissive update policy with a restricted one

-- Remove the overly-permissive self-update policy
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

-- Recreate: users can update own profile EXCEPT role
CREATE POLICY "profiles_update_own_no_role" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()))
    );

-- Secure RPC function: only super_admin can call
CREATE OR REPLACE FUNCTION update_user_role(target_user_id UUID, new_role TEXT)
RETURNS VOID AS $$
BEGIN
    -- Validate role value
    IF new_role NOT IN ('super_admin', 'moderator', 'user') THEN
        RAISE EXCEPTION 'Invalid role: %', new_role;
    END IF;

    -- Only super_admin can change roles
    IF get_user_role() != 'super_admin' THEN
        RAISE EXCEPTION 'Only super_admin can change user roles';
    END IF;

    -- Prevent demoting yourself
    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Cannot change your own role';
    END IF;

    UPDATE profiles SET role = new_role WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
