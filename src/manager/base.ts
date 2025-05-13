import type { Promisable } from '@subframe7536/type-utils'

import fs from 'node:fs'

import { readFileSync, writeFileSync } from 'atomically'

import { log } from '../logger'

export interface FileManager {
  hasBakFile: boolean
  reload: () => Promise<void>
  rollback: () => Promise<void>
}

export abstract class BaseFileManager implements FileManager {
  constructor(
    private srcPath: string,
    private bakPath: string,
  ) { }

  get hasBakFile() {
    return fs.existsSync(this.bakPath)
  }

  async reload() {
    if (!this.hasBakFile) {
      log.warn(`Backup file [${this.bakPath}] does not exist, backuping...`)
      fs.cpSync(this.srcPath, this.bakPath)
      log.info(`Create backup file [${this.bakPath}]`)
    }
    const newContent = await this.patch(readFileSync(this.bakPath, 'utf-8'))
    writeFileSync(this.srcPath, newContent)
    log.info(`Config reload [${this.srcPath}]`)
  }

  async rollback() {
    if (!this.hasBakFile) {
      log.warn(`Backup file [${this.bakPath}] does not exist, skip rollback`)
    } else {
      writeFileSync(this.srcPath, readFileSync(this.bakPath, 'utf-8'))
      log.info(`Config rollback [${this.srcPath}]`)
    }
  }

  abstract patch(content: string): Promisable<string>
}
