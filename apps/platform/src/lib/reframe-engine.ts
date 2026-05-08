import OpenAI from 'openai'

type ExecutionStage = 'diagnose' | 'build' | 'launch' | 'optimize'
type ActionCategory = 'learning' | 'building' | 'connecting'

export interface ReframeRequest {
  originalText: string
  category: ActionCategory
  executionStage: ExecutionStage
  engagementContext?: string
}

export interface ReframeResult {
  operationalInsight: string
  impactRating: number // 1-10
  insights: string[]
  nextSteps: string[]
}

class ReframeEngine {
  private openai: OpenAI | null = null

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (apiKey) {
      this.openai = new OpenAI({ apiKey })
    }
  }

  async reframe(request: ReframeRequest): Promise<ReframeResult> {
    if (!this.openai) {
      return this.fallbackReframe(request)
    }
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: this.buildPrompt(request) },
        ],
        max_tokens: 400,
        temperature: 0.7,
      })
      const response = completion.choices[0]?.message?.content
      if (!response) throw new Error('No response from OpenAI')
      return this.parseResponse(response, request)
    } catch (error) {
      console.error('OpenAI reframe error:', error)
      return this.fallbackReframe(request)
    }
  }

  private getSystemPrompt(): string {
    return `You are the Achievery operational insight engine. Transform logged actions into clear, professional operational language that surfaces business value.

Guidelines:
- Use professional, operator-grade language
- Emphasize execution, delivery, and measurable progress
- Connect actions to engagement objectives
- Suggest concrete next steps

Response format (JSON):
{
  "operationalInsight": "Professional reframe of the action",
  "impactRating": 5,
  "insights": ["Insight 1", "Insight 2"],
  "nextSteps": ["Next step 1", "Next step 2"]
}`
  }

  private buildPrompt(request: ReframeRequest): string {
    const { originalText, category, executionStage, engagementContext } = request
    let ctx = `Category: ${category}\nExecution stage: ${executionStage} (${this.getStageDescription(executionStage)})`
    if (engagementContext) ctx += `\nEngagement context: "${engagementContext}"`
    return `Reframe this action into operational language:\n\n"${originalText}"\n\nContext:\n${ctx}`
  }

  private getStageDescription(stage: ExecutionStage): string {
    switch (stage) {
      case 'diagnose': return 'Assessment, audit, and gap identification'
      case 'build': return 'Active creation, development, and iteration'
      case 'launch': return 'Deployment, go-live, and execution'
      case 'optimize': return 'Measurement, refinement, and scaling'
    }
  }

  private parseResponse(response: string, request: ReframeRequest): ReframeResult {
    try {
      const parsed = JSON.parse(response)
      return {
        operationalInsight: parsed.operationalInsight || this.fallbackReframe(request).operationalInsight,
        impactRating: Math.max(1, Math.min(10, parsed.impactRating || 5)),
        insights: Array.isArray(parsed.insights) ? parsed.insights.slice(0, 3) : [],
        nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps.slice(0, 2) : [],
      }
    } catch {
      return {
        operationalInsight: this.extractTextFromResponse(response),
        impactRating: 5,
        insights: [],
        nextSteps: [],
      }
    }
  }

  private extractTextFromResponse(response: string): string {
    const lines = response.split('\n')
    for (const line of lines) {
      if (line.includes('operationalInsight') && line.includes(':')) {
        const match = line.match(/"([^"]+)"/)
        if (match) return match[1]
      }
    }
    return response.replace(/[{}",]/g, '').trim() || 'Operational activity completed'
  }

  private fallbackReframe(request: ReframeRequest): ReframeResult {
    const { originalText, category } = request
    let operationalInsight = ''
    let impactRating = 4
    const insights: string[] = []
    const nextSteps: string[] = []

    switch (category) {
      case 'learning':
        operationalInsight = `Advanced operational knowledge through targeted learning: ${this.extractKeyTerms(originalText)}`
        impactRating = 5
        insights.push('Continuous learning directly improves execution quality')
        nextSteps.push('Apply learned concepts in the current engagement', 'Document key takeaways')
        break
      case 'building':
        operationalInsight = `Delivered tangible output: ${this.extractKeyTerms(originalText)}`
        impactRating = 7
        insights.push('Execution-phase output creates measurable engagement value')
        nextSteps.push('Document the outcome and share with engagement log', 'Identify next build iteration')
        break
      case 'connecting':
        operationalInsight = `Built operational relationship through: ${this.extractKeyTerms(originalText)}`
        impactRating = 5
        insights.push('Stakeholder alignment accelerates engagement progress')
        nextSteps.push('Follow up to maintain momentum', 'Identify collaboration opportunities')
        break
      default:
        operationalInsight = `Completed operational activity: ${originalText.substring(0, 80)}`
    }

    return { operationalInsight, impactRating, insights, nextSteps }
  }

  private extractKeyTerms(text: string): string {
    const stopWords = new Set(['with', 'about', 'through', 'that', 'this', 'from', 'into', 'they', 'their', 'were', 'have', 'been'])
    const filtered = text.toLowerCase().split(' ').filter(w => w.length > 4 && !stopWords.has(w))
    return filtered.slice(0, 3).join(', ') || 'operational activities'
  }

  isAvailable(): boolean {
    return this.openai !== null
  }
}

export const reframeEngine = new ReframeEngine()

export async function reframeAction(request: ReframeRequest): Promise<ReframeResult> {
  return reframeEngine.reframe(request)
}
