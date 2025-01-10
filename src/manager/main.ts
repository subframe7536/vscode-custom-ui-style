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
    let patched = content.replaceAll(
      entry,
      `${entry},${JSON.stringify(config.electron).slice(1, -1)}`,
    )
    if ('backgroundColor' in config.electron) {
      patched = patched.replace(
        setBgColorRegex,
        `setBackgroundColor("${config.electron.backgroundColor}");`,
      )
    }
    return patched
  }
}
