# LinkedIn Operations Skill

**Version**: 1.0.0  
**Last Updated**: December 30, 2025  
**Skill Type**: Social Media Management & API Integration  

---

## Overview

Comprehensive skill for managing LinkedIn profiles, creating and publishing content, tracking engagement, and analyzing performance through LinkedIn's official APIs. Covers OAuth 2.0 authentication, all content types (text, images, videos, polls), profile operations, engagement tracking, and analytics.

---

## Core Capabilities

### 1. Authentication & Authorization

#### OAuth 2.0 Setup
LinkedIn uses OAuth 2.0 (3-legged flow) for member authorization:

**Required Configuration**:
```javascript
const config = {
  clientId: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  redirectUri: 'https://your-app.com/callback',
  scope: ['openid', 'profile', 'email', 'w_member_social']
};
```

**Authorization Flow**:
1. **Request Authorization Code**:
```javascript
// Step 1: Redirect user to LinkedIn
const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
  `response_type=code&` +
  `client_id=${clientId}&` +
  `redirect_uri=${encodeURIComponent(redirectUri)}&` +
  `scope=${scopes.join(' ')}&` +
  `state=${secureRandomState}`;
```

2. **Exchange Code for Access Token**:
```javascript
// Step 2: Exchange authorization code
const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: authorizationCode,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret
  })
});

const { access_token, expires_in, refresh_token } = await tokenResponse.json();
```

3. **Token Management**:
```javascript
// Store securely
const tokenData = {
  accessToken: access_token,
  expiresAt: Date.now() + (expires_in * 1000),
  refreshToken: refresh_token
};

// Refresh before expiration
if (Date.now() > tokenData.expiresAt - (60 * 60 * 1000)) {
  await refreshAccessToken(tokenData.refreshToken);
}
```

#### Available Scopes

**Open Permissions** (Self-service):
- `openid` - OpenID Connect authentication
- `profile` - Lite profile information
- `email` - Email address
- `w_member_social` - Post on behalf of member
- `r_member_social` - Read member's social data

**Requires Approval**:
- `w_organization_social` - Post on behalf of organization
- `r_organization_social` - Read organization social data
- `rw_organization_admin` - Organization admin access

---

### 2. Profile Operations

#### Get Current Member Profile
```javascript
async function getCurrentProfile(accessToken) {
  const response = await fetch('https://api.linkedin.com/v2/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-RestLi-Protocol-Version': '2.0.0'
    }
  });
  
  const profile = await response.json();
  return {
    id: profile.id,
    firstName: profile.localizedFirstName,
    lastName: profile.localizedLastName,
    headline: profile.headline,
    profilePicture: profile.profilePicture
  };
}
```

#### Get Profile with Additional Fields
```javascript
async function getDetailedProfile(accessToken, personId) {
  const fields = [
    'id',
    'firstName',
    'lastName', 
    'headline',
    'vanityName',
    'location',
    'industry'
  ].join(',');
  
  const response = await fetch(
    `https://api.linkedin.com/v2/people/(id:${personId})?projection=(${fields})`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-RestLi-Protocol-Version': '2.0.0'
      }
    }
  );
  
  return await response.json();
}
```

#### Profile Field Types

**Lite Profile Fields** (Basic access):
- `id` - Person ID (unique per application)
- `firstName` - First name
- `lastName` - Last name
- `profilePicture` - Profile picture URLs
- `headline` - Professional headline

**Extended Fields** (Requires partner approval):
- `vanityName` - Custom URL
- `location` - Geographic location
- `positions` - Work experience
- `educations` - Education history
- `skills` - Listed skills
- `recommendations` - Recommendations received

---

### 3. Content Creation & Publishing

#### Create Text Post
```javascript
async function createTextPost(accessToken, authorUrn, text) {
  const response = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-RestLi-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202501'
    },
    body: JSON.stringify({
      author: authorUrn, // e.g., "urn:li:person:abc123"
      commentary: text,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false
    })
  });
  
  const postId = response.headers.get('x-restli-id');
  return {
    success: response.status === 201,
    postId: postId,
    postUrl: `https://www.linkedin.com/feed/update/${postId}`
  };
}
```

#### Create Image Post

**Step 1: Upload Image**
```javascript
async function uploadImage(accessToken, personUrn, imageBuffer) {
  // 1. Register upload
  const registerResponse = await fetch('https://api.linkedin.com/rest/images?action=initializeUpload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-RestLi-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202501'
    },
    body: JSON.stringify({
      initializeUploadRequest: {
        owner: personUrn
      }
    })
  });
  
  const { value } = await registerResponse.json();
  const uploadUrl = value.uploadUrl;
  const imageUrn = value.image;
  
  // 2. Upload binary image
  await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream'
    },
    body: imageBuffer
  });
  
  return imageUrn; // e.g., "urn:li:image:C4E10AQGKQg6y2a4sQ"
}
```

**Step 2: Create Post with Image**
```javascript
async function createImagePost(accessToken, authorUrn, text, imageUrn) {
  const response = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-RestLi-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202501'
    },
    body: JSON.stringify({
      author: authorUrn,
      commentary: text,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      content: {
        media: {
          id: imageUrn
        }
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false
    })
  });
  
  return response.headers.get('x-restli-id');
}
```

#### Create Video Post

**Step 1: Upload Video** (similar to image)
```javascript
async function uploadVideo(accessToken, personUrn, videoBuffer) {
  // 1. Register video upload
  const registerResponse = await fetch('https://api.linkedin.com/rest/videos?action=initializeUpload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-RestLi-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202501'
    },
    body: JSON.stringify({
      initializeUploadRequest: {
        owner: personUrn,
        fileSizeBytes: videoBuffer.length,
        uploadCaptions: false,
        uploadThumbnail: false
      }
    })
  });
  
  const { value } = await registerResponse.json();
  const uploadUrl = value.uploadInstructions[0].uploadUrl;
  const videoUrn = value.video;
  
  // 2. Upload binary video
  await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream'
    },
    body: videoBuffer
  });
  
  return videoUrn;
}
```

**Step 2: Create Post with Video**
```javascript
async function createVideoPost(accessToken, authorUrn, text, videoUrn, title) {
  const response = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-RestLi-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202501'
    },
    body: JSON.stringify({
      author: authorUrn,
      commentary: text,
      visibility: 'PUBLIC',
      lifecycleState: 'PUBLISHED',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      content: {
        media: {
          title: title,
          id: videoUrn
        }
      },
      isReshareDisabledByAuthor: false
    })
  });
  
  return response.headers.get('x-restli-id');
}
```

#### Reshare Existing Post
```javascript
async function resharePost(accessToken, authorUrn, parentPostUrn, commentary) {
  const response = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-RestLi-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202501'
    },
    body: JSON.stringify({
      author: authorUrn,
      commentary: commentary || '',
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      reshareContext: {
        parent: parentPostUrn // e.g., "urn:li:share:6957408550713184256"
      },
      lifecycleState: 'PUBLISHED'
    })
  });
  
  return response.headers.get('x-restli-id');
}
```

---

### 4. Post Management

#### Retrieve All Posts by Author
```javascript
async function getPostsByAuthor(accessToken, authorUrn) {
  const encodedAuthor = encodeURIComponent(authorUrn);
  const response = await fetch(
    `https://api.linkedin.com/rest/posts?author=${encodedAuthor}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-RestLi-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202501'
      }
    }
  );
  
  const data = await response.json();
  return data.elements;
}
```

#### Get Specific Post
```javascript
async function getPost(accessToken, postUrn) {
  const encodedUrn = encodeURIComponent(postUrn);
  const response = await fetch(
    `https://api.linkedin.com/rest/posts/${encodedUrn}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-RestLi-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202501'
      }
    }
  );
  
  return await response.json();
}
```

#### Update Existing Post
```javascript
async function updatePost(accessToken, postUrn, updatedCommentary) {
  const encodedUrn = encodeURIComponent(postUrn);
  const response = await fetch(
    `https://api.linkedin.com/rest/posts/${encodedUrn}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-RestLi-Protocol-Version': '2.0.0',
        'X-RestLi-Method': 'PARTIAL_UPDATE',
        'LinkedIn-Version': '202501'
      },
      body: JSON.stringify({
        patch: {
          $set: {
            commentary: updatedCommentary
          }
        }
      })
    }
  );
  
  return response.status === 200;
}
```

#### Delete Post
```javascript
async function deletePost(accessToken, postUrn) {
  const encodedUrn = encodeURIComponent(postUrn);
  const response = await fetch(
    `https://api.linkedin.com/rest/posts/${encodedUrn}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-RestLi-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202501'
      }
    }
  );
  
  return response.status === 204;
}
```

---

### 5. Engagement Tracking

#### Get Post Reactions
```javascript
async function getPostReactions(accessToken, entityUrn) {
  const encodedEntity = encodeURIComponent(entityUrn);
  const response = await fetch(
    `https://api.linkedin.com/rest/reactions?entity=${encodedEntity}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-RestLi-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202501'
      }
    }
  );
  
  const data = await response.json();
  return data.elements;
}
```

#### Get Specific User's Reaction
```javascript
async function getUserReaction(accessToken, actorUrn, entityUrn) {
  const encodedActor = encodeURIComponent(actorUrn);
  const encodedEntity = encodeURIComponent(entityUrn);
  
  const response = await fetch(
    `https://api.linkedin.com/rest/reactions/(actor:${encodedActor},entity:${encodedEntity})`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-RestLi-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202501'
      }
    }
  );
  
  if (response.status === 404) {
    return null; // User hasn't reacted
  }
  
  return await response.json();
}
```

#### Reaction Types
- `LIKE` - Traditional like
- `PRAISE` - Celebrate
- `APPRECIATION` - Support
- `EMPATHY` - Love
- `INTEREST` - Insightful
- `ENTERTAINMENT` - Funny

#### Create Reaction
```javascript
async function addReaction(accessToken, actorUrn, entityUrn, reactionType) {
  const response = await fetch('https://api.linkedin.com/rest/reactions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-RestLi-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202501'
    },
    body: JSON.stringify({
      actor: actorUrn,
      entity: entityUrn,
      reactionType: reactionType // e.g., 'LIKE'
    })
  });
  
  return response.status === 201;
}
```

#### Delete Reaction
```javascript
async function removeReaction(accessToken, actorUrn, entityUrn) {
  const encodedActor = encodeURIComponent(actorUrn);
  const encodedEntity = encodeURIComponent(entityUrn);
  
  const response = await fetch(
    `https://api.linkedin.com/rest/reactions/(actor:${encodedActor},entity:${encodedEntity})`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-RestLi-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202501'
      }
    }
  );
  
  return response.status === 204;
}
```

---

### 6. Analytics & Reporting

#### Engagement Summary
```javascript
async function getEngagementSummary(accessToken, postUrns) {
  const summary = {
    totalPosts: postUrns.length,
    totalReactions: 0,
    reactionBreakdown: {},
    topPosts: []
  };
  
  for (const postUrn of postUrns) {
    const reactions = await getPostReactions(accessToken, postUrn);
    const post = await getPost(accessToken, postUrn);
    
    const postEngagement = {
      postUrn,
      commentary: post.commentary,
      publishedAt: post.publishedAt,
      reactionCount: reactions.length,
      reactions: {}
    };
    
    reactions.forEach(reaction => {
      const type = reaction.reactionType;
      postEngagement.reactions[type] = (postEngagement.reactions[type] || 0) + 1;
      summary.reactionBreakdown[type] = (summary.reactionBreakdown[type] || 0) + 1;
    });
    
    summary.totalReactions += reactions.length;
    summary.topPosts.push(postEngagement);
  }
  
  // Sort by engagement
  summary.topPosts.sort((a, b) => b.reactionCount - a.reactionCount);
  
  return summary;
}
```

#### Time-Series Analytics
```javascript
async function getTimeSeriesAnalytics(accessToken, authorUrn, startDate, endDate) {
  const posts = await getPostsByAuthor(accessToken, authorUrn);
  
  // Filter by date range
  const filteredPosts = posts.filter(post => {
    const publishedAt = new Date(post.publishedAt);
    return publishedAt >= startDate && publishedAt <= endDate;
  });
  
  // Aggregate by day
  const dailyMetrics = {};
  
  for (const post of filteredPosts) {
    const date = new Date(post.publishedAt).toISOString().split('T')[0];
    
    if (!dailyMetrics[date]) {
      dailyMetrics[date] = {
        postsPublished: 0,
        totalReactions: 0,
        averageEngagement: 0
      };
    }
    
    dailyMetrics[date].postsPublished++;
    
    const reactions = await getPostReactions(accessToken, post.id);
    dailyMetrics[date].totalReactions += reactions.length;
  }
  
  // Calculate averages
  Object.keys(dailyMetrics).forEach(date => {
    const metrics = dailyMetrics[date];
    metrics.averageEngagement = metrics.totalReactions / metrics.postsPublished;
  });
  
  return dailyMetrics;
}
```

---

### 7. Error Handling

#### Standard Error Responses
```javascript
async function handleLinkedInError(response) {
  if (response.ok) return null;
  
  const errorData = await response.json();
  
  const errorHandlers = {
    401: () => {
      // Unauthorized - token expired or invalid
      return {
        code: 'AUTH_EXPIRED',
        message: 'Access token expired. Please re-authenticate.',
        action: 'REFRESH_TOKEN'
      };
    },
    403: () => {
      // Forbidden - insufficient permissions
      return {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: errorData.message || 'Insufficient permissions for this operation',
        action: 'REQUEST_ADDITIONAL_SCOPES'
      };
    },
    404: () => {
      // Not found
      return {
        code: 'NOT_FOUND',
        message: 'Resource not found',
        action: 'VERIFY_URN'
      };
    },
    429: () => {
      // Rate limit exceeded
      const retryAfter = response.headers.get('Retry-After') || '60';
      return {
        code: 'RATE_LIMIT',
        message: `Rate limit exceeded. Retry after ${retryAfter} seconds`,
        action: 'IMPLEMENT_BACKOFF',
        retryAfter: parseInt(retryAfter)
      };
    },
    426: () => {
      // Upgrade required - version sunset
      return {
        code: 'VERSION_SUNSET',
        message: 'API version no longer supported',
        action: 'UPGRADE_VERSION'
      };
    },
    500: () => {
      // Server error
      return {
        code: 'SERVER_ERROR',
        message: 'LinkedIn server error',
        action: 'RETRY_WITH_BACKOFF'
      };
    }
  };
  
  const handler = errorHandlers[response.status];
  return handler ? handler() : {
    code: 'UNKNOWN_ERROR',
    message: errorData.message || 'Unknown error occurred',
    action: 'LOG_AND_ALERT'
  };
}
```

#### Retry Logic with Exponential Backoff
```javascript
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

---

### 8. Rate Limiting

#### Rate Limit Monitoring
```javascript
class RateLimitMonitor {
  constructor() {
    this.limits = {
      remaining: 100,
      reset: Date.now() + 3600000, // 1 hour from now
      total: 100
    };
  }
  
  updateFromHeaders(response) {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');
    const total = response.headers.get('X-RateLimit-Limit');
    
    if (remaining) this.limits.remaining = parseInt(remaining);
    if (reset) this.limits.reset = parseInt(reset) * 1000;
    if (total) this.limits.total = parseInt(total);
  }
  
  shouldThrottle() {
    // Throttle if less than 20% remaining
    return this.limits.remaining < (this.limits.total * 0.2);
  }
  
  timeUntilReset() {
    return Math.max(0, this.limits.reset - Date.now());
  }
  
  async waitIfNeeded() {
    if (this.limits.remaining === 0) {
      const waitTime = this.timeUntilReset();
      console.log(`Rate limit exhausted. Waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}
```

---

### 9. Version Management

#### API Version Header
Always include the LinkedIn-Version header:

```javascript
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'X-RestLi-Protocol-Version': '2.0.0',
  'LinkedIn-Version': '202501', // Format: YYYYMM
  'Content-Type': 'application/json'
};
```

#### Version Lifecycle
- New versions published monthly or quarterly
- Each version supported for minimum 1 year
- Monitor sunset schedules
- Test migrations proactively

#### Migration Strategy
```javascript
const API_VERSIONS = {
  current: '202501',
  sunset: '202401', // Will be deprecated
  migration: {
    from: '202401',
    to: '202501',
    deadline: '2026-01-31'
  }
};

function getApiVersion() {
  const today = new Date();
  const deadline = new Date(API_VERSIONS.migration.deadline);
  
  if (today > deadline) {
    return API_VERSIONS.current;
  }
  
  // Use old version until deadline
  return API_VERSIONS.migration.from;
}
```

---

### 10. Best Practices

#### Security
- **Never log access tokens** - Use `[REDACTED]` in logs
- **Store tokens encrypted** - Use secure key management
- **Implement CSRF protection** - Use state parameter in OAuth
- **Validate redirect URIs** - Whitelist only approved URIs
- **Rotate secrets regularly** - Update credentials quarterly

#### Performance
- **Batch requests** - Use BATCH_GET where possible
- **Cache profile data** - Max 24 hours for non-critical data
- **Monitor rate limits** - Stay below 80% threshold
- **Use CDN for media** - Cache images/videos
- **Implement request queuing** - Avoid burst traffic

#### Data Privacy
- **Store minimum data** - Only person URNs long-term
- **Respect privacy settings** - Check Off-LinkedIn Visibility
- **Delete on request** - Honor data deletion requests
- **Audit access logs** - Regular security reviews
- **Comply with GDPR** - Data protection compliance

#### Content Quality
- **Validate before posting** - Check character limits
- **Use proper formatting** - Clean, readable content
- **Include media optimization** - Compress images/videos
- **Test posts privately** - Verify before publishing
- **Monitor engagement** - Track performance metrics

---

## Common Use Cases

### Use Case 1: Daily Post Scheduler
```javascript
async function scheduleDailyPosts(accessToken, authorUrn, posts) {
  const results = [];
  
  for (const post of posts) {
    const scheduledTime = new Date(post.scheduledAt);
    const now = new Date();
    
    if (scheduledTime <= now) {
      try {
        const result = await createTextPost(
          accessToken,
          authorUrn,
          post.content
        );
        results.push({
          postId: post.id,
          status: 'published',
          linkedInPostId: result.postId
        });
      } catch (error) {
        results.push({
          postId: post.id,
          status: 'failed',
          error: error.message
        });
      }
    }
  }
  
  return results;
}
```

### Use Case 2: Engagement Report Generator
```javascript
async function generateWeeklyReport(accessToken, authorUrn) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const posts = await getPostsByAuthor(accessToken, authorUrn);
  const recentPosts = posts.filter(post => 
    new Date(post.publishedAt) >= oneWeekAgo
  );
  
  const report = {
    week: oneWeekAgo.toISOString().split('T')[0],
    totalPosts: recentPosts.length,
    topPerformers: [],
    engagement: {
      total: 0,
      average: 0,
      byType: {}
    }
  };
  
  for (const post of recentPosts) {
    const reactions = await getPostReactions(accessToken, post.id);
    
    const postMetrics = {
      postId: post.id,
      commentary: post.commentary.substring(0, 50) + '...',
      publishedAt: post.publishedAt,
      reactionCount: reactions.length,
      reactionTypes: {}
    };
    
    reactions.forEach(reaction => {
      const type = reaction.reactionType;
      postMetrics.reactionTypes[type] = (postMetrics.reactionTypes[type] || 0) + 1;
      report.engagement.byType[type] = (report.engagement.byType[type] || 0) + 1;
    });
    
    report.engagement.total += reactions.length;
    report.topPerformers.push(postMetrics);
  }
  
  report.topPerformers.sort((a, b) => b.reactionCount - a.reactionCount);
  report.topPerformers = report.topPerformers.slice(0, 5);
  report.engagement.average = report.engagement.total / report.totalPosts;
  
  return report;
}
```

### Use Case 3: Content Moderation Workflow
```javascript
async function moderateAndPublish(accessToken, authorUrn, draftPost) {
  // 1. Content validation
  const validation = validateContent(draftPost);
  if (!validation.valid) {
    return {
      status: 'rejected',
      reason: validation.errors
    };
  }
  
  // 2. Upload media if present
  let mediaUrn = null;
  if (draftPost.image) {
    mediaUrn = await uploadImage(
      accessToken,
      authorUrn,
      draftPost.image
    );
  }
  
  // 3. Create post
  const postResult = mediaUrn
    ? await createImagePost(accessToken, authorUrn, draftPost.text, mediaUrn)
    : await createTextPost(accessToken, authorUrn, draftPost.text);
  
  // 4. Track initial engagement
  await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
  const initialReactions = await getPostReactions(accessToken, postResult.postId);
  
  return {
    status: 'published',
    postId: postResult.postId,
    postUrl: postResult.postUrl,
    initialEngagement: initialReactions.length
  };
}

function validateContent(post) {
  const errors = [];
  
  if (!post.text || post.text.length === 0) {
    errors.push('Content cannot be empty');
  }
  
  if (post.text.length > 3000) {
    errors.push('Content exceeds 3000 character limit');
  }
  
  // Check for spam indicators
  const spamKeywords = ['buy now', 'click here', 'limited offer'];
  const hasSpam = spamKeywords.some(keyword => 
    post.text.toLowerCase().includes(keyword)
  );
  if (hasSpam) {
    errors.push('Content contains spam keywords');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## Integration Checklist

- [ ] Register app in LinkedIn Developer Portal
- [ ] Configure OAuth redirect URIs
- [ ] Request necessary scopes/permissions
- [ ] Implement OAuth 2.0 flow
- [ ] Securely store credentials
- [ ] Implement token refresh logic
- [ ] Add rate limit monitoring
- [ ] Implement error handling
- [ ] Add retry logic with backoff
- [ ] Test all post types (text, image, video)
- [ ] Verify engagement tracking
- [ ] Set up analytics collection
- [ ] Monitor API version updates
- [ ] Document all API calls
- [ ] Create runbooks for common issues

---

## Troubleshooting

### Issue: 401 Unauthorized
**Cause**: Expired or invalid access token  
**Solution**: Refresh token or re-authenticate

### Issue: 403 Forbidden
**Cause**: Insufficient permissions  
**Solution**: Request additional scopes, verify member permissions

### Issue: 429 Rate Limit
**Cause**: Too many requests  
**Solution**: Implement rate limiting, use exponential backoff

### Issue: Posts not appearing
**Cause**: Privacy settings, draft state  
**Solution**: Verify lifecycleState is 'PUBLISHED', check visibility

### Issue: Image upload fails
**Cause**: File size, format issues  
**Solution**: Compress images, verify format (JPEG, PNG)

---

## Resources

**Official Documentation**:
- [LinkedIn API Docs](https://learn.microsoft.com/en-us/linkedin/)
- [OAuth 2.0 Guide](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api)
- [Profile API](https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api)

**API Clients**:
- [linkedin-api-client (Node.js)](https://www.npmjs.com/package/linkedin-api-client)
- [Python LinkedIn](https://github.com/tomquirk/linkedin-api)

**Developer Portal**:
- [LinkedIn Developer Console](https://developer.linkedin.com/)
- [Apply for Access](https://business.linkedin.com/marketing-solutions/marketing-partners/become-a-partner)

---

**Version History**:
- v1.0.0 (2025-12-30): Initial release with OAuth 2.0, posting, engagement, and analytics
