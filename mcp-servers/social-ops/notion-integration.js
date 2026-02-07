/**
 * Notion Integration Module
 * Handles content tracking and synchronization with Notion database
 */

import { Client } from '@notionhq/client';

export class NotionContentTracker {
  constructor(config) {
    this.config = config;
    this.notion = null;

    if (config.notion?.apiKey) {
      this.notion = new Client({
        auth: config.notion.apiKey,
      });
    }
  }

  /**
   * Fetch scheduled posts for a platform
   */
  async fetchScheduledPosts(platform, limit = 10) {
    if (!this.notion || !this.config.notion?.socialMediaDbId) {
      return { error: 'Notion not configured' };
    }

    try {
      const response = await this.notion.databases.query({
        database_id: this.config.notion.socialMediaDbId,
        filter: {
          and: [
            {
              property: 'Platform',
              select: { equals: platform },
            },
            {
              property: 'Status',
              select: { equals: 'Scheduled' },
            },
            {
              or: [
                {
                  property: 'Scheduled Date',
                  date: { on_or_before: new Date().toISOString() },
                },
                {
                  property: 'Scheduled Date',
                  date: { is_empty: true },
                },
              ],
            },
          ],
        },
        sorts: [
          {
            property: 'Scheduled Date',
            direction: 'ascending',
          },
        ],
        page_size: limit,
      });

      return this.formatPosts(response.results);
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Format Notion pages into post objects
   */
  formatPosts(pages) {
    return pages.map(page => {
      const props = page.properties;

      return {
        id: page.id,
        platform: props.Platform?.select?.name,
        status: props.Status?.select?.name,
        content: this.extractRichText(props.Content),
        caption: this.extractRichText(props.Caption),
        hashtags: props.Hashtags?.multi_select?.map(tag => tag.name) || [],
        mentions: this.extractRichText(props.Mentions)?.split(',').map(m => m.trim()) || [],
        scheduledDate: props['Scheduled Date']?.date?.start,
        imageUrl: props['Image URL']?.url || props['Image']?.files?.[0]?.file?.url,
        videoPath: this.extractRichText(props['Video Path']),
        videoUrl: props['Video URL']?.url || props['Video']?.files?.[0]?.file?.url,
        approvalStatus: props['Approval Status']?.select?.name,
        postUrl: props['Post URL']?.url,
        metrics: {
          views: props.Views?.number,
          likes: props.Likes?.number,
          comments: props.Comments?.number,
          shares: props.Shares?.number,
        },
        created: page.created_time,
        lastEdited: page.last_edited_time,
      };
    });
  }

  /**
   * Extract text from Notion rich text property
   */
  extractRichText(richTextProp) {
    if (!richTextProp?.rich_text || richTextProp.rich_text.length === 0) {
      return null;
    }

    return richTextProp.rich_text
      .map(text => text.plain_text)
      .join('');
  }

  /**
   * Update post status
   */
  async updatePostStatus(pageId, status, additionalProperties = {}) {
    if (!this.notion) {
      return { error: 'Notion not configured' };
    }

    try {
      const properties = {
        'Status': {
          select: { name: status },
        },
        'Last Updated': {
          date: { start: new Date().toISOString() },
        },
        ...additionalProperties,
      };

      await this.notion.pages.update({
        page_id: pageId,
        properties,
      });

      return { success: true, pageId, status };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Mark post as posted with URL
   */
  async markAsPosted(pageId, postUrl, platform) {
    const additionalProperties = {
      'Post URL': {
        url: postUrl,
      },
      'Posted At': {
        date: { start: new Date().toISOString() },
      },
    };

    return this.updatePostStatus(pageId, 'Posted', additionalProperties);
  }

  /**
   * Update post metrics
   */
  async updateMetrics(pageId, metrics) {
    if (!this.notion) {
      return { error: 'Notion not configured' };
    }

    try {
      const properties = {};

      if (metrics.views !== undefined) {
        properties.Views = { number: metrics.views };
      }
      if (metrics.likes !== undefined) {
        properties.Likes = { number: metrics.likes };
      }
      if (metrics.comments !== undefined) {
        properties.Comments = { number: metrics.comments };
      }
      if (metrics.shares !== undefined) {
        properties.Shares = { number: metrics.shares };
      }

      properties['Metrics Updated'] = {
        date: { start: new Date().toISOString() },
      };

      await this.notion.pages.update({
        page_id: pageId,
        properties,
      });

      return { success: true, pageId, metrics };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Create a new post entry
   */
  async createPost(data) {
    if (!this.notion || !this.config.notion?.socialMediaDbId) {
      return { error: 'Notion not configured' };
    }

    try {
      const properties = {
        'Title': {
          title: [{
            text: {
              content: data.title || `${data.platform} Post - ${new Date().toLocaleDateString()}`,
            },
          }],
        },
        'Platform': {
          select: { name: data.platform },
        },
        'Status': {
          select: { name: data.status || 'Draft' },
        },
      };

      // Add optional properties
      if (data.content) {
        properties.Content = {
          rich_text: [{
            text: { content: data.content },
          }],
        };
      }

      if (data.caption) {
        properties.Caption = {
          rich_text: [{
            text: { content: data.caption },
          }],
        };
      }

      if (data.hashtags && data.hashtags.length > 0) {
        properties.Hashtags = {
          multi_select: data.hashtags.map(tag => ({ name: tag })),
        };
      }

      if (data.scheduledDate) {
        properties['Scheduled Date'] = {
          date: { start: data.scheduledDate },
        };
      }

      if (data.imageUrl) {
        properties['Image URL'] = { url: data.imageUrl };
      }

      const response = await this.notion.pages.create({
        parent: { database_id: this.config.notion.socialMediaDbId },
        properties,
      });

      return {
        success: true,
        pageId: response.id,
        url: response.url,
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Batch update multiple posts
   */
  async batchUpdate(updates) {
    const results = await Promise.allSettled(
      updates.map(({ pageId, status, properties }) =>
        this.updatePostStatus(pageId, status, properties)
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);
    const failed = results.filter(r => r.status === 'rejected').map(r => r.reason);

    return {
      successful,
      failed,
      total: updates.length,
    };
  }

  /**
   * Get post details
   */
  async getPost(pageId) {
    if (!this.notion) {
      return { error: 'Notion not configured' };
    }

    try {
      const page = await this.notion.pages.retrieve({ page_id: pageId });
      return this.formatPosts([page])[0];
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Search posts by criteria
   */
  async searchPosts(criteria) {
    if (!this.notion || !this.config.notion?.socialMediaDbId) {
      return { error: 'Notion not configured' };
    }

    try {
      const filters = { and: [] };

      if (criteria.platform) {
        filters.and.push({
          property: 'Platform',
          select: { equals: criteria.platform },
        });
      }

      if (criteria.status) {
        filters.and.push({
          property: 'Status',
          select: { equals: criteria.status },
        });
      }

      if (criteria.dateRange) {
        if (criteria.dateRange.start) {
          filters.and.push({
            property: 'Scheduled Date',
            date: { on_or_after: criteria.dateRange.start },
          });
        }
        if (criteria.dateRange.end) {
          filters.and.push({
            property: 'Scheduled Date',
            date: { on_or_before: criteria.dateRange.end },
          });
        }
      }

      const response = await this.notion.databases.query({
        database_id: this.config.notion.socialMediaDbId,
        filter: filters.and.length > 0 ? filters : undefined,
        sorts: criteria.sorts || [
          {
            property: 'Scheduled Date',
            direction: 'descending',
          },
        ],
        page_size: criteria.limit || 100,
      });

      return this.formatPosts(response.results);
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Archive old posts
   */
  async archiveOldPosts(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldPosts = await this.searchPosts({
      status: 'Posted',
      dateRange: {
        end: cutoffDate.toISOString(),
      },
    });

    if (oldPosts.error) {
      return oldPosts;
    }

    const updates = oldPosts.map(post => ({
      pageId: post.id,
      status: 'Archived',
      properties: {
        'Archived At': {
          date: { start: new Date().toISOString() },
        },
      },
    }));

    return this.batchUpdate(updates);
  }
}

export default NotionContentTracker;