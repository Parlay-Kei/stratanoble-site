# YouTube Transcript Extractor

Extract transcript from a YouTube video and save to Obsidian vault.

## Arguments
- `$ARGUMENTS` - YouTube URL (required)

## Instructions

1. Parse the YouTube URL from: $ARGUMENTS
2. Extract the video ID from the URL
3. Run the transcript extraction script:
   ```bash
   python C:\Dev\.claude\scripts\youtube_transcript.py "$ARGUMENTS"
   ```
4. The script will:
   - Fetch the transcript using youtube-transcript-api
   - Format it with timestamps
   - Save to the configured Obsidian vault
   - Return the file path

## Configuration

Edit `C:\Dev\.claude\scripts\config.json` to set your Obsidian vault path.

## Usage

```
/youtube-transcript https://www.youtube.com/watch?v=VIDEO_ID
```
