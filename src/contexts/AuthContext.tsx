'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, profileData?: Partial<UserProfile>) => Promise<any>;
  signOut: () => Promise<any>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<any>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const router = useRouter();

  const profileOperations = {
    async load(userId: string) {
      if (!userId) return;
      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (!error) setUserProfile(data);
      } catch (error) {
        console.error('Profile load error:', error);
      } finally {
        setProfileLoading(false);
      }
    },
    clear() {
      setUserProfile(null);
      setProfileLoading(false);
    },
  };

  const authStateHandlers = {
    onChange: (event: string | null, session: Session | null) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Handle session expiration
      if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
        console.log('Session expired or user signed out, redirecting to login');
        router.push('/login');
        return;
      }
      
      if (session?.user) profileOperations.load(session.user.id);
      else profileOperations.clear();
    },
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      authStateHandlers.onChange(null, session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(authStateHandlers.onChange);

    return () => subscription?.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        console.log('Sign in successful for:', email);
      } else {
        console.error('Sign in error for:', email, error.message);
      }
      return { data, error };
    } catch {
      return { error: { message: 'Network error. Please try again.' } };
    }
  };

  const signUp = async (email: string, password: string, profileData?: Partial<UserProfile>) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : '/login'
        }
      });
      
      if (!error && data.user && !data.session) {
        // User signed up but needs to confirm email
        return { 
          data, 
          needsConfirmation: true,
          message: 'Registration successful! Please check your email to confirm your account.'
        };
      }
      
      // If registration is successful and we have profile data, create the profile
      if (!error && data.user && profileData) {
        try {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              ...profileData
            });
          
          if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't fail the registration if profile creation fails
          }
        } catch (profileErr) {
          console.error('Profile creation exception:', profileErr);
        }
      }
      
      return { data, error };
    } catch {
      return { error: { message: 'Network error. Please try again.' } };
    }
  };

  const signOut = async () => {
    try {
      console.log('User signing out');
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setUser(null);
        profileOperations.clear();
        console.log('User successfully signed out');
      }
      return { error };
    } catch {
      return { error: { message: 'Network error. Please try again.' } };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: { message: 'No user logged in' } };
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      if (!error) setUserProfile(data);
      return { data, error };
    } catch {
      return { error: { message: 'Network error. Please try again.' } };
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    profileLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
