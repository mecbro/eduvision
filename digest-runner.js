import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

// Step 1: Search and gather notes
console.log("Step 1: Searching for today's education news...");
const searchResponse = await anthropic.messages.create({
  model: "claude-sonnet-4-5",
  max_tokens: 4096,
  tools: [{ type: "web_search_20250305", name: "web_search" }],
  system: `You are a research assistant. Search for today's education news and return detailed raw notes. Do exactly 4 searches:
1. General education news (EdWeek, Chronicle, Hechinger, Education Dive)
2. Education policy developments
3. AI and edtech in education
4. Recent education research from journals like BJET, Computers and Education, Compare

For each search, return detailed notes on what you found — outlet name, story summary, key facts, and the URL if available. Return notes only, no prose writing.`,
  messages: [
    {
      role: "user",
      content: "Search for today's education news across all four areas and return your raw research notes.",
    },
  ],
});

const notesBlock = searchResponse.content.find((b) => b.type === "text");
const researchNotes = notesBlock ? notesBlock.text : "";
console.log("Step 1 complete. Notes length:", researchNotes.length);

// Step 2: Write the digest from the notes
console.log("Step 2: Writing the digest...");
const digestResponse = await anthropic.messages.create({
  model: "claude-sonnet-4-5",
  max_tokens: 8192,
  system: `You are a daily briefing writer for Leo, a doctoral student at MSU studying K-12 AI policy and education technology. Write like a sharp, well-read colleague — warm, flowing prose. Use <b> for emphasis and <br><br> between paragraphs.

Structure the digest as:
1. An opening paragraph setting the tone, addressing Leo by name
2. Three sections with bold HTML headers:
   <b>News</b> — general education news
   <b>Policy</b> — education policy developments
   <b>AI & Technology</b> — AI and edtech developments
   Each section should have 2-3 stories, each 2-3 substantial paragraphs long.
3. A closing paragraph on what to watch this week

Name sources naturally in prose. Include URLs from the research notes at the end of each story as a plain HTML link like <a href="URL">Read more</a>. Do not fabricate URLs — only use ones from the notes. Write at least 1000 words total.`,
  messages: [
    {
      role: "user",
      content: `Here are today's research notes. Write a full, detailed morning digest from them — do not truncate, do not rush. Every section should be substantial.\n\n${researchNotes}`,
    },
  ],
});

const textBlock = digestResponse.content.find((b) => b.type === "text");
const digestText = textBlock ? textBlock.text : "No digest generated.";
console.log("Step 2 complete. Digest length:", digestText.length);

// Step 3: Send the email
const result = await resend.emails.send({
  from: "EduVision <onboarding@resend.dev>",
  to: "wenyuxi@gmail.com",
  subject: `EduVision — ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`,
  html: `
    <div style="max-width: 680px; margin: 0 auto; font-family: Georgia, serif; font-size: 17px; line-height: 1.8; color: #222;">
      <div style="border-bottom: 2px solid #18453B; padding-bottom: 12px; margin-bottom: 24px;">
        <h1 style="color: #18453B; font-size: 24px; margin: 0;">EduVision</h1>
        <p style="color: #888; font-size: 14px; margin: 4px 0 0;">${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
      <div>${digestText}</div>
      <div style="border-top: 1px solid #ddd; margin-top: 32px; padding-top: 12px; font-size: 13px; color: #aaa;">
        EduVision · your daily morning education digest
      </div>
    </div>
  `,
});

console.log("Resend result:", JSON.stringify(result));