/**
 * Build-time script to fetch GitHub author data.
 * Run: just fetch-authors
 *
 * Reads all unique github usernames from verb set JSON files,
 * fetches their GitHub profiles, and writes authors.json.
 */
import { writeFileSync } from 'node:fs'
import { loadSets } from './sets'
import type { Author, Authors } from './types'

const API = 'https://api.github.com'

async function fetchAuthor(username: string): Promise<Author> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
  const token = process.env.GITHUB_TOKEN
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API}/users/${username}`, { headers })
  if (!res.ok) {
    console.warn(`Failed to fetch ${username}: ${res.status}`)
    return { username, avatarUrl: '', name: null, bio: null, repos: [] }
  }
  const u = await res.json()

  const reposRes = await fetch(`${API}/users/${username}/repos?sort=stars&per_page=3`, { headers })
  const repos = reposRes.ok
    ? (await reposRes.json()).map((r: Record<string, unknown>) => ({
        name: r.name as string,
        description: (r.description as string) || null,
        stars: r.stargazers_count as number,
        url: r.html_url as string,
      }))
    : []

  return {
    username,
    avatarUrl: u.avatar_url ?? '',
    name: u.name ?? null,
    bio: u.bio ?? null,
    repos,
  }
}

async function main() {
  const sets = loadSets()
  const usernames = new Set<string>()
  for (const group of Object.values(sets)) {
    for (const set of group) {
      if (set.github) usernames.add(set.github)
    }
  }

  const authors: Authors = {}
  for (const username of usernames) {
    console.log(`Fetching ${username}...`)
    authors[username] = await fetchAuthor(username)
  }

  const outPath = new URL('./authors.json', import.meta.url).pathname
  writeFileSync(outPath, `${JSON.stringify(authors, null, 2)}\n`)
  console.log(`Wrote ${Object.keys(authors).length} authors to authors.json`)
}

main().catch(console.error)
