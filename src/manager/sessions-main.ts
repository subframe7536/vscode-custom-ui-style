import fs from 'node:fs'

import { config } from '../config'
import { sessionsMainJsBakPath, sessionsMainJsPath } from '../path'

import { BaseFileManager } from './base'
import { patchMainScript } from './main'

export class SessionsMainFileManager extends BaseFileManager {
  constructor() {
    super(sessionsMainJsPath, sessionsMainJsBakPath)
    this.skipAll = () =>
      fs.existsSync(this.srcPath) ? false : `Skip sessions patch: file not found [${this.srcPath}]`
  }

  patch(content: string): string {
    return patchMainScript(content, config.electron)
  }
}
