import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type UserRole = 'super_admin' | 'moderator' | 'user' | null;

interface UseUserRoleResult {
    role: UserRole;
    loading: boolean;
    isAdmin: boolean;
    isModerator: boolean;
    canModerate: boolean;
}

export const useUserRole = (): UseUserRoleResult => {
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRole = async () => {
            if (!isSupabaseConfigured || !supabase) {
                setRole('user'); // Default for mock mode
                setLoading(false);
                return;
            }

            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setRole(null);
                    setLoading(false);
                    return;
                }

                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                setRole(profile?.role || 'user');
            } catch (err) {
                console.error('Error fetching user role:', err);
                setRole(null);
            } finally {
                setLoading(false);
            }
        };

        fetchRole();

        // Subscribe to auth changes
        if (supabase) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
                fetchRole();
            });

            return () => subscription.unsubscribe();
        }
    }, []);

    return {
        role,
        loading,
        isAdmin: role === 'super_admin',
        isModerator: role === 'moderator',
        canModerate: role === 'super_admin' || role === 'moderator',
    };
};
