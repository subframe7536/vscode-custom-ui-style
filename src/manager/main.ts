import type { Promisable } from '@subframe7536/type-utils'
import { config } from '../config'
import { mainBakPath, mainPath } from '../path'
import { BaseFileManager } from './base'

const entry = 'backgroundColor:r.getBackgroundColor()'

export class MainFileManager extends BaseFileManager {
  constructor() {
    super(mainPath, mainBakPath)
  }

  patch(content: string): Promisable<string> {
    config.electron.backgroundColor ??= 'r.getBackgroundColor()'
    return content.replace(
      entry,
      JSON.stringify(config.electron).slice(1, -1),
    )
  }
}
