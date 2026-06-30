"use server";

import "server-only";
import { requireUserId } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb/connect";
import { User } from "@/models/User";
import { GoogleGenAI } from "@google/genai";

let _geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }
  _geminiClient ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return _geminiClient;
}

/**
 * Transcribes audio base64 payload using Gemini 2.5 flash multimodal capability.
 */
export async function transcribeAudio(
  base64Audio: string,
  mimeType: string,
): Promise<string> {
  await requireUserId(); // Check authentication
  
  try {
    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            data: base64Audio,
            mimeType: mimeType || "audio/webm",
          },
        },
        "Transcribe this audio standup note. Return ONLY the transcribed text. Do not summarize, do not translate, and do not add any comments or headers. If the user spoke in Hinglish or a mix of Hindi and English, keep the transcription in that exact Hinglish/Hindi/English format.",
      ],
    });
    
    return response.text?.trim() || "";
  } catch (err) {
    console.error("Transcription error:", err);
    throw new Error(err instanceof Error ? err.message : "Failed to transcribe audio.");
  }
}

/**
 * Fetches user's GitHub activity (commits, PRs) for the selected date.
 */
export async function fetchGithubActivity(dateStr: string): Promise<string> {
  const clerkId = await requireUserId();
  await connectDB();
  
  const user = await User.findOne({ clerkId }).lean();
  if (!user || !user.githubUsername || !user.githubToken) {
    return "GitHub Integration: Username and PAT not configured in Settings.";
  }
  
  const { githubUsername, githubToken } = user;
  
  try {
    // Fetch last 30 events from user
    const res = await fetch(`https://api.github.com/users/${githubUsername}/events`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "DevTrack-AI",
      },
      next: { revalidate: 60 }, // Cache events for 60 seconds
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        return "GitHub Integration: Invalid PAT token. Please update Settings.";
      }
      if (res.status === 404) {
        return `GitHub Integration: User '${githubUsername}' not found.`;
      }
      throw new Error(`GitHub API returned status ${res.status}`);
    }
    
    const events = await res.json();
    if (!Array.isArray(events)) {
      return "GitHub Integration: Unexpected API response format.";
    }
    
    // Target date formatting to match event dates (e.g. YYYY-MM-DD)
    const targetDate = dateStr; // Format: YYYY-MM-DD
    
    // Group events by repo
    const activities: Record<string, string[]> = {};
    
    for (const ev of events) {
      const eventDate = ev.created_at?.slice(0, 10); // get YYYY-MM-DD
      if (eventDate !== targetDate) continue;
      
      const repoName = ev.repo?.name || "Unknown Repo";
      if (!activities[repoName]) {
        activities[repoName] = [];
      }
      
      if (ev.type === "PushEvent" && ev.payload?.commits) {
        for (const c of ev.payload.commits) {
          // Skip merge commits or generic automatic messages
          if (c.message?.startsWith("Merge branch")) continue;
          activities[repoName].push(`Commit: ${c.message}`);
        }
      } else if (ev.type === "PullRequestEvent" && ev.payload?.pull_request) {
        const action = ev.payload.action; // opened, closed, merged
        const title = ev.payload.pull_request.title;
        activities[repoName].push(`PR ${action}: ${title}`);
      } else if (ev.type === "IssuesEvent" && ev.payload?.issue) {
        const action = ev.payload.action; // opened, closed
        const title = ev.payload.issue.title;
        activities[repoName].push(`Issue ${action}: ${title}`);
      }
    }
    
    // Format activities output
    const repos = Object.keys(activities);
    if (repos.length === 0) {
      return `No GitHub activity logged on ${targetDate}.`;
    }
    
    let resultStr = `GitHub Activity on ${targetDate}:\n`;
    for (const repo of repos) {
      // Remove username prefix from repo name for cleaner reading
      const repoDisplayName = repo.split("/")[1] || repo;
      const items = activities[repo];
      if (items.length === 0) continue;
      
      resultStr += `\n[${repoDisplayName}]\n`;
      for (const item of items) {
        resultStr += `- ${item}\n`;
      }
    }
    
    return resultStr.trim();
  } catch (err) {
    console.error("Github fetch error:", err);
    return "GitHub Integration: Failed to fetch recent activity. Verify network/token.";
  }
}
