import type { Promisable } from '@subframe7536/type-utils'
import fs from 'node:fs'
import { readFileSync, writeFileSync } from 'atomically'
import { log } from '../utils'

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
      if (fs.existsSync(this.srcPath)) {
        fs.cpSync(this.srcPath, this.bakPath)
        log.info(`Create backup file [${this.bakPath}]`)
      } else {
        log.warn(`Source file ${this.srcPath} does not exists`)
      }
    }
  }

  get hasBakFile() {
    return fs.existsSync(this.bakPath)
  }

  async reload(fontChanged: boolean) {
    if (!this.hasBakFile) {
      log.warn(`Backup file [${this.bakPath}] does not exist, skip reload`)
    } else {
      const newContent = await this.patch(fontChanged, () => readFileSync(this.bakPath, 'utf-8'))
      if (newContent) {
        writeFileSync(this.srcPath, newContent)
        log.info(`Config reload [${this.srcPath}]`)
      }
    }
  }

  async rollback() {
    if (!this.hasBakFile) {
      log.warn(`Backup file [${this.bakPath}] does not exist, skip rollback`)
    } else {
      writeFileSync(this.srcPath, readFileSync(this.bakPath, 'utf-8'))
      log.info(`Config rollback [${this.srcPath}]`)
    }
  }

  abstract patch(fontChanged: boolean, content: () => string): Promisable<string | undefined>
}
