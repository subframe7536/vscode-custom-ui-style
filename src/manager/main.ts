import type { Promisable } from '@subframe7536/type-utils'
import { config } from '../config'
import { mainBakPath, mainPath } from '../path'
import { BaseFileManager } from './base'

const entry = 'experimentalDarkMode'

export class MainFileManager extends BaseFileManager {
  constructor() {
    super(mainPath, mainBakPath)
  }

  patch(_fontChanged: boolean, content: () => string): Promisable<string | undefined> {
    return content().replace(
      new RegExp(entry, 'g'),
      `${JSON.stringify(config.electron).slice(1, -1)},${entry}`,
    )
  }
}
