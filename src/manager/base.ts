import type { Promisable } from '@subframe7536/type-utils'

import fs from 'node:fs'

import { readFileSync, writeFileSync } from 'atomically'

import { log } from '../logger'
import { promptWarn } from '../utils'

export interface FileManager {
  hasBakFile: boolean
  reload: () => Promise<void>
  rollback: () => Promise<void>
  skipAll?: () => Promisable<string | false | undefined>
}

export abstract class BaseFileManager implements FileManager {
  constructor(
    private srcPath: string,
    private bakPath: string,
  ) { }

  get hasBakFile() {
    return fs.existsSync(this.bakPath)
  }

  skipAll?: (() => Promisable<string | undefined | false>) | undefined

  async reload() {
    await this.skipable(async () => {
      if (!this.hasBakFile) {
        log.warn(`Backup file [${this.bakPath}] does not exist, backuping...`)
        fs.cpSync(this.srcPath, this.bakPath)
        log.info(`Create backup file [${this.bakPath}]`)
      }
      const newContent = await this.patch(readFileSync(this.bakPath, 'utf-8'))
      writeFileSync(this.srcPath, newContent)
      log.info(`Config reload [${this.srcPath}]`)
    })
  }

  async rollback() {
    await this.skipable(() => {
      if (!this.hasBakFile) {
        log.warn(`Backup file [${this.bakPath}] does not exist, skip rollback`)
      } else {
        writeFileSync(this.srcPath, readFileSync(this.bakPath, 'utf-8'))
        log.info(`Config rollback [${this.srcPath}]`)
      }
    })
  }

  async skipable(fn: () => Promisable<void>) {
    let skipMessage = await this.skipAll?.()
    if (skipMessage) {
      promptWarn(skipMessage)
    } else {
      await fn()
    }
  }

  abstract patch(content: string): Promisable<string>
}
