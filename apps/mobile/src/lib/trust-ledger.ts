/**
 * Trust Ledger - Coach Sharing System
 * 
 * Enables secure sharing of user progress with coaches and mentors
 * while maintaining granular privacy controls.
 */

import { supabase } from './supabase';

export type ShareLevel = 'summary' | 'detailed' | 'full_access';
export type ShareStatus = 'pending' | 'active' | 'expired' | 'revoked';

export interface TrustLedgerShare {
  id: string;
  user_id: string;
  coach_email: string;
  coach_name: string;
  share_level: ShareLevel;
  status: ShareStatus;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  last_accessed: string | null;
  access_count: number;
  notes: string | null;
}

export interface ShareInvitation {
  id: string;
  share_id: string;
  invitation_token: string;
  expires_at: string;
  created_at: string;
}

export interface CoachAccess {
  share_id: string;
  accessed_at: string;
  ip_address: string;
  user_agent: string;
  pages_viewed: string[];
}

export interface ShareSummary {
  dream_overview: {
    dream_text: string;
    current_phase: string;
    phase_duration_days: number;
  };
  progress_stats: {
    total_actions: number;
    actions_this_week: number;
    actions_this_month: number;
    longest_streak: number;
    current_streak: number;
  };
  category_breakdown: {
    learning: { count: number; percentage: number };
    building: { count: number; percentage: number };
    connecting: { count: number; percentage: number };
  };
  recent_highlights: string[];
  key_insights: string[];
}

export interface ShareDetailed extends ShareSummary {
  weekly_progress: Array<{
    week_start: string;
    action_count: number;
    narrative_text: string | null;
    significant_actions: number;
  }>;
  phase_progression: Array<{
    phase: string;
    start_date: string;
    end_date: string | null;
    actions_completed: number;
  }>;
  action_patterns: {
    most_productive_days: string[];
    peak_activity_hours: number[];
    category_trends: Record<string, 'increasing' | 'decreasing' | 'stable'>;
  };
}

export interface ShareFullAccess extends ShareDetailed {
  all_actions: Array<{
    id: string;
    original_text: string;
    reframed_text: string | null;
    category: string;
    phase: string;
    logged_date: string;
    created_at: string;
    is_significant: boolean;
  }>;
  all_narratives: Array<{
    id: string;
    week_start: string;
    narrative_text: string;
    actions_count: number;
    created_at: string;
  }>;
}

class TrustLedgerManager {
  /**
   * Create a new coach share invitation
   */
  async createCoachShare(
    userId: string,
    coachEmail: string,
    coachName: string,
    shareLevel: ShareLevel,
    expirationDays: number = 30,
    notes?: string
  ): Promise<{ share: TrustLedgerShare; invitationUrl: string } | { error: string }> {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expirationDays);

      // Create the share record
      const { data: share, error: shareError } = await supabase
        .from('trust_ledger_shares')
        .insert({
          user_id: userId,
          coach_email: coachEmail.toLowerCase(),
          coach_name: coachName,
          share_level: shareLevel,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
          notes: notes || null,
        })
        .select()
        .single();

      if (shareError) {
        console.error('Error creating trust ledger share:', shareError);
        return { error: shareError.message };
      }

      // Generate invitation token
      const invitationToken = this.generateSecureToken();
      const invitationExpires = new Date();
      invitationExpires.setHours(invitationExpires.getHours() + 24); // 24 hour invitation window

      const { error: invitationError } = await supabase
        .from('trust_ledger_invitations')
        .insert({
          share_id: share.id,
          invitation_token: invitationToken,
          expires_at: invitationExpires.toISOString(),
        });

      if (invitationError) {
        console.error('Error creating invitation:', invitationError);
        return { error: invitationError.message };
      }

      // Generate invitation URL
      const invitationUrl = `https://achievery.stratanoble.com/trust-ledger/accept/${invitationToken}`;

      return {
        share,
        invitationUrl,
      };
    } catch (error) {
      console.error('Error in createCoachShare:', error);
      return { error: 'Failed to create coach share' };
    }
  }

  /**
   * Get all active shares for a user
   */
  async getUserShares(userId: string): Promise<TrustLedgerShare[]> {
    try {
      const { data, error } = await supabase
        .from('trust_ledger_shares')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user shares:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserShares:', error);
      return [];
    }
  }

  /**
   * Revoke a coach share
   */
  async revokeShare(shareId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('trust_ledger_shares')
        .update({
          status: 'revoked',
          updated_at: new Date().toISOString(),
        })
        .eq('id', shareId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error revoking share:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in revokeShare:', error);
      return { success: false, error: 'Failed to revoke share' };
    }
  }

  /**
   * Update share level
   */
  async updateShareLevel(
    shareId: string,
    userId: string,
    newLevel: ShareLevel
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('trust_ledger_shares')
        .update({
          share_level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('id', shareId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating share level:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateShareLevel:', error);
      return { success: false, error: 'Failed to update share level' };
    }
  }

  /**
   * Generate share data based on access level
   */
  async generateShareData(
    userId: string,
    shareLevel: ShareLevel
  ): Promise<ShareSummary | ShareDetailed | ShareFullAccess | { error: string }> {
    try {
      // Get user's dream
      const { data: dream } = await supabase
        .from('user_dreams')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      // Get all user actions
      const { data: actions } = await supabase
        .from('user_actions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Get narratives
      const { data: narratives } = await supabase
        .from('weekly_narratives')
        .select('*')
        .eq('user_id', userId)
        .order('week_start', { ascending: false });

      if (!actions) {
        return { error: 'No action data found' };
      }

      // Calculate base summary data
      const summary = await this.calculateSummaryData(userId, dream, actions, narratives || []);

      if (shareLevel === 'summary') {
        return summary;
      }

      // For detailed and full access, add more comprehensive data
      const detailed = await this.calculateDetailedData(summary, actions, narratives || []);

      if (shareLevel === 'detailed') {
        return detailed;
      }

      // Full access includes raw action and narrative data
      const fullAccess: ShareFullAccess = {
        ...detailed,
        all_actions: actions.map(action => ({
          id: action.id,
          original_text: action.original_text,
          reframed_text: action.reframed_text,
          category: action.category,
          phase: action.phase,
          logged_date: action.logged_date,
          created_at: action.created_at,
          is_significant: action.is_significant || false,
        })),
        all_narratives: narratives.map(narrative => ({
          id: narrative.id,
          week_start: narrative.week_start,
          narrative_text: narrative.narrative_text,
          actions_count: narrative.actions_count || 0,
          created_at: narrative.created_at,
        })),
      };

      return fullAccess;
    } catch (error) {
      console.error('Error generating share data:', error);
      return { error: 'Failed to generate share data' };
    }
  }

  /**
   * Calculate summary statistics
   */
  private async calculateSummaryData(
    userId: string,
    dream: any,
    actions: any[],
    narratives: any[]
  ): Promise<ShareSummary> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Calculate basic stats
    const actionsThisWeek = actions.filter(
      action => new Date(action.logged_date) >= weekStart
    ).length;

    const actionsThisMonth = actions.filter(
      action => new Date(action.logged_date) >= monthStart
    ).length;

    // Calculate streaks
    const { currentStreak, longestStreak } = this.calculateStreaks(actions);

    // Category breakdown
    const categoryBreakdown = this.calculateCategoryBreakdown(actions);

    // Recent highlights (significant actions from last 2 weeks)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const recentHighlights = actions
      .filter(action => 
        action.is_significant && 
        new Date(action.logged_date) >= twoWeeksAgo
      )
      .slice(0, 5)
      .map(action => action.reframed_text || action.original_text);

    // Key insights from recent narratives
    const keyInsights = narratives
      .slice(0, 3)
      .map(narrative => {
        // Extract key insight from narrative (simplified - would use AI in production)
        const sentences = narrative.narrative_text.split('.');
        return sentences[0] + '.';
      });

    const phaseDurationDays = dream ? 
      Math.floor((now.getTime() - new Date(dream.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return {
      dream_overview: {
        dream_text: dream?.dream_text || 'No active dream',
        current_phase: dream?.current_phase || 'explore',
        phase_duration_days: phaseDurationDays,
      },
      progress_stats: {
        total_actions: actions.length,
        actions_this_week: actionsThisWeek,
        actions_this_month: actionsThisMonth,
        longest_streak: longestStreak,
        current_streak: currentStreak,
      },
      category_breakdown: categoryBreakdown,
      recent_highlights: recentHighlights,
      key_insights: keyInsights,
    };
  }

  /**
   * Calculate detailed analytics
   */
  private async calculateDetailedData(
    summary: ShareSummary,
    actions: any[],
    narratives: any[]
  ): Promise<ShareDetailed> {
    // Weekly progress for last 8 weeks
    const weeklyProgress = this.calculateWeeklyProgress(actions, narratives);
    
    // Phase progression
    const phaseProgression = this.calculatePhaseProgression(actions);
    
    // Action patterns
    const actionPatterns = this.calculateActionPatterns(actions);

    return {
      ...summary,
      weekly_progress: weeklyProgress,
      phase_progression: phaseProgression,
      action_patterns: actionPatterns,
    };
  }

  /**
   * Calculate streak data
   */
  private calculateStreaks(actions: any[]): { currentStreak: number; longestStreak: number } {
    if (actions.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Group actions by date
    const actionsByDate = new Map<string, number>();
    actions.forEach(action => {
      const date = action.logged_date;
      actionsByDate.set(date, (actionsByDate.get(date) || 0) + 1);
    });

    const sortedDates = Array.from(actionsByDate.keys()).sort();
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date().toISOString().split('T')[0];
    let checkDate = new Date();

    // Calculate current streak (working backwards from today)
    while (checkDate >= new Date(sortedDates[0])) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (actionsByDate.has(dateStr)) {
        currentStreak++;
      } else if (dateStr !== today) {
        // Allow for today to not have actions yet
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Calculate longest streak
    let previousDate: Date | null = null;
    for (const dateStr of sortedDates) {
      const currentDate = new Date(dateStr);
      
      if (previousDate && currentDate.getTime() - previousDate.getTime() === 24 * 60 * 60 * 1000) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);
      previousDate = currentDate;
    }

    return { currentStreak, longestStreak };
  }

  /**
   * Calculate category breakdown
   */
  private calculateCategoryBreakdown(actions: any[]) {
    const total = actions.length;
    if (total === 0) {
      return {
        learning: { count: 0, percentage: 0 },
        building: { count: 0, percentage: 0 },
        connecting: { count: 0, percentage: 0 },
      };
    }

    const counts = {
      learning: actions.filter(a => a.category === 'learning').length,
      building: actions.filter(a => a.category === 'building').length,
      connecting: actions.filter(a => a.category === 'connecting').length,
    };

    return {
      learning: { count: counts.learning, percentage: Math.round((counts.learning / total) * 100) },
      building: { count: counts.building, percentage: Math.round((counts.building / total) * 100) },
      connecting: { count: counts.connecting, percentage: Math.round((counts.connecting / total) * 100) },
    };
  }

  /**
   * Calculate weekly progress
   */
  private calculateWeeklyProgress(actions: any[], narratives: any[]) {
    // Implementation would calculate last 8 weeks of data
    // This is a simplified version
    return [];
  }

  /**
   * Calculate phase progression
   */
  private calculatePhaseProgression(actions: any[]) {
    // Implementation would track phase changes over time
    // This is a simplified version
    return [];
  }

  /**
   * Calculate action patterns
   */
  private calculateActionPatterns(actions: any[]) {
    // Implementation would analyze patterns in user behavior
    // This is a simplified version
    return {
      most_productive_days: ['Saturday', 'Sunday'],
      peak_activity_hours: [9, 14, 19],
      category_trends: {
        learning: 'increasing' as const,
        building: 'stable' as const,
        connecting: 'increasing' as const,
      },
    };
  }

  /**
   * Generate secure token for invitations
   */
  private generateSecureToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Send invitation email to coach
   */
  async sendInvitationEmail(
    coachEmail: string,
    coachName: string,
    userDreamText: string,
    invitationUrl: string,
    shareLevel: ShareLevel
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real implementation, this would send an email via SendGrid or similar
      // For now, we'll just log the invitation details
      console.log('Trust Ledger Invitation:', {
        to: coachEmail,
        coach: coachName,
        dream: userDreamText,
        url: invitationUrl,
        level: shareLevel,
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending invitation email:', error);
      return { success: false, error: 'Failed to send invitation email' };
    }
  }
}

// Export singleton instance
export const trustLedgerManager = new TrustLedgerManager();

// Share level descriptions for UI
export const SHARE_LEVEL_DESCRIPTIONS = {
  summary: {
    title: 'Summary Access',
    description: 'Overview of progress, goals, and key insights',
    includes: ['Dream overview', 'Progress statistics', 'Category breakdown', 'Recent highlights'],
  },
  detailed: {
    title: 'Detailed Access',
    description: 'Comprehensive analytics and weekly progress',
    includes: ['Everything in Summary', 'Weekly progress charts', 'Phase progression', 'Action patterns'],
  },
  full_access: {
    title: 'Full Access',
    description: 'Complete visibility into all activities and narratives',
    includes: ['Everything in Detailed', 'All action details', 'All weekly narratives', 'Raw data access'],
  },
} as const;