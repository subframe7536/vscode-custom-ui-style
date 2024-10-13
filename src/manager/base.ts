import type { Promisable } from '@subframe7536/type-utils'
import { cpSync, existsSync } from 'node:fs'
import { readFileSync, writeFileSync } from 'atomically'
import { logger } from '../utils'

export interface FileManager {
  hasBakFile: boolean
  reload: (fontChanged: boolean) => Promise<void>
  rollback: () => Promise<void>
}

export abstract class BaseFileManager implements FileManager {
  constructor(
    private srcPath: string,
    private bakPath: string,
  ) {
    if (!this.hasBakFile) {
      cpSync(this.srcPath, this.bakPath)
      logger.info(`Create backup file [${this.bakPath}]`)
    }
  }

  get hasBakFile() {
    return existsSync(this.bakPath)
  }

  async reload(fontChanged: boolean) {
    if (!this.hasBakFile) {
      logger.warn(`Backup file [${this.bakPath}] does not exist, skip reload`)
    } else {
      const newContent = await this.patch(fontChanged, () => readFileSync(this.bakPath, 'utf-8'))
      if (newContent) {
        writeFileSync(this.srcPath, newContent)
        logger.info(`Config reload [${this.srcPath}]`)
      }
    }
  }

  async rollback() {
    if (!this.hasBakFile) {
      logger.warn(`Backup file [${this.bakPath}] does not exist, skip rollback`)
    } else {
      writeFileSync(this.srcPath, readFileSync(this.bakPath, 'utf-8'))
      logger.info(`Config rollback [${this.srcPath}]`)
    }
  }

  abstract patch(fontChanged: boolean, content: () => string): Promisable<string | undefined>
}
