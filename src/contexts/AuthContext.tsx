import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { currentUser } from '../data/mockUser';
import type { UserProfile } from '../types/user';

interface User {
    id: string;
    email: string;
    profile: UserProfile | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<{ error: Error | null }>;
    resetPassword: (email: string) => Promise<{ error: Error | null }>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock mode: start logged out by default
        if (!isSupabaseConfigured || !supabase) {
            setLoading(false);
            return;
        }

        // Real Supabase mode
        const fetchUser = async () => {
            try {
                const { data: { user: authUser } } = await supabase!.auth.getUser();

                if (!authUser) {
                    setUser(null);
                    return;
                }

                const { data: profile } = await supabase!
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                setUser({
                    id: authUser.id,
                    email: authUser.email || '',
                    profile: profile ? {
                        username: profile.username,
                        avatar: profile.avatar_url,
                        email: authUser.email || '',
                        bio: profile.bio || '',
                        joinDate: new Date(profile.created_at),
                        reputation: profile.reputation,
                        dealsPosted: 0,
                        location: profile.location,
                    } : null,
                });
            } catch (err) {
                console.error('Error fetching user:', err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchUser();
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        if (!supabase) {
            // Mock login
            setUser({
                id: 'mock-user-id',
                email: currentUser.email,
                profile: currentUser,
            });
            return { error: null };
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error ? new Error(error.message) : null };
    };

    const signUp = async (email: string, password: string, username: string) => {
        if (!supabase) {
            // Mock signup
            setUser({
                id: 'mock-user-id',
                email: email,
                profile: {
                    ...currentUser,
                    username,
                    email,
                },
            });
            return { error: null };
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username }
            }
        });
        return { error: error ? new Error(error.message) : null };
    };

    const signOut = async () => {
        if (!supabase) {
            setUser(null);
            return;
        }
        await supabase.auth.signOut();
        setUser(null);
    };

    const signInWithGoogle = async () => {
        if (!supabase) return { error: new Error('Supabase not configured') };

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            }
        });
        return { error: error ? new Error(error.message) : null };
    };

    const resetPassword = async (email: string) => {
        if (!supabase) return { error: new Error('Supabase not configured') };

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        return { error: error ? new Error(error.message) : null };
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signIn,
            signUp,
            signOut,
            signInWithGoogle,
            resetPassword,
            isAuthenticated: !!user,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
