import type { Promisable } from '@subframe7536/type-utils'
import { config } from '../config'
import { mainBakPath, mainPath } from '../path'
import { BaseFileManager } from './base'

const defaultBackgroundColor = 'r.getBackgroundColor()'
const entry = `backgroundColor:${defaultBackgroundColor}`

export class MainFileManager extends BaseFileManager {
  constructor() {
    super(mainPath, mainBakPath)
  }

  patch(_fontChanged: boolean, content: () => string): Promisable<string | undefined> {
    const backgroundColor = config.electron.backgroundColor || defaultBackgroundColor
    return content().replace(
      entry,
      `${JSON.stringify(config.electron).slice(1, -1)},backgroundColor:${backgroundColor}`,
    )
  }
}
