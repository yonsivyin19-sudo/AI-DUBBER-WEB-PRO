const $ = id => document.getElementById(id);
let subtitles = [];
let videoUrl = null;

function setStatus(message, error=false) {
  $("status").textContent = message;
  $("status").style.color = error ? "#ff9b9b" : "#9fb4d2";
}
function parseTime(t) {
  const m = t.trim().replace(",", ".").match(/(\d+):(\d{2}):(\d{2})\.(\d{3})/);
  if (!m) return 0;
  return (+m[1])*3600 + (+m[2])*60 + (+m[3]) + (+m[4])/1000;
}
function toSrtTime(seconds) {
  const ms = Math.max(0, Math.round(seconds*1000));
  const h = String(Math.floor(ms/3600000)).padStart(2,"0");
  const m = String(Math.floor(ms%3600000/60000)).padStart(2,"0");
  const s = String(Math.floor(ms%60000/1000)).padStart(2,"0");
  const milli = String(ms%1000).padStart(3,"0");
  return `${h}:${m}:${s},${milli}`;
}
function parseSubtitle(text) {
  const normalized = text.replace(/\r/g,"").replace(/^WEBVTT[^\n]*\n/i,"").trim();
  const blocks = normalized.split(/\n\s*\n/);
  const result = [];
  for (const block of blocks) {
    const lines = block.split("\n");
    const timeIndex = lines.findIndex(line => line.includes("-->"));
    if (timeIndex < 0) continue;
    const times = lines[timeIndex].split("-->");
    const start = parseTime(times[0]);
    const end = parseTime(times[1].trim().split(/\s+/)[0]);
    const content = lines.slice(timeIndex+1).join("\n").trim();
    if (content) result.push({start,end,text:content});
  }
  return result;
}
function renderSubtitles() {
  const host = $("subtitleList");
  host.innerHTML = "";
  if (!subtitles.length) {
    host.innerHTML = '<p class="muted">No subtitles loaded yet.</p>';
    return;
  }
  subtitles.forEach((item,index) => {
    const wrap = document.createElement("div");
    wrap.className = "subtitle-item";
    const time = document.createElement("small");
    time.textContent = `${toSrtTime(item.start)} → ${toSrtTime(item.end)}`;
    const area = document.createElement("textarea");
    area.value = item.text;
    area.setAttribute("aria-label", `Subtitle ${index+1}`);
    area.addEventListener("input", () => subtitles[index].text = area.value);
    wrap.append(time,area);
    host.appendChild(wrap);
  });
}
$("videoFile").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;
  if (videoUrl) URL.revokeObjectURL(videoUrl);
  videoUrl = URL.createObjectURL(file);
  $("videoPreview").src = videoUrl;
  $("videoPreview").hidden = false;
});
$("subtitleFile").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    subtitles = parseSubtitle(await file.text());
    renderSubtitles();
    setStatus(`Loaded ${subtitles.length} subtitle lines.`);
  } catch (error) {
    setStatus(`Could not read subtitle file: ${error.message}`, true);
  }
});
$("translateBtn").addEventListener("click", async () => {
  if (!subtitles.length) return setStatus("Please import an SRT or VTT file first.", true);
  const button = $("translateBtn");
  button.disabled = true;
  setStatus("Translating… please wait.");
  try {
    const response = await fetch("/api/translate", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        sourceLanguage:$("sourceLang").value,
        targetLanguage:$("targetLang").value,
        model:$("modelSelect").value,
        subtitles:subtitles.map((s,i)=>({index:i,text:s.text}))
      })
    });
    const raw = await response.text();
    let data;
    try { data = raw ? JSON.parse(raw) : null; }
    catch { throw new Error(`Server returned non-JSON response (HTTP ${response.status}): ${raw.slice(0,240) || "empty body"}`); }
    if (!response.ok) throw new Error(data?.error || `Request failed (HTTP ${response.status})`);
    if (!data || !Array.isArray(data.translations)) throw new Error("Server response is missing translations.");
    data.translations.forEach(item => {
      if (Number.isInteger(item.index) && subtitles[item.index] && typeof item.text === "string") subtitles[item.index].text = item.text;
    });
    renderSubtitles();
    setStatus("Translation completed.");
  } catch (error) {
    setStatus(error.message || "Translation failed.", true);
  } finally {
    button.disabled = false;
  }
});
$("exportBtn").addEventListener("click", () => {
  if (!subtitles.length) return setStatus("No subtitles to export.", true);
  const output = subtitles.map((s,i)=>`${i+1}\n${toSrtTime(s.start)} --> ${toSrtTime(s.end)}\n${s.text}`).join("\n\n") + "\n";
  const blob = new Blob([output],{type:"text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "translated-subtitles.srt"; a.click();
  URL.revokeObjectURL(url);
});