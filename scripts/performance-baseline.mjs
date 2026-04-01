import fs from 'node:fs/promises'
import path from 'node:path'

const mode = process.argv[2]
const rootDir = process.cwd()

const targetPath =
  mode === 'reanalysis'
    ? path.join(
        rootDir,
        'docs/superpowers/reports/2026-04-01-myfinance-performance-reanalysis.md',
      )
    : path.join(
        rootDir,
        'docs/superpowers/reports/2026-04-01-myfinance-performance-baseline.md',
      )

const stamp = `- updated_at: ${new Date().toISOString()}\n`

await fs.mkdir(path.dirname(targetPath), { recursive: true })
await fs.appendFile(targetPath, `\n## Execução automática\n${stamp}`)
