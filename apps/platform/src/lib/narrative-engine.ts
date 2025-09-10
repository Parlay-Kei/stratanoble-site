// ACHIEVERY Weekly Narrative Engine
// Generates meaningful progress summaries from user actions

import OpenAI from 'openai'
import type { UserAction, WeeklyNarrative, AchieveryActionCategory, AchieveryPhase } from '../types/platform'

export interface NarrativeRequest {
  userId: string
  weekStart: Date
  actions: UserAction[]
  userDream?: string
  previousNarratives?: WeeklyNarrative[]
}

export interface NarrativeResult {
  narrativeText: string
  keyInsights: string[]
  nextSuggestions: string[]
  phaseProgression: string
  significantActions: UserAction[]
}

export interface WeeklyProgress {
  totalActions: number
  categoryCounts: Record<AchieveryActionCategory, number>
  phaseCounts: Record<AchieveryPhase, number>
  significantActionsCount: number
  streakDays: number
  learningFocus: string[]
  buildingMilestones: string[]
  connectionsMade: string[]
}

class NarrativeEngine {
  private openai: OpenAI | null = null

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
      })
    }
  }

  async generateNarrative(request: NarrativeRequest): Promise<NarrativeResult> {
    const progress = this.analyzeWeeklyProgress(request.actions)

    // If no OpenAI API key, return rule-based narrative
    if (!this.openai || request.actions.length === 0) {
      return this.fallbackNarrative(request, progress)
    }

    try {
      const prompt = this.buildPrompt(request, progress)
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Cost-effective while maintaining quality
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 600,
        temperature: 0.7,
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      return this.parseResponse(response, request, progress)
    } catch (error) {
      console.error('OpenAI narrative error:', error)
      // Fallback to rule-based narrative if AI fails
      return this.fallbackNarrative(request, progress)
    }
  }

  private getSystemPrompt(): string {
    return `You are the ACHIEVERY Weekly Narrative Engine, designed to create meaningful, personalized progress summaries that help users see how their daily actions are building toward their goals.

Your role:
- Analyze weekly action patterns and create encouraging narratives
- Connect daily activities to bigger picture progress
- Provide actionable insights and next steps
- Use professional, motivational language that builds confidence
- Focus on growth trajectory, not just completion

Guidelines:
- Write in second person ("You accomplished...")
- Highlight patterns, trends, and momentum
- Connect actions to skill building and business development
- Acknowledge effort while pointing toward growth opportunities
- Keep tone professional but warm and encouraging
- Be specific about what progress means for their future

Response format (JSON):
{
  "narrativeText": "2-3 paragraph narrative summarizing the week's progress",
  "keyInsights": ["Insight about patterns", "Insight about growth", "Insight about direction"],
  "nextSuggestions": ["Specific actionable next step", "Another concrete suggestion"],
  "phaseProgression": "Brief assessment of phase progression or readiness",
  "significantActions": ["action_id_1", "action_id_2"]
}`
  }

  private buildPrompt(request: NarrativeRequest, progress: WeeklyProgress): string {
    const { actions, userDream, previousNarratives } = request
    
    let contextInfo = `Week Summary:
- Total Actions: ${progress.totalActions}
- Learning: ${progress.categoryCounts.learning} actions (${progress.learningFocus.join(', ')})
- Building: ${progress.categoryCounts.building} actions (${progress.buildingMilestones.join(', ')})
- Connecting: ${progress.categoryCounts.connecting} actions (${progress.connectionsMade.join(', ')})
- Active Days: ${progress.streakDays}

Phase Distribution:
- Explore: ${progress.phaseCounts.explore} actions
- Build: ${progress.phaseCounts.build} actions  
- Launch: ${progress.phaseCounts.launch} actions`

    if (userDream) {
      contextInfo += `\n\nUser's Dream: "${userDream}"`
    }

    if (previousNarratives && previousNarratives.length > 0) {
      const lastNarrative = previousNarratives[0]
      contextInfo += `\n\nPrevious Week Context: "${lastNarrative.narrative_text.substring(0, 200)}..."`
    }

    let actionDetails = '\n\nActions Taken This Week:'
    actions.forEach((action, index) => {
      actionDetails += `\n${index + 1}. [${action.category}/${action.phase}] ${action.original_text}`
      if (action.reframed_text) {
        actionDetails += `\n   → ${action.reframed_text}`
      }
    })

    return `Generate a weekly narrative for this user's progress:

${contextInfo}${actionDetails}

Create an encouraging narrative that shows how these actions are building toward their goals. Focus on patterns, skill development, and momentum. Identify the most significant actions that represent real progress.`
  }

  private parseResponse(response: string, request: NarrativeRequest, progress: WeeklyProgress): NarrativeResult {
    try {
      const parsed = JSON.parse(response)
      
      // Find significant actions by ID or fallback to progress analysis
      let significantActions: UserAction[] = []
      if (Array.isArray(parsed.significantActions) && parsed.significantActions.length > 0) {
        significantActions = request.actions.filter(action => 
          parsed.significantActions.includes(action.id)
        )
      }
      
      if (significantActions.length === 0) {
        significantActions = this.identifySignificantActions(request.actions, progress)
      }

      return {
        narrativeText: parsed.narrativeText || this.fallbackNarrative(request, progress).narrativeText,
        keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights.slice(0, 3) : [],
        nextSuggestions: Array.isArray(parsed.nextSuggestions) ? parsed.nextSuggestions.slice(0, 3) : [],
        phaseProgression: parsed.phaseProgression || this.assessPhaseProgression(progress),
        significantActions,
      }
    } catch {
      // If JSON parsing fails, extract text manually and use fallback
      const narrativeText = this.extractNarrativeFromResponse(response)
      const fallback = this.fallbackNarrative(request, progress)
      
      return {
        narrativeText: narrativeText || fallback.narrativeText,
        keyInsights: fallback.keyInsights,
        nextSuggestions: fallback.nextSuggestions,
        phaseProgression: fallback.phaseProgression,
        significantActions: fallback.significantActions,
      }
    }
  }

  private extractNarrativeFromResponse(response: string): string {
    // Try to extract narrative text from various formats
    const lines = response.split('\n')
    for (const line of lines) {
      if (line.includes('narrativeText') && line.includes(':')) {
        const match = line.match(/"([^"]+)"/)
        if (match) return match[1]
      }
    }
    
    // Return cleaned response if structured extraction fails
    return response.replace(/[{}",]/g, '').trim() || ''
  }

  private fallbackNarrative(request: NarrativeRequest, progress: WeeklyProgress): NarrativeResult {
    const { actions, userDream } = request
    
    if (actions.length === 0) {
      return {
        narrativeText: "This week was quiet - no actions were logged. Sometimes rest is necessary for reflection and planning. Consider starting small tomorrow with one meaningful action toward your goals.",
        keyInsights: [
          "Consistency is more important than intensity",
          "Small daily actions compound into significant progress",
        ],
        nextSuggestions: [
          "Log one small learning action tomorrow",
          "Set a simple daily reminder to track progress",
        ],
        phaseProgression: "Ready to begin or restart your journey with small, consistent steps",
        significantActions: [],
      }
    }

    // Generate narrative based on progress patterns
    let narrativeText = this.generateProgressNarrative(actions, progress, userDream)
    const keyInsights = this.generateInsights(progress)
    const nextSuggestions = this.generateSuggestions(progress, actions)
    const phaseProgression = this.assessPhaseProgression(progress)
    const significantActions = this.identifySignificantActions(actions, progress)

    return {
      narrativeText,
      keyInsights,
      nextSuggestions,
      phaseProgression,
      significantActions,
    }
  }

  private generateProgressNarrative(actions: UserAction[], progress: WeeklyProgress, userDream?: string): string {
    const { totalActions, categoryCounts, streakDays } = progress
    
    let narrative = `This week you logged ${totalActions} action${totalActions === 1 ? '' : 's'} across ${streakDays} day${streakDays === 1 ? '' : 's'}`
    
    // Add momentum assessment
    if (totalActions >= 5) {
      narrative += ", showing strong momentum in your development journey."
    } else if (totalActions >= 3) {
      narrative += ", building steady progress toward your goals."
    } else {
      narrative += ", taking meaningful steps forward."
    }

    // Add category-specific insights
    const categoryInsights = []
    if (categoryCounts.learning > 0) {
      categoryInsights.push(`You invested in learning with ${categoryCounts.learning} knowledge-building activities`)
    }
    if (categoryCounts.building > 0) {
      categoryInsights.push(`You created tangible value through ${categoryCounts.building} building actions`)
    }
    if (categoryCounts.connecting > 0) {
      categoryInsights.push(`You strengthened your network with ${categoryCounts.connecting} connecting activities`)
    }

    if (categoryInsights.length > 0) {
      narrative += ` ${categoryInsights.join(', ')}.`
    }

    // Connect to user dream if available
    if (userDream) {
      narrative += ` Each action moves you closer to "${userDream}" by building the skills and connections necessary for success.`
    }

    // Add encouragement based on patterns
    if (progress.learningFocus.length > 1) {
      narrative += " Your diverse learning approach is building a strong foundation for future opportunities."
    } else if (progress.buildingMilestones.length > 0) {
      narrative += " Your focus on creating and building demonstrates initiative that employers and clients value."
    } else if (progress.connectionsMade.length > 0) {
      narrative += " Your relationship-building efforts are creating the network necessary for long-term success."
    }

    return narrative
  }

  private generateInsights(progress: WeeklyProgress): string[] {
    const insights = []
    
    // Pattern insights
    if (progress.totalActions > 0) {
      const dominantCategory = Object.entries(progress.categoryCounts)
        .reduce((a, b) => progress.categoryCounts[a[0] as AchieveryActionCategory] > progress.categoryCounts[b[0] as AchieveryActionCategory] ? a : b)[0]
      
      switch (dominantCategory as AchieveryActionCategory) {
        case 'learning':
          insights.push('Your focus on learning is building a strong knowledge foundation for future opportunities')
          break
        case 'building':
          insights.push('Your emphasis on building and creating demonstrates initiative that translates to real business value')
          break
        case 'connecting':
          insights.push('Your investment in relationships is creating the network necessary for long-term success')
          break
      }
    }

    // Phase distribution insight
    const totalPhaseActions = Object.values(progress.phaseCounts).reduce((sum, count) => sum + count, 0)
    if (totalPhaseActions > 0) {
      if (progress.phaseCounts.build > progress.phaseCounts.explore) {
        insights.push('You\'re transitioning from exploration to active building - a sign of growing confidence')
      } else if (progress.phaseCounts.launch > 0) {
        insights.push('You\'re taking launch-oriented actions, showing readiness to share your work with the world')
      } else if (progress.phaseCounts.explore > 0) {
        insights.push('Your exploration activities are building the knowledge base needed for successful execution')
      }
    }

    // Consistency insight
    if (progress.streakDays >= 5) {
      insights.push('Your consistent daily action habit is the foundation of all successful entrepreneurs')
    } else if (progress.streakDays >= 3) {
      insights.push('You\'re building momentum - consistency at this level drives significant progress')
    }

    return insights.slice(0, 3)
  }

  private generateSuggestions(progress: WeeklyProgress, actions: UserAction[]): string[] {
    const suggestions = []
    
    // Category balance suggestions
    if (progress.categoryCounts.learning > progress.categoryCounts.building + progress.categoryCounts.connecting) {
      suggestions.push('Consider balancing learning with practical application - try building something small with your new knowledge')
    } else if (progress.categoryCounts.building > 0 && progress.categoryCounts.connecting === 0) {
      suggestions.push('Share your building progress with others to get feedback and build your network')
    } else if (progress.categoryCounts.connecting > 0 && progress.categoryCounts.building === 0) {
      suggestions.push('Turn your networking conversations into collaborative building opportunities')
    }

    // Phase progression suggestions
    const exploreRatio = progress.phaseCounts.explore / Math.max(progress.totalActions, 1)
    if (exploreRatio > 0.7) {
      suggestions.push('You\'re ready to start building - choose one skill area and create something small')
    } else if (progress.phaseCounts.build > 0 && progress.phaseCounts.launch === 0) {
      suggestions.push('Consider sharing your building progress publicly to get feedback and visibility')
    }

    // Intensity suggestions
    if (progress.totalActions < 3) {
      suggestions.push('Try to log at least one action per day to build momentum')
    } else if (progress.totalActions > 10) {
      suggestions.push('Focus on quality over quantity - choose your most impactful actions')
    }

    // Default suggestions if none generated
    if (suggestions.length === 0) {
      suggestions.push('Continue building on this week\'s momentum with consistent daily actions')
      suggestions.push('Look for opportunities to connect your recent activities to larger projects')
    }

    return suggestions.slice(0, 3)
  }

  private assessPhaseProgression(progress: WeeklyProgress): string {
    const totalActions = progress.totalActions
    
    if (totalActions === 0) {
      return 'Ready to begin your exploration phase with consistent action logging'
    }
    
    const exploreRatio = progress.phaseCounts.explore / totalActions
    const buildRatio = progress.phaseCounts.build / totalActions
    const launchRatio = progress.phaseCounts.launch / totalActions
    
    if (launchRatio > 0.3) {
      return 'Actively in Launch phase - taking your work public and building business momentum'
    } else if (buildRatio > 0.4) {
      return 'Progressing through Build phase - creating tangible value and developing projects'
    } else if (buildRatio > 0.2) {
      return 'Transitioning from Explore to Build - ready to start creating with your knowledge'
    } else {
      return 'Solidifying foundation in Explore phase - building knowledge and skills for future creation'
    }
  }

  private identifySignificantActions(actions: UserAction[], progress: WeeklyProgress): UserAction[] {
    // Identify actions that represent significant progress
    const significant = actions.filter(action => {
      // Actions in build or launch phases are generally more significant
      if (action.phase === 'build' || action.phase === 'launch') {
        return true
      }
      
      // Actions with reframed text showing high value
      if (action.reframed_text && action.reframed_text.length > action.original_text.length * 1.5) {
        return true
      }
      
      // First action of each category
      const isFirst = actions.findIndex(a => a.category === action.category) === actions.findIndex(a => a.id === action.id)
      if (isFirst && progress.categoryCounts[action.category] > 0) {
        return true
      }
      
      return false
    })
    
    // Return up to 3 most significant actions
    return significant.slice(0, 3)
  }

  private analyzeWeeklyProgress(actions: UserAction[]): WeeklyProgress {
    const categoryCounts: Record<AchieveryActionCategory, number> = {
      learning: 0,
      building: 0,
      connecting: 0,
    }
    
    const phaseCounts: Record<AchieveryPhase, number> = {
      explore: 0,
      build: 0,
      launch: 0,
    }
    
    const learningFocus: string[] = []
    const buildingMilestones: string[] = []
    const connectionsMade: string[] = []
    const actionDates = new Set<string>()
    
    actions.forEach(action => {
      categoryCounts[action.category]++
      phaseCounts[action.phase]++
      
      if (action.logged_date) {
        actionDates.add(action.logged_date)
      }
      
      // Extract focus areas
      const text = action.original_text.toLowerCase()
      switch (action.category) {
        case 'learning':
          if (text.includes('web') || text.includes('website')) learningFocus.push('web development')
          else if (text.includes('design')) learningFocus.push('design')
          else if (text.includes('business')) learningFocus.push('business')
          else if (text.includes('tech')) learningFocus.push('technology')
          else learningFocus.push('professional skills')
          break
        case 'building':
          if (text.includes('website') || text.includes('app')) buildingMilestones.push('digital product')
          else if (text.includes('business')) buildingMilestones.push('business development')
          else buildingMilestones.push('creative project')
          break
        case 'connecting':
          if (text.includes('help')) connectionsMade.push('technical assistance')
          else if (text.includes('network') || text.includes('meet')) connectionsMade.push('networking')
          else connectionsMade.push('relationship building')
          break
      }
    })
    
    return {
      totalActions: actions.length,
      categoryCounts,
      phaseCounts,
      significantActionsCount: actions.filter(a => a.phase === 'build' || a.phase === 'launch').length,
      streakDays: actionDates.size,
      learningFocus: [...new Set(learningFocus)].slice(0, 3),
      buildingMilestones: [...new Set(buildingMilestones)].slice(0, 3),
      connectionsMade: [...new Set(connectionsMade)].slice(0, 3),
    }
  }

  isAvailable(): boolean {
    return this.openai !== null
  }
}

// Singleton instance
export const narrativeEngine = new NarrativeEngine()

// Utility function for easy use in API routes
export async function generateWeeklyNarrative(request: NarrativeRequest): Promise<NarrativeResult> {
  return narrativeEngine.generateNarrative(request)
}