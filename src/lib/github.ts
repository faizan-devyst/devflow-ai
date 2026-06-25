const GITHUB_API = "https://api.github.com";

function githubHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "devflow-ai",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function githubError(status: number, what: string): string {
  if (status === 404) return "Repository not found or not accessible — check the URL and token";
  if (status === 401 || status === 403) {
    return "GitHub denied access — the token is invalid or the rate limit was hit";
  }
  return `GitHub API error ${status} while fetching ${what}`;
}

/** Accepts "owner/repo" or any github.com URL form. */
export function parseRepoInput(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim().replace(/\.git$/, "").replace(/\/+$/, "");
  const slug = trimmed.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (slug) return { owner: slug[1], repo: slug[2] };
  const url = trimmed.match(/github\.com[/:]([\w.-]+)\/([\w.-]+)/);
  if (url) return { owner: url[1], repo: url[2] };
  return null;
}

export async function getRepoMeta(
  owner: string,
  repo: string,
  token?: string
): Promise<{ defaultBranch: string }> {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: githubHeaders(token),
  });
  if (!res.ok) throw new Error(githubError(res.status, "repository"));
  const data = (await res.json()) as { default_branch?: string };
  return { defaultBranch: data.default_branch ?? "main" };
}

export interface TreeEntry {
  path: string;
  sha: string;
  size: number;
}

export async function getTree(
  owner: string,
  repo: string,
  branch: string,
  token?: string
): Promise<{ entries: TreeEntry[]; truncated: boolean }> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    { headers: githubHeaders(token) }
  );
  if (!res.ok) throw new Error(githubError(res.status, "file tree"));
  const data = (await res.json()) as {
    tree?: Array<{ path: string; type: string; sha: string; size?: number }>;
    truncated?: boolean;
  };
  const entries = (data.tree ?? [])
    .filter((node) => node.type === "blob")
    .map((node) => ({ path: node.path, sha: node.sha, size: node.size ?? 0 }));
  return { entries, truncated: Boolean(data.truncated) };
}

export async function getBlob(
  owner: string,
  repo: string,
  sha: string,
  token?: string
): Promise<string> {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/blobs/${sha}`, {
    headers: githubHeaders(token),
  });
  if (!res.ok) throw new Error(githubError(res.status, "file contents"));
  const data = (await res.json()) as { content?: string; encoding?: string };
  if (data.encoding === "base64" && data.content) {
    return Buffer.from(data.content, "base64").toString("utf-8");
  }
  return data.content ?? "";
}
