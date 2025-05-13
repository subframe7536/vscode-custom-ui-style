import { createHash } from 'node:crypto'
import path from 'node:path'

import { readFileSync } from 'atomically'

import { baseDir, productJSONBakPath, productJSONPath } from '../path'
import { BaseFileManager } from './base'

// https://github.com/RimuruChan/vscode-fix-checksums/blob/master/src/extension.js#L75-L81
function computeChecksum(file: string) {
  return createHash('sha256')
    .update(readFileSync(file))
    .digest('base64')
    .replace(/=+$/, '')
}

export class JsonFileManager extends BaseFileManager {
  constructor() {
    super(productJSONPath, productJSONBakPath)
  }

  patch(content: string): string {
    // https://github.com/RimuruChan/vscode-fix-checksums/blob/master/src/extension.js#L30-L58
    const product: { checksums: Record<string, string> } = JSON.parse(content)
    for (const [filePath, curChecksum] of Object.entries(product.checksums)) {
      const checksum = computeChecksum(path.join(baseDir, filePath))
      if (checksum !== curChecksum) {
        product.checksums[filePath] = checksum
      }
    }
    return JSON.stringify(product, null, '\t')
  }
}
