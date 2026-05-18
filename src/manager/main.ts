import { config } from '../config'
import { mainBakPath, mainPath } from '../path'

import { BaseFileManager } from './base'

const entry = 'experimentalDarkMode:!0'
const setBgColorRegex = /setBackgroundColor\([\w.]+\);/g

export function patchMainScript(content: string, options: Record<string, unknown>): string {
  const result = JSON.stringify(options).slice(1, -1)
  if (!result) {
    return content
  }

  content = content.replaceAll(entry, `${entry},${result}`)
  if ('backgroundColor' in options) {
    content = content.replace(setBgColorRegex, `setBackgroundColor("${options.backgroundColor}");`)
  }
  return content
}

export class MainFileManager extends BaseFileManager {
  constructor() {
    super(mainPath, mainBakPath)
  }

  patch(content: string): string {
    return patchMainScript(content, config.electron)
  }
}
