// ACHIEVERY Reframe Engine
// Transforms ordinary activities into professional, business-oriented language

import OpenAI from 'openai'
import type { AchieveryActionCategory, AchieveryPhase } from '../types/platform'

export interface ReframeRequest {
  originalText: string
  category: AchieveryActionCategory
  phase: AchieveryPhase
  userDream?: string
}

export interface ReframeResult {
  reframedText: string
  significanceScore: number // 1-10 scale
  insights: string[]
  nextSteps: string[]
}

class ReframeEngine {
  private openai: OpenAI | null = null

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
      })
    }
  }

  async reframe(request: ReframeRequest): Promise<ReframeResult> {
    // If no OpenAI API key, return simple reframe
    if (!this.openai) {
      return this.fallbackReframe(request)
    }

    try {
      const prompt = this.buildPrompt(request)
      
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
        max_tokens: 400,
        temperature: 0.7,
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      return this.parseResponse(response, request)
    } catch (error) {
      console.error('OpenAI reframe error:', error)
      // Fallback to simple reframe if AI fails
      return this.fallbackReframe(request)
    }
  }

  private getSystemPrompt(): string {
    return `You are the ACHIEVERY Reframe Engine, designed to transform everyday activities into professional, business-oriented language that builds confidence and reveals hidden value.

Your role:
- Transform ordinary actions into professional accomplishments
- Highlight transferable skills and business value
- Maintain authenticity while elevating language
- Focus on growth, learning, and capability building
- Never be condescending or overly dramatic

Guidelines:
- Use professional, confident language
- Emphasize skills developed, value created, or relationships built
- Connect actions to broader business capabilities
- Acknowledge effort and initiative
- Suggest specific next steps for growth

Response format (JSON):
{
  "reframedText": "Professional reframe of the action",
  "significanceScore": 5,
  "insights": ["Key insight 1", "Key insight 2"],
  "nextSteps": ["Specific next step", "Another actionable step"]
}`
  }

  private buildPrompt(request: ReframeRequest): string {
    const { originalText, category, phase, userDream } = request

    let contextInfo = `
Category: ${category} (${this.getCategoryDescription(category)})
Current Phase: ${phase} (${this.getPhaseDescription(phase)})`

    if (userDream) {
      contextInfo += `
User's Dream: "${userDream}"`
    }

    return `Reframe this activity into professional language:

"${originalText}"

Context:${contextInfo}

Focus on the skills developed, value created, or progress made toward their goals. Be specific about what this action demonstrates about their capabilities.`
  }

  private getCategoryDescription(category: AchieveryActionCategory): string {
    switch (category) {
      case 'learning':
        return 'Acquiring new skills, knowledge, or insights'
      case 'building':
        return 'Creating, developing, or improving something'
      case 'connecting':
        return 'Building relationships, networking, or collaboration'
      default:
        return 'General activity'
    }
  }

  private getPhaseDescription(phase: AchieveryPhase): string {
    switch (phase) {
      case 'explore':
        return 'Foundation building and skill development'
      case 'build':
        return 'Active creation, testing, and iteration'
      case 'launch':
        return 'Going live, marketing, and scaling'
      default:
        return 'General phase'
    }
  }

  private parseResponse(response: string, request: ReframeRequest): ReframeResult {
    try {
      const parsed = JSON.parse(response)
      return {
        reframedText: parsed.reframedText || this.fallbackReframe(request).reframedText,
        significanceScore: Math.max(1, Math.min(10, parsed.significanceScore || 5)),
        insights: Array.isArray(parsed.insights) ? parsed.insights.slice(0, 3) : [],
        nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps.slice(0, 2) : [],
      }
    } catch {
      // If JSON parsing fails, extract text manually
      const reframedText = this.extractTextFromResponse(response)
      return {
        reframedText,
        significanceScore: 5,
        insights: [],
        nextSteps: [],
      }
    }
  }

  private extractTextFromResponse(response: string): string {
    // Try to extract reframed text from various formats
    const lines = response.split('\n')
    for (const line of lines) {
      if (line.includes('reframedText') && line.includes(':')) {
        const match = line.match(/"([^"]+)"/)
        if (match) return match[1]
      }
    }
    
    // If all else fails, return cleaned response
    return response.replace(/[{}",]/g, '').trim() || 'Professional development activity completed'
  }

  private fallbackReframe(request: ReframeRequest): ReframeResult {
    const { originalText, category, phase, userDream } = request

    let reframedText = ''
    let significanceScore = 3
    const insights = []
    const nextSteps = []

    // Enhanced rule-based reframing
    const lowerText = originalText.toLowerCase()
    
    switch (category) {
      case 'learning':
        if (lowerText.includes('tutorial') || lowerText.includes('course') || lowerText.includes('learn')) {
          reframedText = `Advanced technical knowledge through structured learning, focusing on ${this.extractSkillsFromText(originalText)}`
          significanceScore = 5
          insights.push('Demonstrates commitment to continuous professional development')
          nextSteps.push('Apply learned concepts in a practical project', 'Share knowledge with others to solidify understanding')
        } else if (lowerText.includes('read') || lowerText.includes('research')) {
          reframedText = `Conducted targeted research to deepen expertise in ${this.extractSkillsFromText(originalText)}`
          significanceScore = 4
          insights.push('Shows initiative in staying current with industry knowledge')
          nextSteps.push('Document key insights for future reference', 'Identify areas for deeper exploration')
        } else {
          reframedText = `Expanded professional knowledge base in ${this.extractSkillsFromText(originalText)}`
          significanceScore = 4
          insights.push('Consistent learning drives career advancement')
          nextSteps.push('Apply new knowledge to real projects', 'Teach concepts to reinforce learning')
        }
        break
        
      case 'building':
        if (lowerText.includes('built') || lowerText.includes('created') || lowerText.includes('made')) {
          reframedText = `Successfully delivered a functional solution for ${this.extractProjectFromText(originalText)}, demonstrating end-to-end project execution capabilities`
          significanceScore = 7
          insights.push('Practical application of technical skills creates tangible value')
          nextSteps.push('Document the project process and learnings', 'Seek feedback to identify improvement opportunities')
        } else if (lowerText.includes('fix') || lowerText.includes('debug') || lowerText.includes('solve')) {
          reframedText = `Applied analytical problem-solving skills to resolve technical challenges in ${this.extractProjectFromText(originalText)}`
          significanceScore = 6
          insights.push('Problem-solving abilities are highly valued in any business context')
          nextSteps.push('Create a troubleshooting methodology', 'Share problem-solving approach with team')
        } else {
          reframedText = `Contributed to project development through hands-on work on ${this.extractProjectFromText(originalText)}`
          significanceScore = 5
          insights.push('Building experience translates directly to business value creation')
          nextSteps.push('Expand project scope or complexity', 'Document technical decisions and outcomes')
        }
        break
        
      case 'connecting':
        if (lowerText.includes('help') || lowerText.includes('assist')) {
          reframedText = `Provided professional assistance and built rapport through technical support, strengthening relationships while demonstrating expertise`
          significanceScore = 6
          insights.push('Helping others establishes you as a trusted technical resource')
          nextSteps.push('Follow up to ensure ongoing satisfaction', 'Document common issues to create helpful resources')
        } else if (lowerText.includes('meet') || lowerText.includes('network') || lowerText.includes('talk')) {
          reframedText = `Expanded professional network through meaningful engagement in the ${this.extractDomainFromText(originalText)} community`
          significanceScore = 5
          insights.push('Building relationships is essential for business growth')
          nextSteps.push('Schedule follow-up conversations', 'Identify collaboration opportunities')
        } else {
          reframedText = `Strengthened professional relationships through collaborative engagement in ${this.extractDomainFromText(originalText)}`
          significanceScore = 5
          insights.push('Relationship building creates long-term business opportunities')
          nextSteps.push('Maintain regular contact with key connections', 'Look for ways to provide mutual value')
        }
        break
    }

    // Add dream-specific context if available
    if (userDream) {
      insights.push(`This experience contributes directly to your "${userDream}" goal`)
      nextSteps.push('Connect this activity to your broader business objectives')
    }

    return {
      reframedText,
      significanceScore,
      insights: insights.slice(0, 2),
      nextSteps: nextSteps.slice(0, 2),
    }
  }

  private extractSkillsFromText(text: string): string {
    const lowerText = text.toLowerCase()
    
    // Look for technology or skill keywords
    if (lowerText.includes('web design') || lowerText.includes('website')) return 'web design and development'
    if (lowerText.includes('computer') || lowerText.includes('tech')) return 'technology and systems'
    if (lowerText.includes('tutorial') || lowerText.includes('youtube')) return 'digital learning and skill development'
    if (lowerText.includes('programming') || lowerText.includes('coding')) return 'software development'
    if (lowerText.includes('design')) return 'design principles and user experience'
    if (lowerText.includes('business')) return 'business strategy and operations'
    if (lowerText.includes('market')) return 'market analysis and business development'
    
    // Extract meaningful nouns
    const words = text.toLowerCase().split(' ')
    const skillWords = words.filter(word => 
      word.length > 4 && 
      !['with', 'about', 'through', 'helping', 'worked', 'learned', 'watching', 'reading'].includes(word)
    )
    
    return skillWords.slice(0, 2).join(' and ') || 'relevant professional skills'
  }

  private extractProjectFromText(text: string): string {
    const lowerText = text.toLowerCase()
    
    // Look for project types
    if (lowerText.includes('website') || lowerText.includes('web')) return 'web development project'
    if (lowerText.includes('app') || lowerText.includes('application')) return 'application development'
    if (lowerText.includes('computer') || lowerText.includes('system')) return 'technical system enhancement'
    if (lowerText.includes('business') || lowerText.includes('company')) return 'business solution development'
    if (lowerText.includes('coffee shop') || lowerText.includes('local')) return 'local business digital solution'
    
    // Generic extraction
    const words = text.toLowerCase().split(' ')
    const projectWords = words.filter(word => 
      word.length > 4 && 
      !['built', 'created', 'made', 'fixed', 'helped', 'worked'].includes(word)
    )
    
    return projectWords.slice(0, 2).join(' ') || 'technical project'
  }

  private extractDomainFromText(text: string): string {
    const lowerText = text.toLowerCase()
    
    // Look for domain indicators
    if (lowerText.includes('tech') || lowerText.includes('computer')) return 'technology'
    if (lowerText.includes('business') || lowerText.includes('entrepreneur')) return 'business and entrepreneurship'
    if (lowerText.includes('design') || lowerText.includes('creative')) return 'design and creative'
    if (lowerText.includes('market') || lowerText.includes('sales')) return 'marketing and sales'
    if (lowerText.includes('web') || lowerText.includes('digital')) return 'digital and web development'
    
    return 'professional development'
  }

  private extractTopic(text: string): string {
    // Fallback method - kept for compatibility
    return this.extractSkillsFromText(text)
  }

  isAvailable(): boolean {
    return this.openai !== null
  }
}

// Singleton instance
export const reframeEngine = new ReframeEngine()

// Utility function for easy use in API routes
export async function reframeAction(request: ReframeRequest): Promise<ReframeResult> {
  return reframeEngine.reframe(request)
}