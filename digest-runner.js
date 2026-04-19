import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

const response = await anthropic.messages.create({
  model: "claude-sonnet-4-5",
  max_tokens: 2048,
  tools: [{ type: "web_search_20250305", name: "web_search" }],
  system: `You are an education research assistant writing a daily morning digest for Leo, a doctoral student at Michigan State University studying K-12 AI policy and education technology.

Write in a warm, narrative style — like a knowledgeable colleague summarizing what's worth reading today. No bullet points. No excessive headers. Just well-written paragraphs that flow naturally, as if written by a thoughtful person over coffee.

Cover these areas:
- K-12 AI policy and edtech news
- Higher education policy and trends
- Education research from top journals (AERA, Teachers College Record, American Educational Research Journal)
- Notable pieces from Education Week, Chronicle of Higher Education, Hechinger Report, Education Dive
- Any relevant policy developments from federal or state level

Structure the digest as follows:
1. A brief 2-3 sentence opening that sets the tone for the day
2. 4-6 substantive story summaries, each 2-3 paragraphs, written narratively
3. A short closing note on what to watch in the coming days

Always include the source name naturally in the prose. Do not fabricate URLs. If you reference a specific article, name it and the outlet, but do not make up a link.`,
  messages: [
    {
      role: "user",
      content: `Search for the latest education news and research from today and the past 48 hours. Focus on K-12 AI policy, edtech, higher education policy, and education research. Write the morning digest now.`,
    },
  ],
});

const textBlock = response.content.find((b) => b.type === "text");
const digestText = textBlock ? textBlock.text : "No digest generated.";

await resend.emails.send({
  from: "Morning Digest <onboarding@resend.dev>",
  to: "wenyuxi@msu.edu",
  subject: `Education Morning Digest — ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`,
  html: `
    <div style="max-width: 680px; margin: 0 auto; font-family: Georgia, serif; font-size: 17px; line-height: 1.7; color: #222;">
      <div style="border-bottom: 2px solid #18453B; padding-bottom: 12px; margin-bottom: 24px;">
        <h1 style="color: #18453B; font-size: 22px; margin: 0;">Education Morning Digest</h1>
        <p style="color: #888; font-size: 14px; margin: 4px 0 0;">${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
      <div style="white-space: pre-wrap;">${digestText}</div>
      <div style="border-top: 1px solid #ddd; margin-top: 32px; padding-top: 12px; font-size: 13px; color: #aaa;">
        Delivered by your Morning Digest · Michigan State University
      </div>
    </div>
  `,
});

console.log("Digest sent successfully.");