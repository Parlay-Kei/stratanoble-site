#!/usr/bin/env python3
"""
YouTube Transcript Extractor for Obsidian
Extracts transcripts from YouTube videos and saves them to an Obsidian vault.
"""

import sys
import re
import json
import os
from datetime import datetime
from pathlib import Path

try:
    from youtube_transcript_api import YouTubeTranscriptApi
    from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound
except ImportError:
    print("ERROR: youtube-transcript-api not installed.")
    print("Run: pip install youtube-transcript-api")
    sys.exit(1)

# Load configuration
SCRIPT_DIR = Path(__file__).parent
CONFIG_PATH = SCRIPT_DIR / "config.json"

def load_config():
    """Load configuration from config.json"""
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH, 'r') as f:
            return json.load(f)
    return {
        "obsidian_vault": "",
        "transcript_folder": "YouTube Transcripts",
        "include_timestamps": True,
        "timestamp_format": "brackets"
    }

def extract_video_id(url: str) -> str:
    """Extract video ID from various YouTube URL formats."""
    patterns = [
        r'(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})',
        r'(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})',
        r'(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})',
        r'(?:youtu\.be\/)([a-zA-Z0-9_-]{11})',
        r'(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})',
        r'^([a-zA-Z0-9_-]{11})$'  # Just the video ID
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    raise ValueError(f"Could not extract video ID from: {url}")

def format_timestamp(seconds: float, format_type: str = "brackets") -> str:
    """Format seconds into readable timestamp."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    
    if hours > 0:
        timestamp = f"{hours}:{minutes:02d}:{secs:02d}"
    else:
        timestamp = f"{minutes}:{secs:02d}"
    
    if format_type == "brackets":
        return f"[{timestamp}]"
    elif format_type == "parentheses":
        return f"({timestamp})"
    else:
        return timestamp

def get_video_title(video_id: str) -> str:
    """Try to get video title, fallback to video ID."""
    try:
        import urllib.request
        import html
        url = f"https://www.youtube.com/watch?v={video_id}"
        response = urllib.request.urlopen(url)
        html_content = response.read().decode('utf-8')
        title_match = re.search(r'<title>(.+?) - YouTube</title>', html_content)
        if title_match:
            return html.unescape(title_match.group(1))
    except:
        pass
    return video_id

def sanitize_filename(name: str) -> str:
    """Sanitize string for use as filename."""
    # Remove or replace invalid characters
    invalid_chars = r'[<>:"/\\|?*]'
    sanitized = re.sub(invalid_chars, '', name)
    # Limit length
    return sanitized[:100].strip()

def fetch_transcript(video_id: str) -> list:
    """Fetch transcript from YouTube."""
    try:
        # youtube-transcript-api v1.x requires instantiation
        api = YouTubeTranscriptApi()

        # Try to list available transcripts and find English
        try:
            transcript_list = api.list(video_id)
            # Find English transcript
            for transcript in transcript_list:
                if transcript.language_code in ['en', 'en-US', 'en-GB']:
                    return api.fetch(transcript)
            # Fall back to first available
            if transcript_list:
                return api.fetch(transcript_list[0])
        except:
            pass

        # Direct fetch as fallback
        result = api.fetch(video_id)
        return result

    except TranscriptsDisabled:
        raise Exception("Transcripts are disabled for this video")
    except NoTranscriptFound:
        raise Exception("No transcript found for this video")
    except Exception as e:
        raise Exception(f"Error fetching transcript: {str(e)}")

def format_transcript(transcript: list, include_timestamps: bool, timestamp_format: str) -> str:
    """Format transcript entries into readable text."""
    lines = []

    for entry in transcript:
        # Support both dict (old API) and object (new API v1.x)
        if hasattr(entry, 'text'):
            text = entry.text.strip() if entry.text else ''
            start = entry.start
        else:
            text = entry.get('text', '').strip()
            start = entry.get('start', 0)

        if not text:
            continue

        if include_timestamps:
            timestamp = format_timestamp(start, timestamp_format)
            lines.append(f"{timestamp} {text}")
        else:
            lines.append(text)

    return '\n\n'.join(lines)

def create_obsidian_note(video_id: str, title: str, transcript: str, url: str, vault_path: str, folder: str) -> str:
    """Create Obsidian markdown note with transcript."""
    
    # Create frontmatter
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    frontmatter = f"""---
title: "{title}"
source: YouTube
video_id: {video_id}
url: {url}
extracted: {now}
tags:
  - youtube
  - transcript
---

"""
    
    # Create note content
    content = f"""{frontmatter}# {title}

**Source:** [{url}]({url})
**Extracted:** {now}

---

## Transcript

{transcript}
"""
    
    # Determine file path
    vault = Path(vault_path)
    if folder:
        output_dir = vault / folder
        output_dir.mkdir(parents=True, exist_ok=True)
    else:
        output_dir = vault
    
    filename = sanitize_filename(title) + ".md"
    filepath = output_dir / filename
    
    # Handle duplicates
    counter = 1
    while filepath.exists():
        filename = f"{sanitize_filename(title)} ({counter}).md"
        filepath = output_dir / filename
        counter += 1
    
    # Write file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return str(filepath)

def main():
    if len(sys.argv) < 2:
        print("Usage: python youtube_transcript.py <youtube_url>")
        print("Example: python youtube_transcript.py https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        sys.exit(1)
    
    url = sys.argv[1].strip()
    config = load_config()
    
    # Validate vault path
    if not config.get("obsidian_vault"):
        print("ERROR: Obsidian vault path not configured.")
        print(f"Edit: {CONFIG_PATH}")
        sys.exit(1)
    
    vault_path = Path(config["obsidian_vault"])
    if not vault_path.exists():
        print(f"ERROR: Obsidian vault not found: {vault_path}")
        print(f"Edit: {CONFIG_PATH}")
        sys.exit(1)
    
    try:
        # Extract video ID
        print(f"Parsing URL: {url}")
        video_id = extract_video_id(url)
        print(f"Video ID: {video_id}")
        
        # Get video title
        print("Fetching video title...")
        title = get_video_title(video_id)
        print(f"Title: {title}")
        
        # Fetch transcript
        print("Fetching transcript...")
        transcript_data = fetch_transcript(video_id)
        print(f"Got {len(transcript_data)} transcript segments")
        
        # Format transcript
        transcript_text = format_transcript(
            transcript_data,
            config.get("include_timestamps", True),
            config.get("timestamp_format", "brackets")
        )
        
        # Create Obsidian note
        filepath = create_obsidian_note(
            video_id=video_id,
            title=title,
            transcript=transcript_text,
            url=url,
            vault_path=config["obsidian_vault"],
            folder=config.get("transcript_folder", "")
        )
        
        print(f"\nTranscript saved to: {filepath}")
        return filepath
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
