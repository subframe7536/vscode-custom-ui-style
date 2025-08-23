import type { Promisable } from '@subframe7536/type-utils'

import fs from 'node:fs'

import { readFileSync, writeFileSync } from 'atomically'

import { addBuiltinConfigCache, addExtensionConfigCache } from '../cache'
import { log } from '../logger'
import { promptWarn } from '../utils'

export interface FileManager {
  srcPath: string
  bakPath: string
  hasBakFile: boolean
  reload: () => Promise<void>
  rollback: () => Promise<void>
}

export abstract class BaseFileManager implements FileManager {
  constructor(
    public srcPath: string,
    public bakPath: string,
    isExtension?: boolean,
  ) {
    if (isExtension) {
      addExtensionConfigCache(srcPath, bakPath)
    } else {
      addBuiltinConfigCache(srcPath, bakPath)
    }
  }

  get hasBakFile() {
    return fs.existsSync(this.bakPath)
  }

  /**
   * Skip all operations with message (optional)
   */
  protected skipAll?: () => Promisable<string | undefined | false>
  /**
   * Cleanup content when rollback (optional)
   */
  protected cleanup?: (content: string) => string

  async reload() {
    let skipMessage = await this.skipAll?.()
    if (skipMessage) {
      promptWarn(skipMessage)
      return
    }
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
      let content = readFileSync(this.bakPath, 'utf-8')
      if (this.cleanup) {
        content = this.cleanup(content)
      }
      writeFileSync(this.srcPath, content)
      log.info(`Config rollback [${this.srcPath}]`)
    }
  }

  abstract patch(content: string): Promisable<string>
}
