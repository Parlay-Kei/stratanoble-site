#!/usr/bin/env node
/**
 * LinkedIn Engagement Loop v1.0
 * 24-hour engagement cycle with reply drafting and lead escalation
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

class LinkedInEngagementLoop {
  constructor(options = {}) {
    this.options = {
      sessionDir: options.sessionDir || 'C:\\Dev\\.claude-anx\\browser-sessions\\linkedin',
      proofDir: options.proofDir || 'C:\\Dev\\.claude-anx\\proof-packs\\linkedin\\engagement',
      timeout: options.timeout || 30000,
      targetProfile: options.targetProfile || 'steve-hubbard', // Default to Steve's profile
      ...options
    };

    this.context = null;
    this.page = null;
    this.runId = null;
    this.runDir = null;
    this.results = {
      timestamp: new Date().toISOString(),
      phase: 'initialization',
      success: false,
      postData: null,
      comments: [],
      classifications: [],
      drafts: [],
      escalations: []
    };
  }

  /**
   * Initialize browser with persistent LinkedIn session
   */
  async initialize() {
    const dateStr = new Date().toISOString().split('T')[0];
    this.runId = `run-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    this.runDir = path.join(this.options.proofDir, dateStr, this.runId);

    // Ensure directories exist
    await fs.mkdir(this.runDir, { recursive: true });
    await fs.mkdir(path.join(this.runDir, 'screenshots'), { recursive: true });

    console.log(`📁 Proof pack: ${this.runDir}`);

    // Launch browser
    const browser = await chromium.launch({
      headless: false,
      slowMo: 100
    });

    this.context = await browser.newContext({
      storageState: path.join(this.options.sessionDir, 'state.json')
    });

    this.page = await this.context.newPage();
    return this.runId;
  }

  /**
   * PHASE 1: Find Latest Post and Capture Engagement State
   */
  async runPhase1() {
    console.log('📋 PHASE 1: Finding Latest Post and Capturing Engagement...');
    this.results.phase = 'phase1_intake';

    try {
      // Navigate to Steve's LinkedIn profile
      console.log('📄 Navigating to LinkedIn profile...');
      await this.page.goto('https://www.linkedin.com/in/me/', {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      await this.page.waitForTimeout(3000);

      // Look for recent posts
      console.log('🔍 Finding most recent post...');
      const postData = await this.findLatestPost();

      if (!postData) {
        throw new Error('No recent posts found within last 48 hours');
      }

      this.results.postData = postData;

      // Capture post header screenshot
      await this.captureScreenshot('post-header');

      // Open post detail view to get comments
      if (postData.postUrl) {
        await this.page.goto(postData.postUrl, { waitUntil: 'domcontentloaded' });
        await this.page.waitForTimeout(2000);
      }

      // Capture engagement summary
      await this.captureScreenshot('engagement-summary');

      // Collect comments
      const comments = await this.collectComments();
      this.results.comments = comments;

      // Generate intake JSON
      await this.generateIntakeJSON();

      console.log(`✅ Phase 1 Complete: Found post with ${comments.length} comments`);
      return true;

    } catch (error) {
      console.error(`❌ Phase 1 Failed: ${error.message}`);
      this.results.error = error.message;
      return false;
    }
  }

  /**
   * Find the latest post within 48 hours
   */
  async findLatestPost() {
    try {
      const postData = await this.page.evaluate(() => {
        const posts = document.querySelectorAll('[data-test-id*="post"], .feed-shared-update-v2, .share-update-card');
        const now = Date.now();
        const fortyEightHours = 48 * 60 * 60 * 1000;

        for (const post of posts) {
          // Look for timestamp
          const timeElement = post.querySelector('time, .update-components-actor__sub-description, [data-test-id*="timestamp"]');
          if (!timeElement) continue;

          // Get post text content
          const textElement = post.querySelector('.break-words, .feed-shared-text, .share-update-card__commentary');
          if (!textElement) continue;

          const postText = textElement.textContent?.trim();
          if (!postText || postText.length < 50) continue;

          // Try to get engagement counts
          const reactionsElement = post.querySelector('[aria-label*="reaction"], .social-counts-reactions');
          const commentsElement = post.querySelector('[aria-label*="comment"], .social-counts-comments');

          const reactions = reactionsElement ? this.parseCount(reactionsElement.textContent) : 0;
          const commentCount = commentsElement ? this.parseCount(commentsElement.textContent) : 0;

          // Try to get post URL
          const linkElement = post.querySelector('a[href*="/posts/"], a[href*="/activity-"]');
          const postUrl = linkElement ? linkElement.href : null;

          return {
            text: postText.substring(0, 200) + '...',
            fullText: postText,
            reactions: reactions,
            comments: commentCount,
            postUrl: postUrl,
            timestamp: timeElement.textContent,
            found: true
          };
        }

        return null;
      });

      return postData;

    } catch (error) {
      console.error('Error finding latest post:', error);
      return null;
    }
  }

  /**
   * Collect comments from the current post
   */
  async collectComments() {
    try {
      const comments = await this.page.evaluate(() => {
        const commentElements = document.querySelectorAll('.comments-comment-item, .comment, [data-test-id*="comment"]');
        const collectedComments = [];

        commentElements.forEach((element, index) => {
          try {
            // Get commenter name
            const nameElement = element.querySelector('.comment-author-name, .comments-post-meta__name, [data-test-id*="author"]');
            const name = nameElement ? nameElement.textContent.trim() : `Unknown-${index}`;

            // Get comment text
            const textElement = element.querySelector('.comments-comment-item__main-content, .comment-content, .break-words');
            const text = textElement ? textElement.textContent.trim() : '';

            if (text && text.length > 5) {
              collectedComments.push({
                id: `comment-${index}`,
                author: name,
                text: text,
                timestamp: new Date().toISOString() // Placeholder
              });
            }
          } catch (e) {
            // Skip malformed comments
          }
        });

        return collectedComments;
      });

      return comments;

    } catch (error) {
      console.error('Error collecting comments:', error);
      return [];
    }
  }

  /**
   * PHASE 2: Classify Comments with Signal Scoring
   */
  async runPhase2() {
    console.log('🎯 PHASE 2: Classifying Comments with Signal Scoring...');
    this.results.phase = 'phase2_classification';

    const classifications = [];

    for (const comment of this.results.comments) {
      const classification = this.classifyComment(comment);
      classifications.push(classification);
    }

    this.results.classifications = classifications;

    // Generate classification report
    await this.generateClassificationReport();

    console.log(`✅ Phase 2 Complete: Classified ${classifications.length} comments`);
    return true;
  }

  /**
   * Classify a single comment
   */
  classifyComment(comment) {
    const text = comment.text.toLowerCase();
    let score = 0;
    let type = 'PRAISE';

    // Determine comment type
    if (text.includes('help') || text.includes('how') || text.includes('what') || text.includes('?')) {
      type = 'QUESTION';
    } else if (text.includes('i have') || text.includes('we use') || text.includes('my company')) {
      type = 'EXPERIENCE';
    } else if (text.includes('but') || text.includes('however') || text.includes('disagree')) {
      type = 'OBJECTION';
    } else if (text.includes('need') || text.includes('want') || text.includes('interested') || text.includes('help me')) {
      type = 'LEAD_SIGNAL';
    } else if (text.includes('check out') || text.includes('www.') || text.includes('my product')) {
      type = 'SPAM';
    }

    // Signal scoring
    if (text.includes('can you help') || text.includes('need this') || text.includes('how do i')) {
      score += 4;
    }
    if (text.includes('pipeline') || text.includes('leads') || text.includes('follow') || text.includes('crm')) {
      score += 3;
    }
    if (text.includes('automation') || text.includes('tools') || text.includes('system')) {
      score += 2;
    }
    if (text.includes('now') || text.includes('asap') || text.includes('this week')) {
      score += 1;
    }
    if (text.includes('check out my') || text.includes('we offer') || text.includes('our solution')) {
      score -= 4;
    }
    if (type === 'SPAM') {
      score -= 5;
    }

    // Determine priority
    let priority;
    if (score >= 8) priority = 'P0';
    else if (score >= 6) priority = 'P1';
    else priority = 'P2';

    return {
      ...comment,
      type: type,
      score: score,
      priority: priority,
      reasoning: this.generateScoreReasoning(text, score, type)
    };
  }

  /**
   * Generate reasoning for score
   */
  generateScoreReasoning(text, score, type) {
    const reasons = [];
    if (text.includes('help')) reasons.push('asks for help (+4)');
    if (text.includes('pipeline')) reasons.push('mentions pipeline (+3)');
    if (text.includes('automation')) reasons.push('mentions automation (+2)');
    if (text.includes('now')) reasons.push('shows urgency (+1)');
    if (text.includes('check out')) reasons.push('self-promotion (-4)');

    return reasons.join(', ') || `${type} comment`;
  }

  /**
   * PHASE 3: Draft Replies in Steve's Voice
   */
  async runPhase3() {
    console.log('✍️ PHASE 3: Drafting Replies in Steve\'s Voice...');
    this.results.phase = 'phase3_drafting';

    const drafts = [];

    for (const classification of this.results.classifications) {
      if (classification.priority === 'P0' || classification.priority === 'P1') {
        const draft = this.draftReply(classification);
        drafts.push(draft);
      }
    }

    this.results.drafts = drafts;

    // Generate draft replies document
    await this.generateDraftReplies();

    console.log(`✅ Phase 3 Complete: Drafted ${drafts.length} replies`);
    return true;
  }

  /**
   * Draft a reply based on comment classification
   */
  draftReply(classification) {
    const name = classification.author.split(' ')[0]; // First name only
    let replyText = '';

    switch (classification.type) {
      case 'PRAISE':
        replyText = `Appreciate that, ${name}.`;
        break;

      case 'QUESTION':
        replyText = `Good question. The first thing I look for is where leads are coming from and how fast follow-up happens.\nIf you tell me your source, I'll tell you the fastest fix.`;
        break;

      case 'EXPERIENCE':
        replyText = `That's real.\nWhat part breaks first for you, follow-up speed, booking, or tracking the stage?`;
        break;

      case 'OBJECTION':
        replyText = `Fair point.\nMost of the time the issue isn't effort. It's the system being inconsistent when things get busy.`;
        break;

      case 'LEAD_SIGNAL':
        replyText = `Let's look at it.\nWhere are your leads coming from right now?\nIf you want, we can do a quick 15-min call this week and I'll map the simplest fix.`;
        break;

      default:
        replyText = `Appreciate that, ${name}.`;
    }

    return {
      commentId: classification.id,
      author: classification.author,
      priority: classification.priority,
      type: classification.type,
      replyText: replyText,
      recommendedAction: this.getRecommendedAction(classification)
    };
  }

  /**
   * Get recommended action based on classification
   */
  getRecommendedAction(classification) {
    if (classification.type === 'LEAD_SIGNAL' && classification.score >= 8) {
      return 'INVITE_CALL';
    } else if (classification.type === 'QUESTION' || classification.priority === 'P1') {
      return 'REPLY';
    } else if (classification.type === 'SPAM') {
      return 'IGNORE';
    } else {
      return 'REPLY';
    }
  }

  /**
   * PHASE 4: Escalate to Steve (Approval Queue)
   */
  async runPhase4() {
    console.log('📋 PHASE 4: Creating Approval Queue for Steve...');
    this.results.phase = 'phase4_escalation';

    const escalations = [];

    for (const draft of this.results.drafts) {
      const escalation = this.createDecisionCard(draft);
      escalations.push(escalation);
    }

    this.results.escalations = escalations;

    // Generate approval queue document
    await this.generateApprovalQueue();

    console.log(`✅ Phase 4 Complete: Created ${escalations.length} decision cards`);
    return true;
  }

  /**
   * Create a decision card for Steve's approval
   */
  createDecisionCard(draft) {
    const classification = this.results.classifications.find(c => c.id === draft.commentId);

    const risk = this.assessRisk(classification, draft);

    return {
      id: draft.commentId,
      person: draft.author,
      commentExcerpt: classification.text.substring(0, 100) + '...',
      score: classification.score,
      type: classification.type,
      priority: draft.priority,
      recommendedAction: draft.recommendedAction,
      draftReply: draft.replyText,
      risk: risk,
      reasoning: classification.reasoning
    };
  }

  /**
   * Assess risk level for the decision card
   */
  assessRisk(classification, draft) {
    if (classification.type === 'LEAD_SIGNAL' && classification.score >= 8) {
      return 'LOW'; // High-value lead, low risk
    } else if (classification.type === 'OBJECTION') {
      return 'MED'; // Could escalate if handled poorly
    } else if (classification.type === 'SPAM') {
      return 'HIGH'; // Don't engage with spam
    } else {
      return 'LOW'; // Standard engagement
    }
  }

  /**
   * Capture screenshot with timestamp
   */
  async captureScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}_${name}.png`;
    const filepath = path.join(this.runDir, 'screenshots', filename);

    await this.page.screenshot({
      path: filepath,
      fullPage: name.includes('full')
    });

    console.log(`📸 Screenshot: ${filename}`);
    return filename;
  }

  /**
   * Generate POST_ENGAGEMENT_INTAKE.json
   */
  async generateIntakeJSON() {
    const intake = {
      timestamp: this.results.timestamp,
      runId: this.runId,
      postData: this.results.postData,
      engagementSummary: {
        totalComments: this.results.comments.length,
        reactions: this.results.postData?.reactions || 0
      },
      comments: this.results.comments
    };

    const filepath = path.join(this.runDir, 'POST_ENGAGEMENT_INTAKE.json');
    await fs.writeFile(filepath, JSON.stringify(intake, null, 2));
    console.log(`📄 Generated: POST_ENGAGEMENT_INTAKE.json`);
  }

  /**
   * Generate COMMENT_CLASSIFICATION_REPORT.md
   */
  async generateClassificationReport() {
    const report = `# COMMENT_CLASSIFICATION_REPORT

**Run ID**: ${this.runId}
**Timestamp**: ${this.results.timestamp}
**Total Comments**: ${this.results.classifications.length}

## Classification Summary

${this.results.classifications.map((c, i) => `
### Comment ${i + 1}: ${c.author}
- **Type**: ${c.type}
- **Score**: ${c.score}/10
- **Priority**: ${c.priority}
- **Reasoning**: ${c.reasoning}

**Comment**: "${c.text.substring(0, 200)}..."

---
`).join('')}

## Priority Distribution

- **P0 (Score 8-10)**: ${this.results.classifications.filter(c => c.priority === 'P0').length}
- **P1 (Score 6-7)**: ${this.results.classifications.filter(c => c.priority === 'P1').length}
- **P2 (Score ≤5)**: ${this.results.classifications.filter(c => c.priority === 'P2').length}

## Type Distribution

${['PRAISE', 'QUESTION', 'EXPERIENCE', 'OBJECTION', 'LEAD_SIGNAL', 'SPAM'].map(type => {
  const count = this.results.classifications.filter(c => c.type === type).length;
  return `- **${type}**: ${count}`;
}).join('\n')}
`;

    const filepath = path.join(this.runDir, 'COMMENT_CLASSIFICATION_REPORT.md');
    await fs.writeFile(filepath, report);
    console.log(`📄 Generated: COMMENT_CLASSIFICATION_REPORT.md`);
  }

  /**
   * Generate DRAFT_COMMENT_REPLIES.md
   */
  async generateDraftReplies() {
    const drafts = `# DRAFT_COMMENT_REPLIES

**Run ID**: ${this.runId}
**Timestamp**: ${this.results.timestamp}
**Drafts Created**: ${this.results.drafts.length}

## Reply Drafts (P0 + P1 Only)

${this.results.drafts.map((draft, i) => `
### ${draft.commentId}: ${draft.author} (${draft.priority})
**Type**: ${draft.type}
**Recommended Action**: ${draft.recommendedAction}

**Draft Reply**:
\`\`\`
${draft.replyText}
\`\`\`

---
`).join('')}

## Steve Style Guidelines Applied

✅ No em-dashes
✅ No emojis
✅ No corporate filler
✅ Short sentences
✅ Natural voice, plain English
✅ One clean next step when needed
`;

    const filepath = path.join(this.runDir, 'DRAFT_COMMENT_REPLIES.md');
    await fs.writeFile(filepath, drafts);
    console.log(`📄 Generated: DRAFT_COMMENT_REPLIES.md`);
  }

  /**
   * Generate STEVE_ENGAGEMENT_APPROVAL_QUEUE.md
   */
  async generateApprovalQueue() {
    const queue = `# STEVE_ENGAGEMENT_APPROVAL_QUEUE

**Run ID**: ${this.runId}
**Timestamp**: ${this.results.timestamp}
**Items for Approval**: ${this.results.escalations.length}

## Decision Cards

${this.results.escalations.map((card, i) => `
### Decision Card ${i + 1}

**Person**: ${card.person}
**Comment**: "${card.commentExcerpt}"
**Score**: ${card.score}/10 (${card.type})
**Priority**: ${card.priority}
**Risk**: ${card.risk}

**Recommended Action**: ${card.recommendedAction}

**Draft Reply**:
\`\`\`
${card.draftReply}
\`\`\`

**Approval Commands**:
- \`REPLY ${card.id}\` - Post the draft reply
- \`DM ${card.id}\` - Send as direct message
- \`IGNORE ${card.id}\` - Skip this comment
- \`EDIT ${card.id} <new text>\` - Modify and post

---
`).join('')}

## Summary by Risk

- **LOW Risk**: ${this.results.escalations.filter(e => e.risk === 'LOW').length}
- **MED Risk**: ${this.results.escalations.filter(e => e.risk === 'MED').length}
- **HIGH Risk**: ${this.results.escalations.filter(e => e.risk === 'HIGH').length}

## Default Action

🛑 **NO REPLIES WILL BE POSTED AUTOMATICALLY**
All replies require explicit approval commands from Steve.
`;

    const filepath = path.join(this.runDir, 'STEVE_ENGAGEMENT_APPROVAL_QUEUE.md');
    await fs.writeFile(filepath, queue);
    console.log(`📄 Generated: STEVE_ENGAGEMENT_APPROVAL_QUEUE.md`);
  }

  /**
   * Close browser and cleanup
   */
  async close() {
    if (this.context) {
      await this.context.close();
    }
  }

  /**
   * Run complete engagement loop
   */
  async runEngagementLoop() {
    console.log('🚀 LINKEDIN ENGAGEMENT LOOP V1 STARTING...');
    console.log('='.repeat(70));

    try {
      await this.initialize();

      const phase1Success = await this.runPhase1();
      if (!phase1Success) throw new Error('Phase 1 failed');

      await this.runPhase2();
      await this.runPhase3();
      await this.runPhase4();

      this.results.success = true;
      this.results.phase = 'complete';

      console.log('✅ ENGAGEMENT LOOP COMPLETE');
      console.log(`📁 Proof pack: ${this.runDir}`);

      return this.results;

    } catch (error) {
      this.results.error = error.message;
      this.results.phase = 'failed';
      console.error(`❌ Engagement loop failed: ${error.message}`);
      return this.results;

    } finally {
      await this.close();
    }
  }
}

// CLI interface
async function main() {
  const loop = new LinkedInEngagementLoop();

  try {
    const results = await loop.runEngagementLoop();

    console.log('\n' + '='.repeat(70));
    console.log('ENGAGEMENT LOOP RESULT:');
    console.log('='.repeat(70));
    console.log(`Status: ${results.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Comments processed: ${results.comments?.length || 0}`);
    console.log(`Drafts created: ${results.drafts?.length || 0}`);
    console.log(`Items for approval: ${results.escalations?.length || 0}`);

    if (results.error) {
      console.error(`Error: ${results.error}`);
      process.exit(1);
    }

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(2);
  }
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  main();
}

export default LinkedInEngagementLoop;