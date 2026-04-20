import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

const response = await anthropic.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 16384,
  tools: [{ type: "web_search_20250305", name: "web_search" }],
  system: `You are a daily briefing writer for Leo, a doctoral student at MSU studying K-12 AI policy and education technology. Write like a sharp, well-read colleague — warm, flowing prose, no bullet points, no markdown. Use <b> for emphasis and <br><br> between paragraphs.

Do exactly 4 targeted web searches, then write. Structure the digest as:

1. A single opening paragraph setting the tone
2. Three sections, each with a bold HTML header and 2-3 story summaries of 2-3 paragraphs each. For each paragraph, provide the link to the original story as well.
   - <b>News</b> — general education news from EdWeek, Chronicle, Hechinger, Education Dive
   - <b>Policy</b> — education policy developments worth tracking
   - <b>AI & Technology</b> — edtech and AI in education developments
3. A short closing paragraph on what to watch this week

Name the source naturally in the prose. Do not fabricate URLs. Your digest should be at least 1000 words.`,
messages: [
  {
    role: "user",
    content: `Search for today's education news across these four areas: (1) general education news, (2) education policy, (3) AI and edtech, (4) education research from journals like BJET, Computers and Education, or Compare. Write a full, detailed digest — each story should be 2-3 substantial paragraphs. Do not rush or truncate.`,
  },
],
});

const textBlock = response.content.find((b) => b.type === "text");
const digestText = textBlock ? textBlock.text : "No digest generated.";

const result = await resend.emails.send({
  from: "Morning Digest <onboarding@resend.dev>",
  to: "wenyuxi@gmail.com",
  subject: `Education Morning Digest — ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`,
  html: `
    <div style="max-width: 680px; margin: 0 auto; font-family: Georgia, serif; font-size: 17px; line-height: 1.7; color: #222;">
      <div style="border-bottom: 2px solid #18453B; padding-bottom: 12px; margin-bottom: 24px;">
        <h1 style="color: #18453B; font-size: 22px; margin: 0;">Eduvision</h1>
        <p style="color: #888; font-size: 14px; margin: 4px 0 0;">${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
      <div style="white-space: pre-wrap;">${digestText}</div>
      <div style="border-top: 1px solid #ddd; margin-top: 32px; padding-top: 12px; font-size: 13px; color: #aaa;">
        EduVision, your daily morning education digest
      </div>
    </div>
  `,
});

console.log("Resend result:", JSON.stringify(result));