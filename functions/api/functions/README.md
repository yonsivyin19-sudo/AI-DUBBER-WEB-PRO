# AI DUBBER WEB PRO V2.0

A Cloudflare Pages subtitle translation starter.

## Deploy
Upload the contents of this ZIP to a GitHub repository, preserving `functions/api/translate.js`. Connect the repository to Cloudflare Pages with:
- Framework preset: None
- Build command: blank
- Build output directory: `/`

Add a Cloudflare Pages secret named `GEMINI_API_KEY`, then redeploy.

## Features
- Video preview in browser
- Import SRT/VTT
- Edit subtitle lines
- Translate subtitles using Gemini API through a Pages Function
- Export SRT

## Important limitations
Video preview is not video rendering. This version does not burn subtitles into video or export MP4. The browser UI does not expose the API key. Model availability depends on the Google Gemini API account and current model catalog; use a model currently supported by your API key.
