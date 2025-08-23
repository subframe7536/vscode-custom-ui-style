import type { ConfigCache } from './cache'

import fs from 'node:fs'

import { cacheFilePath } from './cache'

function uninstall(srcPath: string, bakPath: string) {
  if (fs.existsSync(srcPath)) {
    fs.renameSync(bakPath, srcPath)
  }
}

try {
  const cache: ConfigCache = JSON.parse(fs.readFileSync(cacheFilePath, 'utf-8'))
  Promise.all(
    [...cache.builtin, ...cache.extension]
      .map(async ([src, bak]) => uninstall(src, bak)),
  )
} catch { }
