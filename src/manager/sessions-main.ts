import fs from 'node:fs'

import { config } from '../config'
import { sessionsMainJsBakPath, sessionsMainJsPath } from '../path'

import { BaseFileManager } from './base'
import { patchMainScript } from './main'
import { patchRendererScript } from './renderer'

export class SessionsMainFileManager extends BaseFileManager {
  constructor() {
    super(sessionsMainJsPath, sessionsMainJsBakPath)
    this.skipAll = () =>
      fs.existsSync(this.srcPath) ? false : `Skip sessions patch: file not found [${this.srcPath}]`
  }

  patch(content: string): string {
    return patchRendererScript(patchMainScript(content, config.electron))
  }
}
