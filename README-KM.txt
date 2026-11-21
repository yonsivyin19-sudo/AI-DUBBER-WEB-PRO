AI DUBBER WEB PRO V2.0
======================

ដំឡើងលើ Cloudflare Pages តាមរយៈ GitHub

1. Upload ឯកសារទាំងអស់ក្នុង ZIP ទៅ GitHub repository (កុំ Upload ZIP ជំនួសឯកសារខាងក្នុង)។
2. រក្សា Folder functions/api/translate.js ឱ្យនៅទីតាំងដដែល។
3. Cloudflare Dashboard > Workers & Pages > Create > Pages > Connect to Git.
4. ជ្រើស Repository AI-DUBBER-WEB-PRO។
5. Framework preset: None
6. Build command: ទុកទទេ
7. Build output directory: /
8. Deploy។
9. ចូល Project > Settings > Variables and Secrets > Add secret:
   Name: GEMINI_API_KEY
   Value: Gemini API key របស់អ្នក
10. Save ហើយ Redeploy។

សាកល្បង Import SRT > Translate subtitles > Export SRT។

ចំណាំ៖
- API key ត្រូវដាក់ជា Cloudflare Secret ប៉ុណ្ណោះ។ កុំដាក់ក្នុង app.js ឬ index.html។
- ជ្រើស gemini-2.5-flash ជាជម្រើសសាកល្បងដែលត្រូវពិនិត្យ availability តាម Google AI API key របស់អ្នក។
- gemini-3.7-flash អាចមិនមានសម្រាប់ API key/endpoint របស់អ្នក។ ប្រសិនបើ API បង្ហាញ model not found សូមប្រើ model ដែល Google បង្ហាញថាអាចប្រើបាន។
- Video គឺសម្រាប់ Preview ក្នុង browser ប៉ុណ្ណោះ។ កំណែនេះមិនទាន់ render ឬ export MP4 ទេ។
- Export មានតែ SRT។ Voice playback និង neural dubbing មិនទាន់មានក្នុងកំណែនេះ។
