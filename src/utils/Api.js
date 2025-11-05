/**
 * Analyzes an image of a waste item using Gemini,
 * then fetches *recent real YouTube upcycling videos* for that item.
 * 
 * ✅ Gemini identifies the item
 * ✅ YouTube API returns recent, embeddable videos
 * ✅ Returns clean JSON with no markdown
 */

export const fetchImageAnalysis = async (base64ImageData, mimeType) => {
  // ⚠️ Replace with your own API keys
  const GEMINI_API_KEY = import.meta.env.VITE_APIKEY_GOOGLE;
  const YOUTUBE_API_KEY = import.meta.env.VITE_API_YOUTUBE;

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  // --- Step 1: Ask Gemini to identify the waste item ---
  const identifyPrompt = `
Analyze this image and identify the waste item shown.
Respond ONLY in raw JSON like:
{"itemName": "plastic bottle"}
Do not include any code fences, markdown, or explanations.
`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: identifyPrompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64ImageData,
            },
          },
        ],
      },
    ],
  };

  // --- Gemini API Call ---
  const geminiResponse = await fetch(geminiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!geminiResponse.ok) {
    const errText = await geminiResponse.text();
    throw new Error(`Gemini API failed: ${errText}`);
  }

  const geminiResult = await geminiResponse.json();
  let rawText = geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

  // --- Clean up possible markdown wrappers ---
  rawText = rawText.replace(/```json\s*/gi, "").replace(/```/g, "").trim();

  let itemName;
  try {
    const parsed = JSON.parse(rawText);
    itemName = parsed.itemName;
  } catch (err) {
    console.error("Gemini output parsing failed:", rawText);
    throw new Error("Failed to parse Gemini JSON response.");
  }

  if (!itemName) throw new Error("Could not identify the waste item.");

  // --- Step 2: Fetch latest YouTube videos ---
  const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=upcycling+${encodeURIComponent(
    itemName
  )}&order=date&videoEmbeddable=true&key=${YOUTUBE_API_KEY}`;

  const ytResponse = await fetch(youtubeUrl);
  if (!ytResponse.ok) throw new Error("YouTube API failed");

  const ytData = await ytResponse.json();
  if (!ytData.items || ytData.items.length === 0)
    throw new Error("No YouTube videos found for this item.");

  // --- Format videos cleanly ---
  const videoSuggestions = ytData.items.map((video) => ({
    title: video.snippet.title,
    channel: video.snippet.channelTitle,
    description: video.snippet.description
      ? video.snippet.description.slice(0, 200)
      : "Upcycling tutorial video.",
    embedUrl: `https://www.youtube.com/embed/${video.id.videoId}`,
  }));

  // --- Final JSON ---
  return {
    itemName,
    videoSuggestions,
  };
};
