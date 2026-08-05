import { readFileSync } from 'fs';
import { join } from 'path';

const GITHUB_API = 'https://api.github.com';

function getConfig() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  if (!token || !owner || !repo) {
    throw new Error('Missing GITHUB_TOKEN, GITHUB_OWNER, or GITHUB_REPO env vars');
  }
  return { token, owner, repo };
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'affiliate-website',
  };
}

// Read a JSON file from GitHub repo
export async function ghReadJSON<T>(filePath: string): Promise<{ data: T; sha: string }> {
  const { token, owner, repo } = getConfig();
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`, {
    headers: headers(token),
  });
  if (!res.ok) throw new Error(`Failed to read ${filePath}: ${res.status}`);
  const file = await res.json();
  const data = JSON.parse(Buffer.from(file.content, 'base64').toString('utf-8')) as T;
  return { data, sha: file.sha };
}

// Write a JSON file to GitHub repo (create or update)
export async function ghWriteJSON(filePath: string, data: unknown, sha?: string, message?: string): Promise<void> {
  const { token, owner, repo } = getConfig();
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

  const body: Record<string, unknown> = {
    message: message || `Update ${filePath}`,
    content,
  };
  if (sha) body.sha = sha;

  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to write ${filePath}: ${res.status} - ${err}`);
  }
}

// Helper: read-modify-write pattern for a JSON file
export async function ghUpdateJSON<T>(
  filePath: string,
  modifier: (data: T) => T,
  commitMessage?: string
): Promise<void> {
  const { data, sha } = await ghReadJSON<T>(filePath);
  const updated = modifier(data);
  await ghWriteJSON(filePath, updated, sha, commitMessage);
}

// Read local JSON file (for build-time / local dev reads)
export function readLocalJSON<T>(filePath: string): T {
  const full = join(process.cwd(), 'data', filePath.replace('data/', ''));
  return JSON.parse(readFileSync(full, 'utf-8')) as T;
}
