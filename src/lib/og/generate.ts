import { mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { buildSetOgSvg } from './template'

const IGNORED_SET_FILES = new Set(['schema.json', 'index.json', '_template.json', 'package.json', 'bun.lock'])
const DEFAULT_DATA_DIR = fileURLToPath(new URL('../data/sets/', import.meta.url))
const DEFAULT_OUTPUT_DIR = fileURLToPath(new URL('../../../static/og/sets/', import.meta.url))
const DEFAULT_IMAGE_PATH = fileURLToPath(new URL('../../../static/og/default.png', import.meta.url))

interface RawSetJson {
  name?: unknown
  displayName?: unknown
  description?: unknown
  author?: unknown
  language?: unknown
  category?: unknown
  config?: {
    spinnerVerbs?: {
      verbs?: unknown
    }
  }
}

export interface SetDefinition {
  name: string
  displayName: string
  description: string
  author: string
  language: string
  category: string
  verbCount: number
}

export interface GenerateSetOgImagesOptions {
  dataDir?: string
  outputDir?: string
  defaultImagePath?: string
}

export interface GenerateSetOgImagesResult {
  outputDir: string
  generatedFiles: string[]
  setCount: number
}

function asString(value: unknown, field: string, filePath: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Invalid ${field} in ${filePath}: expected string`)
  }

  const trimmed = value.trim()
  if (trimmed.length === 0) {
    throw new Error(`Invalid ${field} in ${filePath}: cannot be empty`)
  }

  return trimmed
}

function asVerbCount(value: unknown, filePath: string): number {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid config.spinnerVerbs.verbs in ${filePath}: expected array`)
  }

  for (const verb of value) {
    if (typeof verb !== 'string') {
      throw new Error(`Invalid config.spinnerVerbs.verbs in ${filePath}: expected string items`)
    }
    if (!verb.trim()) {
      throw new Error(`Invalid config.spinnerVerbs.verbs in ${filePath}: empty verb found`)
    }
  }

  return value.length
}

function isSetDefinitionFile(fileName: string): boolean {
  if (!fileName.endsWith('.json')) return false
  return !IGNORED_SET_FILES.has(fileName)
}

export async function listSetDefinitionFiles(dataDir: string): Promise<string[]> {
  const entries = await readdir(dataDir, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter(isSetDefinitionFile)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => path.join(dataDir, name))
}

function parseSetDefinition(raw: RawSetJson, filePath: string): SetDefinition {
  const name = asString(raw.name, 'name', filePath)
  const displayNameRaw = typeof raw.displayName === 'string' ? raw.displayName : name
  const displayName = asString(displayNameRaw, 'displayName', filePath)

  return {
    name,
    displayName,
    description: asString(raw.description, 'description', filePath),
    author: asString(raw.author, 'author', filePath),
    language: asString(raw.language, 'language', filePath),
    category: typeof raw.category === 'string' && raw.category.trim() ? raw.category : 'original',
    verbCount: asVerbCount(raw.config?.spinnerVerbs?.verbs, filePath),
  }
}

export async function loadSetDefinitions(dataDir: string): Promise<SetDefinition[]> {
  const files = await listSetDefinitionFiles(dataDir)
  const sets: SetDefinition[] = []
  const seen = new Set<string>()

  for (const filePath of files) {
    const source = await readFile(filePath, 'utf8')
    let parsed: RawSetJson
    try {
      parsed = JSON.parse(source) as RawSetJson
    } catch {
      throw new Error(`Invalid JSON in ${filePath}`)
    }

    const set = parseSetDefinition(parsed, filePath)
    if (seen.has(set.name)) {
      throw new Error(`Duplicate set name "${set.name}" in ${filePath}`)
    }

    seen.add(set.name)
    sets.push(set)
  }

  return sets
}

async function clearGeneratedImages(outputDir: string): Promise<void> {
  await mkdir(outputDir, { recursive: true })
  const entries = await readdir(outputDir, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isFile()) continue
    if (!entry.name.endsWith('.png')) continue
    await unlink(path.join(outputDir, entry.name))
  }
}

async function ensureDefaultImageExists(defaultImagePath: string): Promise<void> {
  try {
    await stat(defaultImagePath)
  } catch {
    throw new Error(`Missing default OG image at ${defaultImagePath}`)
  }
}

async function renderSetImage(outputDir: string, set: SetDefinition): Promise<string> {
  const imagePath = path.join(outputDir, `${set.name}.png`)
  const svg = buildSetOgSvg({
    displayName: set.displayName,
    description: set.description,
    author: set.author,
    language: set.language,
    category: set.category,
    verbCount: set.verbCount,
  })

  await sharp(Buffer.from(svg)).png({ compressionLevel: 9, quality: 92 }).toFile(imagePath)
  return imagePath
}

export async function generateSetOgImages(
  options: GenerateSetOgImagesOptions = {},
): Promise<GenerateSetOgImagesResult> {
  const dataDir = options.dataDir ?? DEFAULT_DATA_DIR
  const outputDir = options.outputDir ?? DEFAULT_OUTPUT_DIR
  const defaultImagePath = options.defaultImagePath ?? DEFAULT_IMAGE_PATH

  await ensureDefaultImageExists(defaultImagePath)
  const sets = await loadSetDefinitions(dataDir)
  await clearGeneratedImages(outputDir)

  const generatedFiles: string[] = []
  for (const set of sets) {
    const filePath = await renderSetImage(outputDir, set)
    generatedFiles.push(filePath)
  }

  const manifestPath = path.join(outputDir, '.generated.json')
  await writeFile(
    manifestPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        setCount: sets.length,
        files: generatedFiles.map((filePath) => path.basename(filePath)),
      },
      null,
      2,
    )}\n`,
  )

  return {
    outputDir,
    generatedFiles,
    setCount: sets.length,
  }
}

async function main() {
  const result = await generateSetOgImages()
  console.log(`Generated ${result.setCount} OG images in ${result.outputDir}`)
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
}
