/**
 * DSLV Cold Calling - Call Evaluation System
 * 
 * GPT-4 powered conversation analysis for cold calls
 * Provides scoring, insights, and coaching recommendations
 */

import OpenAI from 'openai';
import type { CampaignType, QualificationData } from './conversation-config';
import { calculateQualificationScore, extractQualificationData } from './conversation-config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CallEvaluation {
  call_sid: string;
  campaign_type: CampaignType;
  overall_score: number;
  qualification_score: number;
  conversation_quality_score: number;
  qualification: QualificationData & {
    interest_signals: string[];
    objection_count: number;
    decision_maker_confirmed: boolean;
  };
  quality_metrics: {
    natural_flow: number;
    active_listening: number;
    rapport_building: number;
    objection_handling: number;
    call_control: number;
    deductions: string[];
  };
  outcome: {
    result: 'qualified' | 'not_interested' | 'callback' | 'voicemail' | 'no_answer';
    appointment_booked: boolean;
    follow_up_needed: boolean;
    next_action: string;
  };
  recommendations: string[];
  transcript: {
    turn_count: number;
    duration_seconds: number;
    user_turns: number;
    ai_turns: number;
    avg_user_length: number;
    avg_ai_length: number;
  };
  evaluated_at: Date;
}

interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Evaluate a completed call
 */
export async function evaluateCall(
  callSid: string,
  campaignType: CampaignType,
  messages: ConversationMessage[],
  durationSeconds: number
): Promise<CallEvaluation> {
  console.log(`[call-evaluator] Evaluating call ${callSid} (${campaignType} campaign)`);

  // Extract basic transcript data
  const userMessages = messages.filter(m => m.role === 'user');
  const aiMessages = messages.filter(m => m.role === 'assistant');
  
  const transcriptData = {
    turn_count: userMessages.length + aiMessages.length,
    duration_seconds: durationSeconds,
    user_turns: userMessages.length,
    ai_turns: aiMessages.length,
    avg_user_length: userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length || 0,
    avg_ai_length: aiMessages.reduce((sum, m) => sum + m.content.length, 0) / aiMessages.length || 0,
  };

  // Extract qualification data
  const qualificationData = extractQualificationData(messages);
  const qualificationScore = calculateQualificationScore(qualificationData);

  // Get GPT-4 analysis
  const analysis = await analyzeConversationQuality(messages, campaignType);

  // Calculate overall score (50% qualification, 50% quality)
  const overallScore = Math.round((qualificationScore + analysis.quality_score) / 2);

  // Determine outcome
  const outcome = determineOutcome(qualificationData, analysis, messages);

  // Generate recommendations
  const recommendations = generateRecommendations(
    qualificationScore,
    analysis,
    transcriptData,
    outcome
  );

  const evaluation: CallEvaluation = {
    call_sid: callSid,
    campaign_type: campaignType,
    overall_score: overallScore,
    qualification_score: qualificationScore,
    conversation_quality_score: analysis.quality_score,
    qualification: {
      ...qualificationData,
      interest_signals: analysis.interest_signals,
      objection_count: analysis.objection_count,
      decision_maker_confirmed: qualificationData.decision_maker,
    },
    quality_metrics: analysis.metrics,
    outcome,
    recommendations,
    transcript: transcriptData,
    evaluated_at: new Date(),
  };

  console.log(`[call-evaluator] Call ${callSid} scored ${overallScore}/100 (Q:${qualificationScore}, C:${analysis.quality_score})`);

  return evaluation;
}

/**
 * Analyze conversation quality with GPT-4
 */
async function analyzeConversationQuality(
  messages: ConversationMessage[],
  campaignType: CampaignType
): Promise<{
  quality_score: number;
  metrics: CallEvaluation['quality_metrics'];
  interest_signals: string[];
  objection_count: number;
}> {
  // Build conversation transcript for analysis
  const transcript = messages
    .filter(m => m.role !== 'system')
    .map(m => `${m.role === 'user' ? 'PROSPECT' : 'JAKE'}: ${m.content}`)
    .join('\n\n');

  const analysisPrompt = `You are an expert cold calling coach evaluating a ${campaignType} sales call. 

Analyze this conversation transcript and provide a detailed quality assessment:

${transcript}

Evaluate on these dimensions (score each 0-20):

1. NATURAL FLOW (20 points)
- Does the conversation feel natural and conversational?
- Are transitions smooth?
- Does it avoid sounding scripted?

2. ACTIVE LISTENING (20 points)
- Does Jake acknowledge what the prospect says?
- Does he pick up on cues and respond appropriately?
- Does he use active listening phrases like "I hear you", "That makes sense"?

3. RAPPORT BUILDING (20 points)
- Does Jake build trust and connection?
- Is the tone warm and professional?
- Does he mirror the prospect's energy?

4. OBJECTION HANDLING (20 points)
- How does Jake handle objections or concerns?
- Is he defensive or empathetic?
- Does he acknowledge and address concerns professionally?

5. CALL CONTROL (20 points)
- Does Jake maintain direction of the conversation?
- Does he ask effective questions?
- Does he avoid rambling or losing focus?

DEDUCTIONS (subtract points for):
- Talking too much (>3 sentences per response)
- Interrupting or not letting prospect finish
- Sounding robotic or scripted
- Being pushy or aggressive
- Poor objection handling (defensive, argumentative)

Also identify:
- INTEREST SIGNALS: Specific phrases showing interest
- OBJECTION COUNT: Number of times prospect raised objections

Respond in this exact JSON format:
{
  "natural_flow": 15,
  "active_listening": 18,
  "rapport_building": 16,
  "objection_handling": 14,
  "call_control": 17,
  "deductions": ["Talked too much in turn 3", "Missed cue in turn 5"],
  "interest_signals": ["sounds interesting", "tell me more"],
  "objection_count": 2,
  "reasoning": "Brief explanation of scores"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: analysisPrompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');

    // Calculate quality score
    const qualityScore = Math.min(
      analysis.natural_flow +
      analysis.active_listening +
      analysis.rapport_building +
      analysis.objection_handling +
      analysis.call_control,
      100
    );

    console.log(`[call-evaluator] GPT-4 analysis: ${qualityScore}/100 - ${analysis.reasoning}`);

    return {
      quality_score: qualityScore,
      metrics: {
        natural_flow: analysis.natural_flow,
        active_listening: analysis.active_listening,
        rapport_building: analysis.rapport_building,
        objection_handling: analysis.objection_handling,
        call_control: analysis.call_control,
        deductions: analysis.deductions || [],
      },
      interest_signals: analysis.interest_signals || [],
      objection_count: analysis.objection_count || 0,
    };
  } catch (error) {
    console.error('[call-evaluator] GPT-4 analysis failed:', error);
    
    // Fallback to basic scoring if GPT-4 fails
    return {
      quality_score: 50,
      metrics: {
        natural_flow: 10,
        active_listening: 10,
        rapport_building: 10,
        objection_handling: 10,
        call_control: 10,
        deductions: ['Analysis failed - using default scores'],
      },
      interest_signals: [],
      objection_count: 0,
    };
  }
}

/**
 * Determine call outcome
 */
function determineOutcome(
  qualification: QualificationData,
  analysis: any,
  messages: ConversationMessage[]
): CallEvaluation['outcome'] {
  const lastUserMessage = messages
    .filter(m => m.role === 'user')
    .pop()?.content.toLowerCase() || '';

  // Check for appointment booking
  const appointmentBooked = lastUserMessage.includes('yes') && 
    (lastUserMessage.includes('schedule') || 
     lastUserMessage.includes('appointment') || 
     lastUserMessage.includes('call back'));

  // Determine result
  let result: CallEvaluation['outcome']['result'];
  
  if (qualification.interest_level === 'high' || appointmentBooked) {
    result = 'qualified';
  } else if (qualification.interest_level === 'none' || lastUserMessage.includes('not interested')) {
    result = 'not_interested';
  } else if (lastUserMessage.includes('call back') || lastUserMessage.includes('follow up')) {
    result = 'callback';
  } else {
    result = 'callback'; // Default to callback for medium/low interest
  }

  // Determine follow-up needed
  const followUpNeeded = result !== 'not_interested' && !appointmentBooked;

  // Determine next action
  let nextAction: string;
  if (appointmentBooked) {
    nextAction = 'schedule_callback';
  } else if (result === 'qualified') {
    nextAction = 'send_info';
  } else if (result === 'callback') {
    nextAction = 'follow_up';
  } else {
    nextAction = 'no_action';
  }

  return {
    result,
    appointment_booked: appointmentBooked,
    follow_up_needed: followUpNeeded,
    next_action: nextAction,
  };
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(
  qualificationScore: number,
  analysis: any,
  transcript: CallEvaluation['transcript'],
  outcome: CallEvaluation['outcome']
): string[] {
  const recommendations: string[] = [];

  // Qualification recommendations
  if (qualificationScore < 40) {
    recommendations.push('❌ LOW QUALIFICATION: Focus on asking more discovery questions to uncover pain points and interest level');
  } else if (qualificationScore < 60) {
    recommendations.push('⚠️ MODERATE QUALIFICATION: Good start, but dig deeper on decision maker status and timeline');
  } else {
    recommendations.push('✅ STRONG QUALIFICATION: Excellent discovery and interest identification');
  }

  // Quality metric recommendations
  if (analysis.metrics.natural_flow < 15) {
    recommendations.push('🗣️ IMPROVE NATURAL FLOW: Use more conversational language and natural transitions like "So..." and "You know what..."');
  }

  if (analysis.metrics.active_listening < 15) {
    recommendations.push('👂 IMPROVE ACTIVE LISTENING: Use more acknowledgment phrases like "I hear you", "That makes sense", "I understand"');
  }

  if (analysis.metrics.rapport_building < 15) {
    recommendations.push('🤝 IMPROVE RAPPORT: Build more connection early in the call, mirror their energy, show empathy');
  }

  if (analysis.metrics.objection_handling < 15) {
    recommendations.push('🛡️ IMPROVE OBJECTION HANDLING: Never get defensive - acknowledge, empathize, then address');
  }

  if (analysis.metrics.call_control < 15) {
    recommendations.push('🎯 IMPROVE CALL CONTROL: Ask more directed questions and guide the conversation toward qualification');
  }

  // Transcript-based recommendations
  if (transcript.avg_ai_length > 200) {
    recommendations.push('📏 KEEP RESPONSES SHORTER: Aim for 1-2 sentences per response. You\'re talking too much.');
  }

  if (transcript.turn_count < 6) {
    recommendations.push('⏱️ CONVERSATION TOO SHORT: Try to engage for at least 6-8 exchanges to properly qualify');
  }

  if (transcript.turn_count > 15) {
    recommendations.push('⏱️ CONVERSATION TOO LONG: Be more direct and move toward close earlier');
  }

  // Outcome-based recommendations
  if (outcome.result === 'qualified' && !outcome.appointment_booked) {
    recommendations.push('📅 CLOSE HARDER: Interest was there, but no appointment booked. Ask for the meeting more directly.');
  }

  if (outcome.result === 'not_interested' && analysis.objection_count > 0) {
    recommendations.push('🛡️ REVIEW OBJECTION HANDLING: Multiple objections raised. Could they have been handled better?');
  }

  // Add specific deductions
  if (analysis.metrics.deductions && analysis.metrics.deductions.length > 0) {
    recommendations.push(`⚠️ SPECIFIC ISSUES: ${analysis.metrics.deductions.join('; ')}`);
  }

  // Always include one positive note if score is good
  if (qualificationScore >= 70 && analysis.quality_score >= 70) {
    recommendations.push('🌟 EXCELLENT WORK: This is a high-quality call that demonstrates best practices');
  }

  return recommendations;
}

/**
 * Get campaign insights from multiple evaluations
 */
export async function getCampaignInsights(
  evaluations: CallEvaluation[]
): Promise<{
  total_calls: number;
  avg_overall_score: number;
  avg_qualification_score: number;
  avg_quality_score: number;
  qualification_rate: number;
  appointment_rate: number;
  top_pain_points: string[];
  common_objections: number;
  best_performing_calls: string[];
  areas_for_improvement: string[];
}> {
  const total = evaluations.length;
  
  if (total === 0) {
    return {
      total_calls: 0,
      avg_overall_score: 0,
      avg_qualification_score: 0,
      avg_quality_score: 0,
      qualification_rate: 0,
      appointment_rate: 0,
      top_pain_points: [],
      common_objections: 0,
      best_performing_calls: [],
      areas_for_improvement: [],
    };
  }

  // Calculate averages
  const avgOverall = evaluations.reduce((sum, e) => sum + e.overall_score, 0) / total;
  const avgQual = evaluations.reduce((sum, e) => sum + e.qualification_score, 0) / total;
  const avgQuality = evaluations.reduce((sum, e) => sum + e.conversation_quality_score, 0) / total;

  // Calculate rates
  const qualified = evaluations.filter(e => e.outcome.result === 'qualified').length;
  const appointed = evaluations.filter(e => e.outcome.appointment_booked).length;

  // Aggregate pain points
  const painPointCounts: Record<string, number> = {};
  evaluations.forEach(e => {
    e.qualification.pain_points.forEach(pp => {
      painPointCounts[pp] = (painPointCounts[pp] || 0) + 1;
    });
  });
  const topPainPoints = Object.entries(painPointCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([pp]) => pp);

  // Average objections
  const avgObjections = evaluations.reduce((sum, e) => sum + e.qualification.objection_count, 0) / total;

  // Best performing calls (top 20%)
  const sortedByScore = [...evaluations].sort((a, b) => b.overall_score - a.overall_score);
  const topCalls = sortedByScore.slice(0, Math.ceil(total * 0.2)).map(e => e.call_sid);

  // Identify improvement areas
  const improvements: string[] = [];
  
  if (avgQual < 50) {
    improvements.push('Focus on better qualification - scores are low across board');
  }
  if (avgQuality < 60) {
    improvements.push('Improve conversation quality - work on natural flow and rapport');
  }
  if (qualified / total < 0.1) {
    improvements.push('Qualification rate under 10% - review targeting or scripts');
  }
  if (appointed / Math.max(qualified, 1) < 0.5) {
    improvements.push('Only 50% of qualified leads booking - strengthen close');
  }

  return {
    total_calls: total,
    avg_overall_score: Math.round(avgOverall),
    avg_qualification_score: Math.round(avgQual),
    avg_quality_score: Math.round(avgQuality),
    qualification_rate: qualified / total,
    appointment_rate: appointed / total,
    top_pain_points: topPainPoints,
    common_objections: Math.round(avgObjections),
    best_performing_calls: topCalls,
    areas_for_improvement: improvements,
  };
}
