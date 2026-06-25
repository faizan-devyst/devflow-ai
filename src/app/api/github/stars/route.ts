import { NextResponse } from "next/server";

// Public repository whose stars/forks are shown on the landing page.
const REPO = "faizan-devyst/devflow-ai";

export async function GET() {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "devflow-ai" },
      // Cache the result for an hour so we don't hit GitHub's rate limit per visitor
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ stars: null, forks: null });
    }

    const data = (await res.json()) as { stargazers_count?: number; forks_count?: number };
    return NextResponse.json({
      stars: data.stargazers_count ?? null,
      forks: data.forks_count ?? null,
    });
  } catch {
    return NextResponse.json({ stars: null, forks: null });
  }
}
