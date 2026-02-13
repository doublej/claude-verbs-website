export interface VerbSet {
  name: string
  displayName: string
  description: string
  author: string
  github: string
  language: string
  category: string
  verbCount: number
  verbs: string[]
  createdAt: string
}

export interface Author {
  username: string
  avatarUrl: string
  name: string | null
  bio: string | null
  repos: AuthorRepo[]
}

export interface AuthorRepo {
  name: string
  description: string | null
  stars: number
  url: string
}

export type VerbSets = Record<string, VerbSet[]>
export type Authors = Record<string, Author>
