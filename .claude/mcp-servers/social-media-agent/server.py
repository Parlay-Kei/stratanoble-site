#!/usr/bin/env python3
"""
Social Media Agent MCP Server

A global, production-ready MCP server for managing social media across
TikTok, Instagram, Twitter/X, YouTube, LinkedIn, and Facebook.

Works standalone - no project dependencies required.
"""

import asyncio
import json
import os
import sys
from datetime import datetime, timedelta
from typing import Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum

# MCP SDK imports
try:
    from mcp.server import Server
    from mcp.server.stdio import stdio_server
    from mcp.types import Tool, TextContent
except ImportError:
    print("Error: MCP SDK not installed. Run: pip install mcp", file=sys.stderr)
    sys.exit(1)

# Supabase client
try:
    from supabase import create_client, Client
except ImportError:
    print("Error: Supabase not installed. Run: pip install supabase", file=sys.stderr)
    sys.exit(1)

# HTTP client for API calls
try:
    import httpx
except ImportError:
    print("Error: httpx not installed. Run: pip install httpx", file=sys.stderr)
    sys.exit(1)


# =============================================================================
# Configuration
# =============================================================================

class Platform(str, Enum):
    TIKTOK = "tiktok"
    INSTAGRAM = "instagram"
    TWITTER = "twitter"
    YOUTUBE = "youtube"
    LINKEDIN = "linkedin"
    FACEBOOK = "facebook"


class ContentType(str, Enum):
    POST = "post"
    STORY = "story"
    REEL = "reel"
    VIDEO = "video"
    SHORT = "short"
    CAROUSEL = "carousel"
    LIVE = "live"
    ARTICLE = "article"


@dataclass
class PlatformConfig:
    client_id: str
    client_secret: str
    redirect_uri: str
    scopes: list[str]
    api_base_url: str


PLATFORM_CONFIGS = {
    Platform.TIKTOK: PlatformConfig(
        client_id=os.getenv("TIKTOK_CLIENT_KEY", ""),
        client_secret=os.getenv("TIKTOK_CLIENT_SECRET", ""),
        redirect_uri=os.getenv("TIKTOK_REDIRECT_URI", ""),
        scopes=["user.info.basic", "video.list", "video.upload"],
        api_base_url="https://open.tiktokapis.com/v2"
    ),
    Platform.INSTAGRAM: PlatformConfig(
        client_id=os.getenv("INSTAGRAM_CLIENT_ID", ""),
        client_secret=os.getenv("INSTAGRAM_CLIENT_SECRET", ""),
        redirect_uri=os.getenv("INSTAGRAM_REDIRECT_URI", ""),
        scopes=["instagram_basic", "instagram_content_publish", "instagram_manage_insights"],
        api_base_url="https://graph.facebook.com/v18.0"
    ),
    Platform.TWITTER: PlatformConfig(
        client_id=os.getenv("TWITTER_CLIENT_ID", ""),
        client_secret=os.getenv("TWITTER_CLIENT_SECRET", ""),
        redirect_uri=os.getenv("TWITTER_REDIRECT_URI", ""),
        scopes=["tweet.read", "tweet.write", "users.read"],
        api_base_url="https://api.twitter.com/2"
    ),
    Platform.YOUTUBE: PlatformConfig(
        client_id=os.getenv("YOUTUBE_CLIENT_ID", ""),
        client_secret=os.getenv("YOUTUBE_CLIENT_SECRET", ""),
        redirect_uri=os.getenv("YOUTUBE_REDIRECT_URI", ""),
        scopes=["https://www.googleapis.com/auth/youtube.upload"],
        api_base_url="https://www.googleapis.com/youtube/v3"
    ),
    Platform.LINKEDIN: PlatformConfig(
        client_id=os.getenv("LINKEDIN_CLIENT_ID", ""),
        client_secret=os.getenv("LINKEDIN_CLIENT_SECRET", ""),
        redirect_uri=os.getenv("LINKEDIN_REDIRECT_URI", ""),
        scopes=["r_liteprofile", "w_member_social"],
        api_base_url="https://api.linkedin.com/v2"
    ),
    Platform.FACEBOOK: PlatformConfig(
        client_id=os.getenv("FACEBOOK_APP_ID", ""),
        client_secret=os.getenv("FACEBOOK_APP_SECRET", ""),
        redirect_uri=os.getenv("FACEBOOK_REDIRECT_URI", ""),
        scopes=["pages_manage_posts", "pages_read_engagement"],
        api_base_url="https://graph.facebook.com/v18.0"
    ),
}


# =============================================================================
# Database Client
# =============================================================================

class DatabaseClient:
    """Supabase database client for social media data."""

    def __init__(self):
        self.url = os.getenv("SUPABASE_URL", "")
        self.key = os.getenv("SUPABASE_SERVICE_KEY", "")
        self._client: Optional[Client] = None

    @property
    def client(self) -> Client:
        if not self._client:
            if not self.url or not self.key:
                raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
            self._client = create_client(self.url, self.key)
        return self._client

    async def get_accounts(self, org_id: str, platform: Optional[str] = None) -> list[dict]:
        """Get connected social accounts."""
        query = self.client.table("social_accounts").select("*").eq("organisation_id", org_id)
        if platform:
            query = query.eq("platform", platform)
        result = query.execute()
        return result.data or []

    async def get_account(self, account_id: str) -> Optional[dict]:
        """Get a specific account."""
        result = self.client.table("social_accounts").select("*").eq("id", account_id).single().execute()
        return result.data

    async def create_account(self, data: dict) -> dict:
        """Create a new social account."""
        result = self.client.table("social_accounts").insert(data).execute()
        return result.data[0] if result.data else {}

    async def update_account(self, account_id: str, data: dict) -> dict:
        """Update an account."""
        result = self.client.table("social_accounts").update(data).eq("id", account_id).execute()
        return result.data[0] if result.data else {}

    async def delete_account(self, account_id: str) -> bool:
        """Delete an account."""
        self.client.table("social_accounts").delete().eq("id", account_id).execute()
        return True

    async def get_content_queue(
        self,
        org_id: str,
        account_id: Optional[str] = None,
        status: Optional[str] = None
    ) -> list[dict]:
        """Get content queue."""
        query = self.client.table("social_content_queue").select("*").eq("organisation_id", org_id)
        if account_id:
            query = query.eq("account_id", account_id)
        if status:
            query = query.eq("status", status)
        result = query.order("scheduled_at", desc=False).execute()
        return result.data or []

    async def create_content(self, data: dict) -> dict:
        """Create content in queue."""
        result = self.client.table("social_content_queue").insert(data).execute()
        return result.data[0] if result.data else {}

    async def update_content(self, content_id: str, data: dict) -> dict:
        """Update content."""
        result = self.client.table("social_content_queue").update(data).eq("id", content_id).execute()
        return result.data[0] if result.data else {}

    async def get_analytics(
        self,
        org_id: str,
        account_id: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> list[dict]:
        """Get analytics data."""
        query = self.client.table("social_analytics").select("*").eq("organisation_id", org_id)
        if account_id:
            query = query.eq("account_id", account_id)
        if start_date:
            query = query.gte("metric_date", start_date)
        if end_date:
            query = query.lte("metric_date", end_date)
        result = query.execute()
        return result.data or []

    async def get_trends(self, platform: str, region: str = "US") -> list[dict]:
        """Get cached trends."""
        result = self.client.table("social_trends") \
            .select("*") \
            .eq("platform", platform) \
            .eq("region", region) \
            .gte("discovered_at", (datetime.utcnow() - timedelta(hours=1)).isoformat()) \
            .order("peak_rank", desc=False) \
            .limit(20) \
            .execute()
        return result.data or []

    async def save_trends(self, trends: list[dict]) -> None:
        """Save trends to cache."""
        if trends:
            self.client.table("social_trends").upsert(trends).execute()

    async def get_automation_rules(self, org_id: str) -> list[dict]:
        """Get automation rules."""
        result = self.client.table("social_automation_rules") \
            .select("*") \
            .eq("organisation_id", org_id) \
            .execute()
        return result.data or []

    async def create_automation_rule(self, data: dict) -> dict:
        """Create automation rule."""
        result = self.client.table("social_automation_rules").insert(data).execute()
        return result.data[0] if result.data else {}

    async def log_compliance_event(self, data: dict) -> None:
        """Log compliance event."""
        self.client.table("social_compliance_audit").insert(data).execute()

    async def get_compliance_audit(
        self,
        org_id: str,
        account_id: Optional[str] = None
    ) -> list[dict]:
        """Get compliance audit log."""
        query = self.client.table("social_compliance_audit").select("*").eq("organisation_id", org_id)
        if account_id:
            query = query.eq("account_id", account_id)
        result = query.order("created_at", desc=True).limit(100).execute()
        return result.data or []


# =============================================================================
# Platform Adapters
# =============================================================================

class PlatformAdapter:
    """Base adapter for social media platforms."""

    def __init__(self, platform: Platform, config: PlatformConfig):
        self.platform = platform
        self.config = config
        self.http = httpx.AsyncClient(timeout=30.0)

    def get_auth_url(self, state: str) -> str:
        """Get OAuth authorization URL."""
        raise NotImplementedError

    async def exchange_token(self, code: str) -> dict:
        """Exchange authorization code for tokens."""
        raise NotImplementedError

    async def get_account_info(self, access_token: str) -> dict:
        """Get account information."""
        raise NotImplementedError

    async def publish_content(self, access_token: str, content: dict) -> dict:
        """Publish content to platform."""
        raise NotImplementedError

    async def get_analytics(self, access_token: str, params: dict) -> dict:
        """Get platform analytics."""
        raise NotImplementedError

    async def get_trends(self, access_token: str, region: str) -> list[dict]:
        """Get trending content."""
        return []

    async def check_shadowban(self, access_token: str) -> dict:
        """Check for shadowban indicators."""
        return {"is_shadowbanned": False, "indicators": []}


class TikTokAdapter(PlatformAdapter):
    """TikTok platform adapter."""

    def get_auth_url(self, state: str) -> str:
        scopes = ",".join(self.config.scopes)
        return (
            f"https://www.tiktok.com/v2/auth/authorize?"
            f"client_key={self.config.client_id}&"
            f"scope={scopes}&"
            f"response_type=code&"
            f"redirect_uri={self.config.redirect_uri}&"
            f"state={state}"
        )

    async def exchange_token(self, code: str) -> dict:
        response = await self.http.post(
            f"{self.config.api_base_url}/oauth/token/",
            data={
                "client_key": self.config.client_id,
                "client_secret": self.config.client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": self.config.redirect_uri,
            }
        )
        return response.json()

    async def get_account_info(self, access_token: str) -> dict:
        response = await self.http.get(
            f"{self.config.api_base_url}/user/info/",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"fields": "open_id,union_id,avatar_url,display_name,follower_count"}
        )
        data = response.json().get("data", {}).get("user", {})
        return {
            "platform_user_id": data.get("open_id"),
            "username": data.get("display_name"),
            "display_name": data.get("display_name"),
            "profile_image_url": data.get("avatar_url"),
            "followers_count": data.get("follower_count", 0),
        }

    async def get_trends(self, access_token: str, region: str) -> list[dict]:
        # TikTok doesn't have a public trends API, return empty
        return []


class InstagramAdapter(PlatformAdapter):
    """Instagram platform adapter (via Facebook Graph API)."""

    def get_auth_url(self, state: str) -> str:
        scopes = ",".join(self.config.scopes)
        return (
            f"https://www.facebook.com/v18.0/dialog/oauth?"
            f"client_id={self.config.client_id}&"
            f"redirect_uri={self.config.redirect_uri}&"
            f"scope={scopes}&"
            f"state={state}"
        )

    async def exchange_token(self, code: str) -> dict:
        response = await self.http.get(
            f"{self.config.api_base_url}/oauth/access_token",
            params={
                "client_id": self.config.client_id,
                "client_secret": self.config.client_secret,
                "code": code,
                "redirect_uri": self.config.redirect_uri,
            }
        )
        return response.json()

    async def get_account_info(self, access_token: str) -> dict:
        # First get Facebook pages
        pages_response = await self.http.get(
            f"{self.config.api_base_url}/me/accounts",
            params={"access_token": access_token}
        )
        pages = pages_response.json().get("data", [])

        if not pages:
            return {}

        page = pages[0]
        page_token = page.get("access_token")

        # Get Instagram Business Account
        ig_response = await self.http.get(
            f"{self.config.api_base_url}/{page['id']}",
            params={
                "fields": "instagram_business_account",
                "access_token": page_token
            }
        )
        ig_account = ig_response.json().get("instagram_business_account", {})

        if not ig_account:
            return {}

        # Get Instagram account details
        details_response = await self.http.get(
            f"{self.config.api_base_url}/{ig_account['id']}",
            params={
                "fields": "id,username,name,profile_picture_url,followers_count,follows_count,media_count",
                "access_token": page_token
            }
        )
        data = details_response.json()

        return {
            "platform_user_id": data.get("id"),
            "username": data.get("username"),
            "display_name": data.get("name"),
            "profile_image_url": data.get("profile_picture_url"),
            "followers_count": data.get("followers_count", 0),
            "following_count": data.get("follows_count", 0),
            "posts_count": data.get("media_count", 0),
        }


class TwitterAdapter(PlatformAdapter):
    """Twitter/X platform adapter."""

    def get_auth_url(self, state: str) -> str:
        scopes = "%20".join(self.config.scopes)
        return (
            f"https://twitter.com/i/oauth2/authorize?"
            f"response_type=code&"
            f"client_id={self.config.client_id}&"
            f"redirect_uri={self.config.redirect_uri}&"
            f"scope={scopes}&"
            f"state={state}&"
            f"code_challenge=challenge&"
            f"code_challenge_method=plain"
        )

    async def exchange_token(self, code: str) -> dict:
        import base64
        credentials = base64.b64encode(
            f"{self.config.client_id}:{self.config.client_secret}".encode()
        ).decode()

        response = await self.http.post(
            "https://api.twitter.com/2/oauth2/token",
            headers={
                "Authorization": f"Basic {credentials}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data={
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": self.config.redirect_uri,
                "code_verifier": "challenge",
            }
        )
        return response.json()

    async def get_account_info(self, access_token: str) -> dict:
        response = await self.http.get(
            f"{self.config.api_base_url}/users/me",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"user.fields": "id,name,username,profile_image_url,public_metrics,verified"}
        )
        data = response.json().get("data", {})
        metrics = data.get("public_metrics", {})

        return {
            "platform_user_id": data.get("id"),
            "username": data.get("username"),
            "display_name": data.get("name"),
            "profile_image_url": data.get("profile_image_url"),
            "followers_count": metrics.get("followers_count", 0),
            "following_count": metrics.get("following_count", 0),
            "posts_count": metrics.get("tweet_count", 0),
            "is_verified": data.get("verified", False),
        }

    async def get_trends(self, access_token: str, region: str) -> list[dict]:
        # Get WOEID for region (simplified - US = 23424977)
        woeid = 23424977

        response = await self.http.get(
            "https://api.twitter.com/1.1/trends/place.json",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"id": woeid}
        )

        if response.status_code != 200:
            return []

        data = response.json()
        if not data:
            return []

        trends = data[0].get("trends", [])[:20]
        return [
            {
                "trend_type": "hashtag" if t.get("name", "").startswith("#") else "topic",
                "trend_value": t.get("name", ""),
                "trend_title": t.get("name", ""),
                "volume": t.get("tweet_volume") or 0,
                "peak_rank": i + 1,
            }
            for i, t in enumerate(trends)
        ]


class YouTubeAdapter(PlatformAdapter):
    """YouTube platform adapter."""

    def get_auth_url(self, state: str) -> str:
        scopes = "%20".join(self.config.scopes)
        return (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={self.config.client_id}&"
            f"redirect_uri={self.config.redirect_uri}&"
            f"response_type=code&"
            f"scope={scopes}&"
            f"state={state}&"
            f"access_type=offline"
        )

    async def exchange_token(self, code: str) -> dict:
        response = await self.http.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": self.config.client_id,
                "client_secret": self.config.client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": self.config.redirect_uri,
            }
        )
        return response.json()

    async def get_account_info(self, access_token: str) -> dict:
        response = await self.http.get(
            f"{self.config.api_base_url}/channels",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"part": "snippet,statistics", "mine": "true"}
        )

        items = response.json().get("items", [])
        if not items:
            return {}

        channel = items[0]
        snippet = channel.get("snippet", {})
        stats = channel.get("statistics", {})

        return {
            "platform_user_id": channel.get("id"),
            "username": snippet.get("customUrl", "").replace("@", ""),
            "display_name": snippet.get("title"),
            "profile_image_url": snippet.get("thumbnails", {}).get("high", {}).get("url"),
            "bio": snippet.get("description"),
            "followers_count": int(stats.get("subscriberCount", 0)),
            "posts_count": int(stats.get("videoCount", 0)),
        }

    async def get_trends(self, access_token: str, region: str) -> list[dict]:
        response = await self.http.get(
            f"{self.config.api_base_url}/videos",
            headers={"Authorization": f"Bearer {access_token}"},
            params={
                "part": "snippet,statistics",
                "chart": "mostPopular",
                "regionCode": region,
                "maxResults": 20
            }
        )

        videos = response.json().get("items", [])
        return [
            {
                "trend_type": "video",
                "trend_value": v.get("id"),
                "trend_title": v.get("snippet", {}).get("title"),
                "trend_description": v.get("snippet", {}).get("description", "")[:200],
                "volume": int(v.get("statistics", {}).get("viewCount", 0)),
                "peak_rank": i + 1,
            }
            for i, v in enumerate(videos)
        ]


class LinkedInAdapter(PlatformAdapter):
    """LinkedIn platform adapter."""

    def get_auth_url(self, state: str) -> str:
        scopes = "%20".join(self.config.scopes)
        return (
            f"https://www.linkedin.com/oauth/v2/authorization?"
            f"response_type=code&"
            f"client_id={self.config.client_id}&"
            f"redirect_uri={self.config.redirect_uri}&"
            f"scope={scopes}&"
            f"state={state}"
        )

    async def exchange_token(self, code: str) -> dict:
        response = await self.http.post(
            "https://www.linkedin.com/oauth/v2/accessToken",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": self.config.redirect_uri,
                "client_id": self.config.client_id,
                "client_secret": self.config.client_secret,
            }
        )
        return response.json()

    async def get_account_info(self, access_token: str) -> dict:
        response = await self.http.get(
            f"{self.config.api_base_url}/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        data = response.json()

        first_name = data.get("localizedFirstName", "")
        last_name = data.get("localizedLastName", "")

        return {
            "platform_user_id": data.get("id"),
            "username": data.get("id"),
            "display_name": f"{first_name} {last_name}".strip(),
        }


class FacebookAdapter(PlatformAdapter):
    """Facebook platform adapter."""

    def get_auth_url(self, state: str) -> str:
        scopes = ",".join(self.config.scopes)
        return (
            f"https://www.facebook.com/v18.0/dialog/oauth?"
            f"client_id={self.config.client_id}&"
            f"redirect_uri={self.config.redirect_uri}&"
            f"scope={scopes}&"
            f"state={state}"
        )

    async def exchange_token(self, code: str) -> dict:
        response = await self.http.get(
            f"{self.config.api_base_url}/oauth/access_token",
            params={
                "client_id": self.config.client_id,
                "client_secret": self.config.client_secret,
                "code": code,
                "redirect_uri": self.config.redirect_uri,
            }
        )
        return response.json()

    async def get_account_info(self, access_token: str) -> dict:
        # Get pages
        response = await self.http.get(
            f"{self.config.api_base_url}/me/accounts",
            params={
                "access_token": access_token,
                "fields": "id,name,fan_count,picture"
            }
        )
        pages = response.json().get("data", [])

        if not pages:
            return {}

        page = pages[0]
        return {
            "platform_user_id": page.get("id"),
            "username": page.get("id"),
            "display_name": page.get("name"),
            "profile_image_url": page.get("picture", {}).get("data", {}).get("url"),
            "followers_count": page.get("fan_count", 0),
        }


# Adapter factory
def get_adapter(platform: Platform) -> PlatformAdapter:
    """Get platform adapter instance."""
    config = PLATFORM_CONFIGS[platform]
    adapters = {
        Platform.TIKTOK: TikTokAdapter,
        Platform.INSTAGRAM: InstagramAdapter,
        Platform.TWITTER: TwitterAdapter,
        Platform.YOUTUBE: YouTubeAdapter,
        Platform.LINKEDIN: LinkedInAdapter,
        Platform.FACEBOOK: FacebookAdapter,
    }
    return adapters[platform](platform, config)


# =============================================================================
# AI Content Generation
# =============================================================================

class ContentGenerator:
    """AI-powered content generation."""

    def __init__(self):
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")
        self.http = httpx.AsyncClient(timeout=60.0)

    async def generate(
        self,
        platform: str,
        content_type: str,
        topic: Optional[str] = None,
        tone: str = "professional",
        target_audience: Optional[str] = None,
        include_hashtags: bool = True,
        max_length: Optional[int] = None,
        brand_voice: Optional[str] = None,
    ) -> dict:
        """Generate AI content for social media."""

        # Platform-specific limits
        limits = {
            "twitter": 280,
            "instagram": 2200,
            "tiktok": 2200,
            "linkedin": 3000,
            "facebook": 63206,
            "youtube": 5000,
        }

        char_limit = max_length or limits.get(platform, 2000)

        prompt = f"""Generate a {tone} social media {content_type} for {platform}.

Topic: {topic or "engaging content"}
Target Audience: {target_audience or "general"}
Character Limit: {char_limit}
{"Brand Voice: " + brand_voice if brand_voice else ""}

Requirements:
- Write compelling, platform-optimized content
- {"Include relevant hashtags" if include_hashtags else "No hashtags"}
- Match the platform's style and best practices
- Be authentic and engaging

Return JSON with:
{{
    "caption": "main content text",
    "hashtags": ["tag1", "tag2"],
    "suggestions": ["alternative version 1", "alternative version 2"]
}}"""

        if not self.anthropic_key:
            # Fallback without API
            return {
                "caption": f"Check out our latest {topic or 'content'}! #trending",
                "hashtags": ["trending", platform, "viral"],
                "suggestions": [],
                "model": "fallback"
            }

        response = await self.http.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": self.anthropic_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-3-haiku-20240307",
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": prompt}]
            }
        )

        if response.status_code != 200:
            return {
                "caption": f"Check out our latest {topic or 'content'}!",
                "hashtags": ["trending"],
                "suggestions": [],
                "model": "fallback"
            }

        data = response.json()
        content = data.get("content", [{}])[0].get("text", "{}")

        try:
            result = json.loads(content)
            result["model"] = "claude-3-haiku"
            return result
        except json.JSONDecodeError:
            return {
                "caption": content[:char_limit],
                "hashtags": [],
                "suggestions": [],
                "model": "claude-3-haiku"
            }


# =============================================================================
# MCP Server
# =============================================================================

# Initialize components
db = DatabaseClient()
generator = ContentGenerator()
server = Server("social-media-agent")


# Define tools
TOOLS = [
    Tool(
        name="connect_account",
        description="Get OAuth URL to connect a social media account. Supports: tiktok, instagram, twitter, youtube, linkedin, facebook",
        inputSchema={
            "type": "object",
            "properties": {
                "platform": {
                    "type": "string",
                    "enum": ["tiktok", "instagram", "twitter", "youtube", "linkedin", "facebook"],
                    "description": "Social media platform to connect"
                },
                "organization_id": {
                    "type": "string",
                    "description": "Organization ID for multi-tenant support"
                }
            },
            "required": ["platform", "organization_id"]
        }
    ),
    Tool(
        name="list_accounts",
        description="List all connected social media accounts",
        inputSchema={
            "type": "object",
            "properties": {
                "organization_id": {
                    "type": "string",
                    "description": "Organization ID"
                },
                "platform": {
                    "type": "string",
                    "enum": ["tiktok", "instagram", "twitter", "youtube", "linkedin", "facebook"],
                    "description": "Filter by platform (optional)"
                }
            },
            "required": ["organization_id"]
        }
    ),
    Tool(
        name="create_content",
        description="Create and optionally schedule social media content",
        inputSchema={
            "type": "object",
            "properties": {
                "organization_id": {"type": "string"},
                "account_id": {"type": "string", "description": "Account to post to"},
                "content_type": {
                    "type": "string",
                    "enum": ["post", "story", "reel", "video", "short", "carousel", "article"],
                },
                "caption": {"type": "string"},
                "hashtags": {"type": "array", "items": {"type": "string"}},
                "media_urls": {"type": "array", "items": {"type": "string"}},
                "scheduled_at": {"type": "string", "description": "ISO datetime for scheduling"},
                "timezone": {"type": "string", "default": "America/Los_Angeles"},
                "crosspost_accounts": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["organization_id", "account_id", "content_type"]
        }
    ),
    Tool(
        name="get_content_queue",
        description="Get scheduled and pending content",
        inputSchema={
            "type": "object",
            "properties": {
                "organization_id": {"type": "string"},
                "account_id": {"type": "string"},
                "status": {
                    "type": "string",
                    "enum": ["draft", "scheduled", "publishing", "published", "failed"]
                }
            },
            "required": ["organization_id"]
        }
    ),
    Tool(
        name="get_analytics",
        description="Get aggregated analytics across platforms",
        inputSchema={
            "type": "object",
            "properties": {
                "organization_id": {"type": "string"},
                "account_id": {"type": "string"},
                "start_date": {"type": "string", "description": "YYYY-MM-DD"},
                "end_date": {"type": "string", "description": "YYYY-MM-DD"},
            },
            "required": ["organization_id", "start_date", "end_date"]
        }
    ),
    Tool(
        name="get_trends",
        description="Get trending topics for a platform",
        inputSchema={
            "type": "object",
            "properties": {
                "platform": {
                    "type": "string",
                    "enum": ["tiktok", "instagram", "twitter", "youtube", "linkedin", "facebook"]
                },
                "region": {"type": "string", "default": "US", "description": "ISO country code"}
            },
            "required": ["platform"]
        }
    ),
    Tool(
        name="generate_content",
        description="Generate AI-powered social media content",
        inputSchema={
            "type": "object",
            "properties": {
                "platform": {
                    "type": "string",
                    "enum": ["tiktok", "instagram", "twitter", "youtube", "linkedin", "facebook"]
                },
                "content_type": {
                    "type": "string",
                    "enum": ["post", "story", "reel", "video", "short", "carousel", "article"]
                },
                "topic": {"type": "string"},
                "tone": {
                    "type": "string",
                    "enum": ["professional", "casual", "humorous", "inspiring", "informative"],
                    "default": "professional"
                },
                "target_audience": {"type": "string"},
                "include_hashtags": {"type": "boolean", "default": True},
                "max_length": {"type": "integer"},
                "brand_voice": {"type": "string"}
            },
            "required": ["platform", "content_type"]
        }
    ),
    Tool(
        name="create_automation_rule",
        description="Create an automation rule (if/then trigger)",
        inputSchema={
            "type": "object",
            "properties": {
                "organization_id": {"type": "string"},
                "name": {"type": "string"},
                "description": {"type": "string"},
                "trigger_type": {
                    "type": "string",
                    "enum": ["on_publish", "on_engagement", "on_mention", "on_dm", "on_comment", "on_schedule", "on_trend"]
                },
                "trigger_config": {"type": "object"},
                "action_type": {
                    "type": "string",
                    "enum": ["crosspost", "reply", "dm_response", "notify", "tag", "archive", "boost", "generate_content"]
                },
                "action_config": {"type": "object"},
                "source_accounts": {"type": "array", "items": {"type": "string"}},
                "target_accounts": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["organization_id", "name", "trigger_type", "action_type"]
        }
    ),
    Tool(
        name="check_compliance",
        description="Check account health and shadowban status",
        inputSchema={
            "type": "object",
            "properties": {
                "organization_id": {"type": "string"},
                "account_id": {"type": "string"}
            },
            "required": ["organization_id", "account_id"]
        }
    ),
]


@server.list_tools()
async def list_tools() -> list[Tool]:
    """List available tools."""
    return TOOLS


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Handle tool calls."""

    try:
        if name == "connect_account":
            platform = Platform(arguments["platform"])
            adapter = get_adapter(platform)
            import secrets
            state = secrets.token_hex(32)
            auth_url = adapter.get_auth_url(state)

            return [TextContent(
                type="text",
                text=json.dumps({
                    "success": True,
                    "platform": platform.value,
                    "auth_url": auth_url,
                    "state": state,
                    "instructions": f"Visit the URL to authorize {platform.value}. After authorization, use the callback code to complete the connection."
                }, indent=2)
            )]

        elif name == "list_accounts":
            accounts = await db.get_accounts(
                arguments["organization_id"],
                arguments.get("platform")
            )

            # Remove sensitive data
            safe_accounts = [
                {
                    "id": a.get("id"),
                    "platform": a.get("platform"),
                    "username": a.get("platform_username"),
                    "display_name": a.get("display_name"),
                    "followers_count": a.get("followers_count"),
                    "is_active": a.get("is_active"),
                    "last_sync": a.get("last_sync_at"),
                }
                for a in accounts
            ]

            return [TextContent(
                type="text",
                text=json.dumps({
                    "success": True,
                    "accounts": safe_accounts,
                    "count": len(safe_accounts)
                }, indent=2)
            )]

        elif name == "create_content":
            content_data = {
                "organisation_id": arguments["organization_id"],
                "account_id": arguments["account_id"],
                "content_type": arguments["content_type"],
                "caption": arguments.get("caption"),
                "hashtags": arguments.get("hashtags", []),
                "media_urls": arguments.get("media_urls", []),
                "scheduled_at": arguments.get("scheduled_at"),
                "timezone": arguments.get("timezone", "America/Los_Angeles"),
                "status": "scheduled" if arguments.get("scheduled_at") else "draft",
                "crosspost_accounts": arguments.get("crosspost_accounts", []),
                "created_by": arguments["organization_id"],
            }

            content = await db.create_content(content_data)

            return [TextContent(
                type="text",
                text=json.dumps({
                    "success": True,
                    "content": content,
                    "message": f"Content {'scheduled' if arguments.get('scheduled_at') else 'created as draft'}"
                }, indent=2)
            )]

        elif name == "get_content_queue":
            queue = await db.get_content_queue(
                arguments["organization_id"],
                arguments.get("account_id"),
                arguments.get("status")
            )

            return [TextContent(
                type="text",
                text=json.dumps({
                    "success": True,
                    "content": queue,
                    "count": len(queue)
                }, indent=2)
            )]

        elif name == "get_analytics":
            analytics = await db.get_analytics(
                arguments["organization_id"],
                arguments.get("account_id"),
                arguments["start_date"],
                arguments["end_date"]
            )

            # Aggregate metrics
            totals = {
                "views": sum(a.get("views", 0) for a in analytics),
                "impressions": sum(a.get("impressions", 0) for a in analytics),
                "likes": sum(a.get("likes", 0) for a in analytics),
                "comments": sum(a.get("comments", 0) for a in analytics),
                "shares": sum(a.get("shares", 0) for a in analytics),
                "followers_gained": sum(a.get("followers_gained", 0) for a in analytics),
            }

            return [TextContent(
                type="text",
                text=json.dumps({
                    "success": True,
                    "period": {
                        "start": arguments["start_date"],
                        "end": arguments["end_date"]
                    },
                    "totals": totals,
                    "daily_breakdown": analytics
                }, indent=2)
            )]

        elif name == "get_trends":
            platform = Platform(arguments["platform"])
            region = arguments.get("region", "US")

            # Check cache first
            cached = await db.get_trends(platform.value, region)
            if cached:
                return [TextContent(
                    type="text",
                    text=json.dumps({
                        "success": True,
                        "platform": platform.value,
                        "region": region,
                        "trends": cached,
                        "cached": True
                    }, indent=2)
                )]

            # Fetch fresh trends (would need account access token)
            return [TextContent(
                type="text",
                text=json.dumps({
                    "success": True,
                    "platform": platform.value,
                    "region": region,
                    "trends": [],
                    "message": "No cached trends available. Connect an account to fetch live trends."
                }, indent=2)
            )]

        elif name == "generate_content":
            result = await generator.generate(
                platform=arguments["platform"],
                content_type=arguments["content_type"],
                topic=arguments.get("topic"),
                tone=arguments.get("tone", "professional"),
                target_audience=arguments.get("target_audience"),
                include_hashtags=arguments.get("include_hashtags", True),
                max_length=arguments.get("max_length"),
                brand_voice=arguments.get("brand_voice"),
            )

            return [TextContent(
                type="text",
                text=json.dumps({
                    "success": True,
                    "generated": result
                }, indent=2)
            )]

        elif name == "create_automation_rule":
            rule_data = {
                "organisation_id": arguments["organization_id"],
                "name": arguments["name"],
                "description": arguments.get("description"),
                "trigger_type": arguments["trigger_type"],
                "trigger_config": arguments.get("trigger_config", {}),
                "action_type": arguments["action_type"],
                "action_config": arguments.get("action_config", {}),
                "source_accounts": arguments.get("source_accounts", []),
                "target_accounts": arguments.get("target_accounts", []),
                "is_active": True,
                "created_by": arguments["organization_id"],
            }

            rule = await db.create_automation_rule(rule_data)

            return [TextContent(
                type="text",
                text=json.dumps({
                    "success": True,
                    "rule": rule
                }, indent=2)
            )]

        elif name == "check_compliance":
            account = await db.get_account(arguments["account_id"])

            if not account:
                return [TextContent(
                    type="text",
                    text=json.dumps({
                        "success": False,
                        "error": "Account not found"
                    }, indent=2)
                )]

            # Get compliance audit
            audit = await db.get_compliance_audit(
                arguments["organization_id"],
                arguments["account_id"]
            )

            # Basic health check
            health = {
                "account_id": arguments["account_id"],
                "platform": account.get("platform"),
                "is_active": account.get("is_active", False),
                "compliance_status": account.get("compliance_status", "unknown"),
                "last_sync": account.get("last_sync_at"),
                "recent_issues": len([a for a in audit if not a.get("resolved")]),
                "audit_log": audit[:10]
            }

            return [TextContent(
                type="text",
                text=json.dumps({
                    "success": True,
                    "health": health
                }, indent=2)
            )]

        else:
            return [TextContent(
                type="text",
                text=json.dumps({
                    "success": False,
                    "error": f"Unknown tool: {name}"
                })
            )]

    except Exception as e:
        return [TextContent(
            type="text",
            text=json.dumps({
                "success": False,
                "error": str(e)
            })
        )]


async def main():
    """Run the MCP server."""
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
