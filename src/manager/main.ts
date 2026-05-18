import { config } from '../config'
import { mainBakPath, mainPath } from '../path'

import { BaseFileManager } from './base'

const entry = 'experimentalDarkMode:!0'
const setBgColorRegex = /setBackgroundColor\([\w.]+\);/g

export class MainFileManager extends BaseFileManager {
  constructor() {
    super(mainPath, mainBakPath)
  }

  patch(content: string): string {
    const result = JSON.stringify(config.electron).slice(1, -1)
    if (result) {
      content = content.replaceAll(entry, `${entry},${result}`)
      if ('backgroundColor' in config.electron) {
        content = content.replace(
          setBgColorRegex,
          `setBackgroundColor("${config.electron.backgroundColor}");`,
        )
      }
    }
    return content
  }
}
