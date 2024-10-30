import type { Promisable } from '@subframe7536/type-utils'
import { config } from '../config'
import { mainBakPath, mainPath } from '../path'
import { BaseFileManager } from './base'

const entry = 'experimentalDarkMode:!0'

export class MainFileManager extends BaseFileManager {
  constructor() {
    super(mainPath, mainBakPath)
  }

  patch(content: string): Promisable<string> {
    return content.replaceAll(
      entry,
      `${entry},${JSON.stringify(config.electron).slice(1, -1)}`,
    )
  }
}
