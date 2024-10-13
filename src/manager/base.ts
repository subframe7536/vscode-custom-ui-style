import type { Promisable } from '@subframe7536/type-utils'
import { cpSync, existsSync } from 'node:fs'
import { readFileSync, writeFileSync } from 'atomically'
import { logger } from '../utils'

export interface FileManager {
  hasBakFile: boolean
  reload: () => Promise<void>
  rollback: () => Promise<void>
}

export abstract class BaseFileManager implements FileManager {
  constructor(
    private srcPath: string,
    private bakPath: string,
  ) {
    if (!this.hasBakFile) {
      cpSync(this.srcPath, this.bakPath)
      logger.info('Create', this.bakPath)
    }
  }

  get hasBakFile() {
    return existsSync(this.bakPath)
  }

  async reload() {
    if (!this.hasBakFile) {
      logger.warn(`bak file [${this.bakPath}] does not exist, skip reload`)
    } else {
      writeFileSync(this.srcPath, await this.patch(readFileSync(this.bakPath, 'utf-8')))
      logger.info(`Config reload [${this.srcPath}]`)
    }
  }

  async rollback() {
    if (!this.hasBakFile) {
      logger.warn(`bak file [${this.bakPath}] does not exist, skip rollback`)
    } else {
      const originJS = readFileSync(this.bakPath, 'utf-8')
      writeFileSync(this.srcPath, originJS)
      logger.info(`Config rollback [${this.srcPath}]`)
    }
  }

  abstract patch(content: string): Promisable<string>
}
