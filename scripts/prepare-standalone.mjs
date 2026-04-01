import { cp, mkdir, stat } from 'node:fs/promises'
import path from 'node:path'

const rootDir = process.cwd()
const standaloneDir = path.join(rootDir, '.next', 'standalone')

async function pathExists(targetPath) {
  try {
    await stat(targetPath)
    return true
  } catch {
    return false
  }
}

async function copyIfPresent(sourcePath, destinationPath) {
  if (!(await pathExists(sourcePath))) {
    return
  }

  await mkdir(path.dirname(destinationPath), { recursive: true })
  await cp(sourcePath, destinationPath, { recursive: true, force: true })
}

await copyIfPresent(
  path.join(rootDir, '.next', 'static'),
  path.join(standaloneDir, '.next', 'static'),
)

await copyIfPresent(
  path.join(rootDir, 'public'),
  path.join(standaloneDir, 'public'),
)
