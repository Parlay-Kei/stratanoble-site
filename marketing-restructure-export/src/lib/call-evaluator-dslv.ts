/**
 * DSLV Call Evaluation System
 * 
 * Analyzes call transcripts, conversation quality, and lead qualification
 * Provides actionable insights for improving conversion rates
 */

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface CallEvaluation {
  call_sid: string;
  campaign_type: 'internet' | 'voip' | 'security' | 'cisco';
  
  // Overall scoring
  overall_score: number; // 0-100
  qualification_score: number; // 0-100
  conversation_quality_score: number; // 0-100
  
  // Qualification analysis
  qualification: {
    interest_level: 'high' | 'medium' | 'low' | 'not_interested';
    decision_maker: 'yes' | 'no' | 'unknown';
    pain_points_identified: string[];
    current_solution_mentioned: boolean;
    budget_discussed: boolean;
    timeline_identified: boolean;
    next_steps_clear: boolean;
  };
  
  // Conversation quality
  quality_metrics: {
    natural_flow_score: number; // 0-100
    active_listening_score: number; // 0-100
    rapport_building_score: number; // 0-100
    objection_handling_score: number; // 0-100
    call_control_score: number; // 0-100
    
    // Specific observations
    talked_too_much: boolean;
    interrupted_prospect: boolean;
    sounded_scripted: boolean;
    used_filler_words_excessively: boolean;
    maintained_professional_tone: boolean;
  };
  
  // Outcome
  outcome: {
    result: 'qualified' | 'not_interested' | 'callback' | 'send_info' | 'voicemail' | 'no_answer';
    appointment_booked: boolean;
    callback_scheduled: boolean;
    info_requested: boolean;
    opt_out_requested: boolean;
  };
  
  // Recommendations
  recommendations: string[];
  
  // Raw data
  transcript: Array<{ role: 'assistant' | 'user'; content: string; timestamp: Date }>;
  duration_seconds: number;
  turn_count: number;
  
  evaluated_at: Date;
}

export interface EvaluationInsights {
  campaign_id: string;
  period: { start: Date; end: Date };
  
  // Aggregate metrics
  total_calls: number;
  avg_overall_score: number;
  avg_qualification_score: number;
  avg_conversation_quality: number;
  
  // Trends
  improvement_areas: Array<{
    area: string;
    current_score: number;
    impact: 'high' | 'medium' | 'low';
    recommendation: string;
  }>;
  
  // Best practices
  top_performing_patterns: string[];
  common_mistakes: string[];
  
  // A/B testing results (if applicable)
  variant_performance?: Record<string, {
    calls: number;
    conversion_rate: number;
    avg_score: number;
  }>;
}

/**
 * Call Evaluator
 */
export class CallEvaluator {
  /**
   * Evaluate a completed call using GPT-4 analysis
   */
  async evaluateCall(
    callSid: string,
    campaignType: 'internet' | 'voip' | 'security' | 'cisco',
    transcript: Array<{ role: 'assistant' | 'user'; content: string; timestamp: Date }>,
    durationSeconds: number
  ): Promise<CallEvaluation> {
    console.log(`[evaluator] Evaluating call ${callSid}`);

    // Prepare transcript for analysis
    const transcriptText = transcript
      .map(t => `${t.role === 'assistant' ? 'Agent' : 'Prospect'}: ${t.content}`)
      .join('\n');

    // Use GPT-4 to analyze the conversation
    const analysis = await this.analyzeWithGPT4(transcriptText, campaignType);

    // Calculate scores
    const qualificationScore = this.calculateQualificationScore(analysis);
    const qualityScore = this.calculateQualityScore(analysis);
    const overallScore = Math.round((qualificationScore + qualityScore) / 2);

    const evaluation: CallEvaluation = {
      call_sid: callSid,
      campaign_type: campaignType,
      overall_score: overallScore,
      qualification_score: qualificationScore,
      conversation_quality_score: qualityScore,
      qualification: analysis.qualification,
      quality_metrics: analysis.quality_metrics,
      outcome: analysis.outcome,
      recommendations: this.generateRecommendations(analysis, overallScore),
      transcript,
      duration_seconds: durationSeconds,
      turn_count: transcript.length,
      evaluated_at: new Date(),
    };

    console.log(`[evaluator] Call ${callSid} scored ${overallScore}/100`);
    return evaluation;
  }

  /**
   * Get campaign-wide insights from multiple call evaluations
   */
  async getCampaignInsights(
    campaignId: string,
    period: { start: Date; end: Date }
  ): Promise<EvaluationInsights> {
    // This would query Supabase for all evaluations in the period
    // For now, returning structure
    
    return {
      campaign_id: campaignId,
      period,
      total_calls: 0,
      avg_overall_score: 0,
      avg_qualification_score: 0,
      avg_conversation_quality: 0,
      improvement_areas: [],
      top_performing_patterns: [],
      common_mistakes: [],
    };
  }

  /**
   * Analyze conversation using GPT-4
   */
  private async analyzeWithGPT4(
    transcript: string,
    campaignType: string
  ): Promise<any> {
    const systemPrompt = `You are an expert sales call evaluator analyzing cold calling conversations for Data Solutions LV.

Analyze this ${campaignType} sales call transcript and provide a detailed evaluation.

Focus on:
1. Lead Qualification: Did the agent identify interest, pain points, decision-making authority, and next steps?
2. Conversation Quality: Natural flow, active listening, rapport building, objection handling
3. Professionalism: Tone, pacing, respect for prospect's time
4. Outcome: What was achieved? What should happen next?

Respond with a JSON object following this exact structure:
{
  "qualification": {
    "interest_level": "high|medium|low|not_interested",
    "decision_maker": "yes|no|unknown",
    "pain_points_identified": ["list of pain points"],
    "current_solution_mentioned": true|false,
    "budget_discussed": true|false,
    "timeline_identified": true|false,
    "next_steps_clear": true|false
  },
  "quality_metrics": {
    "natural_flow_score": 0-100,
    "active_listening_score": 0-100,
    "rapport_building_score": 0-100,
    "objection_handling_score": 0-100,
    "call_control_score": 0-100,
    "talked_too_much": true|false,
    "interrupted_prospect": true|false,
    "sounded_scripted": true|false,
    "used_filler_words_excessively": true|false,
    "maintained_professional_tone": true|false
  },
  "outcome": {
    "result": "qualified|not_interested|callback|send_info|voicemail|no_answer",
    "appointment_booked": true|false,
    "callback_scheduled": true|false,
    "info_requested": true|false,
    "opt_out_requested": true|false
  },
  "key_observations": ["list of 3-5 specific observations"]
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this call:\n\n${transcript}` },
        ],
        temperature: 0.3, // Lower temperature for consistent analysis
        response_format: { type: 'json_object' },
      });

      const analysisText = completion.choices[0].message.content || '{}';
      return JSON.parse(analysisText);
    } catch (error) {
      console.error('[evaluator] GPT-4 analysis failed:', error);
      
      // Return default analysis on error
      return {
        qualification: {
          interest_level: 'unknown',
          decision_maker: 'unknown',
          pain_points_identified: [],
          current_solution_mentioned: false,
          budget_discussed: false,
          timeline_identified: false,
          next_steps_clear: false,
        },
        quality_metrics: {
          natural_flow_score: 50,
          active_listening_score: 50,
          rapport_building_score: 50,
          objection_handling_score: 50,
          call_control_score: 50,
          talked_too_much: false,
          interrupted_prospect: false,
          sounded_scripted: false,
          used_filler_words_excessively: false,
          maintained_professional_tone: true,
        },
        outcome: {
          result: 'unknown',
          appointment_booked: false,
          callback_scheduled: false,
          info_requested: false,
          opt_out_requested: false,
        },
        key_observations: ['Analysis unavailable - call completed'],
      };
    }
  }

  /**
   * Calculate qualification score
   */
  private calculateQualificationScore(analysis: any): number {
    let score = 0;
    const qual = analysis.qualification;

    // Interest level (30 points)
    if (qual.interest_level === 'high') score += 30;
    else if (qual.interest_level === 'medium') score += 20;
    else if (qual.interest_level === 'low') score += 10;

    // Decision maker identified (20 points)
    if (qual.decision_maker === 'yes') score += 20;
    else if (qual.decision_maker === 'unknown') score += 10;

    // Pain points (20 points)
    score += Math.min(qual.pain_points_identified.length * 5, 20);

    // Current solution (10 points)
    if (qual.current_solution_mentioned) score += 10;

    // Budget discussed (10 points)
    if (qual.budget_discussed) score += 10;

    // Timeline identified (10 points)
    if (qual.timeline_identified) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Calculate conversation quality score
   */
  private calculateQualityScore(analysis: any): number {
    const metrics = analysis.quality_metrics;
    
    // Average of quality scores (70% weight)
    const avgScore = (
      metrics.natural_flow_score +
      metrics.active_listening_score +
      metrics.rapport_building_score +
      metrics.objection_handling_score +
      metrics.call_control_score
    ) / 5;

    // Deductions for negative behaviors (30% weight)
    let deductions = 0;
    if (metrics.talked_too_much) deductions += 10;
    if (metrics.interrupted_prospect) deductions += 10;
    if (metrics.sounded_scripted) deductions += 5;
    if (metrics.used_filler_words_excessively) deductions += 5;
    if (!metrics.maintained_professional_tone) deductions += 20;

    return Math.max(Math.round(avgScore * 0.7 - deductions), 0);
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(analysis: any, overallScore: number): string[] {
    const recommendations: string[] = [];

    // Qualification recommendations
    const qual = analysis.qualification;
    if (qual.interest_level === 'low' || qual.interest_level === 'not_interested') {
      recommendations.push('Focus on identifying pain points earlier in the conversation');
    }
    if (qual.decision_maker === 'no' || qual.decision_maker === 'unknown') {
      recommendations.push('Ask directly: "Are you the person who handles [service] decisions?"');
    }
    if (qual.pain_points_identified.length < 2) {
      recommendations.push('Use more discovery questions to uncover specific pain points');
    }
    if (!qual.next_steps_clear) {
      recommendations.push('Always end with a clear next step, even if just "I\'ll send you info"');
    }

    // Quality recommendations
    const metrics = analysis.quality_metrics;
    if (metrics.natural_flow_score < 70) {
      recommendations.push('Work on making the conversation more natural - avoid sounding scripted');
    }
    if (metrics.active_listening_score < 70) {
      recommendations.push('Pause more after prospect speaks to show you\'re listening');
    }
    if (metrics.rapport_building_score < 70) {
      recommendations.push('Spend more time building rapport before pitching');
    }
    if (metrics.talked_too_much) {
      recommendations.push('Let the prospect talk more - aim for 60/40 split (prospect/agent)');
    }
    if (metrics.interrupted_prospect) {
      recommendations.push('Avoid interrupting - let prospects finish their thoughts');
    }

    // Score-based recommendations
    if (overallScore >= 80) {
      recommendations.push('Excellent call! Consider using this as a training example');
    } else if (overallScore >= 60) {
      recommendations.push('Solid performance with room for improvement in qualification');
    } else if (overallScore >= 40) {
      recommendations.push('Review the call with your manager to identify improvement areas');
    } else {
      recommendations.push('Consider additional training on cold calling fundamentals');
    }

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }
}

/**
 * Real-time Call Coaching
 * Provides live feedback during ongoing calls
 */
export class RealTimeCoach {
  /**
   * Analyze conversation so far and provide coaching tips
   */
  async getCoachingTips(
    messages: Array<{ role: string; content: string }>,
    campaignType: string
  ): Promise<string[]> {
    const tips: string[] = [];

    const conversation = messages.map(m => m.content.toLowerCase()).join(' ');
    const turnCount = messages.filter(m => m.role === 'user').length;

    // Early rapport building (turns 1-2)
    if (turnCount <= 2) {
      if (!conversation.includes('how are') && !conversation.includes('how\'s')) {
        tips.push('Start with rapport - ask how they\'re doing');
      }
    }

    // Discovery phase (turns 3-5)
    if (turnCount >= 3 && turnCount <= 5) {
      const hasQuestions = (conversation.match(/\?/g) || []).length;
      if (hasQuestions < 2) {
        tips.push('Ask more discovery questions to understand their needs');
      }
    }

    // Pain point identification
    const painKeywords = ['slow', 'expensive', 'unreliable', 'old', 'frustrated'];
    const hasPainPoint = painKeywords.some(kw => conversation.includes(kw));
    if (turnCount >= 4 && !hasPainPoint) {
      tips.push('Dig deeper to uncover specific pain points');
    }

    // Decision maker qualification
    if (turnCount >= 5 && !conversation.includes('decision') && !conversation.includes('handle')) {
      tips.push('Confirm you\'re speaking with the decision maker');
    }

    // Call-to-action
    if (turnCount >= 8 && !conversation.includes('call back') && !conversation.includes('schedule')) {
      tips.push('Time to suggest a next step - offer a callback or consultation');
    }

    return tips;
  }
}

// Export singleton instances
export const callEvaluator = new CallEvaluator();
export const realTimeCoach = new RealTimeCoach();
