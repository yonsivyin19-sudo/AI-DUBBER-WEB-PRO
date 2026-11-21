const DEFAULT_MODEL = "gemini-2.5-flash";

export async function onRequestPost({ request, env }) {
  try {
    if (!env.GEMINI_API_KEY) {
      return Response.json({ error: "Missing GEMINI_API_KEY secret in Cloudflare Pages settings." }, { status: 500 });
    }
    const body = await request.json();
    const { subtitles, targetLanguage, sourceLanguage = "auto", model } = body || {};
    if (!Array.isArray(subtitles) || !subtitles.length || !targetLanguage) {
      return Response.json({ error: "Please provide subtitles and targetLanguage." }, { status: 400 });
    }
    const safeModel = typeof model === "string" && /^[a-zA-Z0-9.-]+$/.test(model) ? model : DEFAULT_MODEL;
    const prompt = [
      `Translate each subtitle into ${targetLanguage}. Source language: ${sourceLanguage}.`,
      "Keep meaning, tone, names, and subtitle order. Return only valid JSON in this exact shape:",
      '{"translations":[{"index":0,"text":"translated text"}]}',
      "Do not add explanations.",
      JSON.stringify(subtitles)
    ].join("\n");
    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${safeModel}:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.2 } })
    });
    const raw = await apiResponse.text();
    let result;
    try { result = raw ? JSON.parse(raw) : null; }
    catch { return Response.json({ error: `Gemini returned invalid JSON (HTTP ${apiResponse.status}).` }, { status: 502 }); }
    if (!apiResponse.ok) {
      const message = result?.error?.message || `Gemini API error (HTTP ${apiResponse.status}).`;
      return Response.json({ error: message }, { status: apiResponse.status });
    }
    const generated = result?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
    let parsed;
    try { parsed = JSON.parse(generated); }
    catch { return Response.json({ error: "Gemini response could not be parsed as translation JSON." }, { status: 502 }); }
    if (!Array.isArray(parsed.translations)) return Response.json({ error: "Gemini response did not include a translations array." }, { status: 502 });
    return Response.json({ translations: parsed.translations });
  } catch (error) {
    return Response.json({ error: error?.message || "Unexpected server error." }, { status: 500 });
  }
}

export async function onRequest({ request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method Not Allowed. Use POST /api/translate." }, { status: 405, headers: { Allow: "POST" } });
  }
}