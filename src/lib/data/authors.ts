/**
 * Build-time script to fetch GitHub author data.
 * Run: just fetch-authors
 *
 * Reads all verb set JSON files from the claude-verbs submodule,
 * uses authorInfo from set files when available, and falls back
 * to the GitHub API for the rest.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Author, AuthorRepo, Authors } from './types'

const SETS_DIR = resolve(import.meta.dirname, 'claude-verbs/sets')
const API = 'https://api.github.com'
const SKIP = new Set(['schema.json', 'index.json', '_template.json'])

interface SetAuthorProject {
	name: string
	url: string
	description: string
}

interface SetAuthorInfo {
	description: string
	projects: SetAuthorProject[]
}

interface SetJson {
	github: string
	authorInfo?: SetAuthorInfo
}

function readSets(): SetJson[] {
	return readdirSync(SETS_DIR)
		.filter((f) => f.endsWith('.json') && !SKIP.has(f))
		.map((f) => JSON.parse(readFileSync(resolve(SETS_DIR, f), 'utf-8')))
}

function toRepos(projects: SetAuthorProject[]): AuthorRepo[] {
	return projects.map((p) => ({
		name: p.name,
		description: p.description,
		stars: 0,
		url: p.url,
	}))
}

async function fetchFromGitHub(username: string): Promise<Author> {
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

	return { username, avatarUrl: u.avatar_url ?? '', name: u.name ?? null, bio: u.bio ?? null, repos }
}

async function buildAuthor(username: string, info: SetAuthorInfo | undefined): Promise<Author> {
	const base = await fetchFromGitHub(username)
	if (!info) return base
	return { ...base, bio: info.description, repos: toRepos(info.projects) }
}

async function main() {
	const sets = readSets()
	const byUsername = new Map<string, SetAuthorInfo | undefined>()
	for (const set of sets) {
		if (!set.github) continue
		if (!byUsername.has(set.github) || set.authorInfo) {
			byUsername.set(set.github, set.authorInfo)
		}
	}

	const authors: Authors = {}
	for (const [username, info] of byUsername) {
		console.log(`Fetching ${username}...${info ? ' (with authorInfo overlay)' : ''}`)
		authors[username] = await buildAuthor(username, info)
	}

	const outPath = resolve(import.meta.dirname, 'authors.json')
	writeFileSync(outPath, `${JSON.stringify(authors, null, 2)}\n`)
	console.log(`Wrote ${Object.keys(authors).length} authors to authors.json`)
}

main().catch(console.error)
