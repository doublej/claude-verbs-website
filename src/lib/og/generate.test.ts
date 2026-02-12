import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { generateSetOgImages, listSetDefinitionFiles } from './generate'

interface TestPaths {
  root: string
  dataDir: string
  outputDir: string
  defaultImagePath: string
}

function makeSet(name: string, description = `${name} themed verbs`) {
  return {
    name,
    displayName: name.toUpperCase(),
    description,
    author: 'JJ',
    github: 'doublej',
    language: 'en_US',
    category: 'entertainment',
    config: {
      spinnerVerbs: {
        mode: 'replace',
        verbs: Array.from({ length: 50 }, (_, index) => `I verb ${index}`),
      },
    },
  }
}

async function setupTempPaths(): Promise<TestPaths> {
  const cleanRoot = await mkdtemp(path.join(tmpdir(), 'claude-verbs-og-'))
  const dataDir = path.join(cleanRoot, 'sets')
  const outputDir = path.join(cleanRoot, 'out')
  const defaultImagePath = path.join(cleanRoot, 'default.png')

  await mkdir(dataDir, { recursive: true })
  await mkdir(outputDir, { recursive: true })
  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: '#101418',
    },
  })
    .png()
    .toFile(defaultImagePath)

  return { root: cleanRoot, dataDir, outputDir, defaultImagePath }
}

let paths: TestPaths

beforeEach(async () => {
  paths = await setupTempPaths()
})

afterEach(async () => {
  await rm(paths.root, { recursive: true, force: true })
})

describe('listSetDefinitionFiles', () => {
  it('filters out schema/index/template files', async () => {
    await writeFile(path.join(paths.dataDir, 'alpha.json'), JSON.stringify(makeSet('alpha')))
    await writeFile(path.join(paths.dataDir, 'beta.json'), JSON.stringify(makeSet('beta')))
    await writeFile(path.join(paths.dataDir, 'schema.json'), '{}')
    await writeFile(path.join(paths.dataDir, 'index.json'), '{}')
    await writeFile(path.join(paths.dataDir, '_template.json'), '{}')

    const files = await listSetDefinitionFiles(paths.dataDir)
    const names = files.map((filePath) => path.basename(filePath))

    expect(names).toEqual(['alpha.json', 'beta.json'])
  })
})

describe('generateSetOgImages', () => {
  it('writes one image per set and removes stale png files', async () => {
    await writeFile(path.join(paths.dataDir, 'alpha.json'), JSON.stringify(makeSet('alpha')))
    await writeFile(path.join(paths.dataDir, 'beta.json'), JSON.stringify(makeSet('beta')))
    await writeFile(path.join(paths.outputDir, 'stale.png'), 'stale')
    await writeFile(path.join(paths.outputDir, '.gitkeep'), '')

    const result = await generateSetOgImages({
      dataDir: paths.dataDir,
      outputDir: paths.outputDir,
      defaultImagePath: paths.defaultImagePath,
    })

    expect(result.setCount).toBe(2)
    const generatedNames = result.generatedFiles
      .map((filePath) => path.basename(filePath))
      .sort((a, b) => a.localeCompare(b))

    expect(generatedNames).toEqual(['alpha.png', 'beta.png'])

    const alphaPng = await readFile(path.join(paths.outputDir, 'alpha.png'))
    const pngHeader = [...alphaPng.subarray(0, 8)]
    expect(pngHeader).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

    await expect(access(path.join(paths.outputDir, 'stale.png'))).rejects.toThrow()
    await expect(access(path.join(paths.outputDir, '.gitkeep'))).resolves.toBeUndefined()
  })

  it('fails on duplicate set names', async () => {
    await writeFile(path.join(paths.dataDir, 'one.json'), JSON.stringify(makeSet('duplicate')))
    await writeFile(path.join(paths.dataDir, 'two.json'), JSON.stringify(makeSet('duplicate')))

    await expect(
      generateSetOgImages({
        dataDir: paths.dataDir,
        outputDir: paths.outputDir,
        defaultImagePath: paths.defaultImagePath,
      }),
    ).rejects.toThrow('Duplicate set name "duplicate"')
  })

  it('fails on malformed verb arrays', async () => {
    const malformed = makeSet('broken')
    malformed.config.spinnerVerbs.verbs[10] = '' as unknown as string
    await writeFile(path.join(paths.dataDir, 'broken.json'), JSON.stringify(malformed))

    await expect(
      generateSetOgImages({
        dataDir: paths.dataDir,
        outputDir: paths.outputDir,
        defaultImagePath: paths.defaultImagePath,
      }),
    ).rejects.toThrow('empty verb found')
  })
})
