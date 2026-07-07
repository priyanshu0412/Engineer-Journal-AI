"use server";

import "server-only";
import { requireUserId } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb/connect";
import { User } from "@/models/User";

export interface GithubRepo {
  fullName: string;   // e.g. "priyanshu0412/bionic-gym-v2"
  name: string;       // e.g. "bionic-gym-v2"
  private: boolean;
  updatedAt: string;
}

export interface GithubActivityItem {
  type: "commit" | "pr" | "issue";
  message: string;
}

/**
 * Verifies the provided GitHub token and returns the user's repos list.
 * Does NOT save anything — just validates + lists.
 */
export async function verifyAndFetchRepos(
  username: string,
  token: string,
): Promise<{ ok: true; repos: GithubRepo[] } | { ok: false; error: string }> {
  await requireUserId(); // Must be logged in

  if (!username.trim() || !token.trim()) {
    return { ok: false, error: "Username and token are required." };
  }

  try {
    // Verify token by hitting the authenticated user endpoint
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "EngineerJournalAI",
      },
      cache: "no-store",
    });

    if (!userRes.ok) {
      if (userRes.status === 401) {
        return { ok: false, error: "Invalid or expired token. Please generate a new PAT from GitHub." };
      }
      return { ok: false, error: `GitHub API error: ${userRes.status}` };
    }

    // Fetch all repos (public + private) — paginated, max 100 per page
    const repos: GithubRepo[] = [];
    let page = 1;

    while (true) {
      const reposRes = await fetch(
        `https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated&type=all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "User-Agent": "EngineerJournalAI",
          },
          cache: "no-store",
        },
      );

      if (!reposRes.ok) break;

      const data = await reposRes.json();
      if (!Array.isArray(data) || data.length === 0) break;

      for (const r of data) {
        repos.push({
          fullName: r.full_name as string,
          name: r.name as string,
          private: r.private as boolean,
          updatedAt: r.updated_at as string,
        });
      }

      // If less than 100 results, no more pages
      if (data.length < 100) break;
      page++;
    }

    return { ok: true, repos };
  } catch (err) {
    console.error("GitHub verify error:", err);
    return { ok: false, error: "Network error. Please check your connection." };
  }
}

/**
 * Returns the tracked repos saved for the current user (for the entry form dropdown).
 */
export async function getTrackedRepos(): Promise<string[]> {
  const clerkId = await requireUserId();
  await connectDB();

  const user = await User.findOne({ clerkId }).lean();
  return (user?.githubSelectedRepos as string[]) ?? [];
}

/**
 * Fetches GitHub commits, PRs, and issues for a SPECIFIC repo on a given date.
 * Used when the user selects a repo from the dropdown in the entry form.
 */
export async function fetchActivityForRepo(
  dateStr: string,
  repoFullName: string,
): Promise<string> {
  const clerkId = await requireUserId();
  await connectDB();

  const user = await User.findOne({ clerkId }).lean();
  if (!user?.githubToken || !user?.githubUsername) {
    return "GitHub Integration: Token not configured. Go to Settings → GitHub Integration.";
  }

  const { githubToken } = user;

  try {
    // GitHub Events API: fetch recent events for this specific repo
    const res = await fetch(
      `https://api.github.com/repos/${repoFullName}/events?per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "EngineerJournalAI",
        },
        next: { revalidate: 60 },
      },
    );

    if (!res.ok) {
      if (res.status === 401) return "GitHub Integration: Token invalid or expired. Update in Settings.";
      if (res.status === 404) return `GitHub Integration: Repo '${repoFullName}' not found or no access.`;
      if (res.status === 403) return "GitHub Integration: Rate limit exceeded. Try again in a few minutes.";
      return `GitHub Integration: API error ${res.status}.`;
    }

    const events = await res.json();
    if (!Array.isArray(events)) return "GitHub Integration: Unexpected API response.";

    // Filter events for the target date
    const items: string[] = [];

    for (const ev of events) {
      const eventDate = (ev.created_at as string)?.slice(0, 10);
      if (eventDate !== dateStr) continue;

      if (ev.type === "PushEvent" && ev.payload?.commits) {
        for (const c of ev.payload.commits) {
          if (c.message?.startsWith("Merge branch")) continue; // skip merge commits
          items.push(`- Commit: ${c.message}`);
        }
      } else if (ev.type === "PullRequestEvent" && ev.payload?.pull_request) {
        const action = ev.payload.action;
        const title = ev.payload.pull_request.title;
        items.push(`- PR ${action}: ${title}`);
      } else if (ev.type === "IssuesEvent" && ev.payload?.issue) {
        const action = ev.payload.action;
        const title = ev.payload.issue.title;
        items.push(`- Issue ${action}: ${title}`);
      }
    }

    const repoDisplayName = repoFullName.split("/")[1] || repoFullName;

    if (items.length === 0) {
      return `No GitHub activity found in '${repoDisplayName}' on ${dateStr}.\n(Commits may take a few minutes to appear in the API)`;
    }

    return `GitHub Activity — ${repoDisplayName} (${dateStr}):\n${items.join("\n")}`;
  } catch (err) {
    console.error("fetchActivityForRepo error:", err);
    return "GitHub Integration: Network error. Please check your connection.";
  }
}
