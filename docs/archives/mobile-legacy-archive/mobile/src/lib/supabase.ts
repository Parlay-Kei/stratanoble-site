import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types based on existing platform types
export type AchieveryActionCategory = 'learning' | 'building' | 'connecting';
export type AchieveryPhase = 'explore' | 'build' | 'launch';

export interface UserDream {
  id: string;
  user_id: string;
  dream_text: string;
  current_phase: AchieveryPhase;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAction {
  id: string;
  user_id: string;
  dream_id: string | null;
  original_text: string;
  reframed_text: string | null;
  category: AchieveryActionCategory;
  phase: AchieveryPhase;
  is_significant: boolean;
  logged_date: string;
  created_at: string;
}

export interface WeeklyNarrative {
  id: string;
  user_id: string;
  week_start: string;
  narrative_text: string;
  actions_count: number;
  created_at: string;
}

export interface Client {
  id: string;
  email: string;
  name: string | null;
  tier: 'lite' | 'growth' | 'partner' | 'enterprise';
  created_at: string;
  updated_at: string;
}

// Auth helper functions
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Action helpers
export const canLogAction = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('can_log_action', {
      user_uuid: userId,
    });
    
    if (error) {
      console.error('Error checking action limit:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error checking action limit:', error);
    return false;
  }
};

export const getUserActionLimit = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc('get_user_action_limit', {
      user_uuid: userId,
    });
    
    if (error) {
      console.error('Error getting action limit:', error);
      return 5; // Default free tier limit
    }
    
    return data || 5;
  } catch (error) {
    console.error('Error getting action limit:', error);
    return 5;
  }
};

// Reframe action via API
export const reframeAction = async (
  actionId: string,
  originalText: string,
  category: AchieveryActionCategory,
  phase: AchieveryPhase,
  userDream?: string
) => {
  try {
    const response = await fetch('/api/reframe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originalText,
        category,
        phase,
        userDream,
        actionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    console.error('Error reframing action:', error);
    return { data: null, error };
  }
};