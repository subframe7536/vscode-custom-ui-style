import fs from 'node:fs'

import { config } from '../config'
import { sessionsMainCssBakPath, sessionsMainCssPath } from '../path'

import { BaseFileManager } from './base'
import { patchWorkbenchStyle } from './css'

export class SessionsCssFileManager extends BaseFileManager {
  constructor() {
    super(sessionsMainCssPath, sessionsMainCssBakPath)
    this.skipAll = () =>
      fs.existsSync(this.srcPath) ? false : `Skip sessions patch: file not found [${this.srcPath}]`
    this.cleanup = (content) =>
      content
        .replace(/\/\* Custom UI Style Start \*\/[\s\S]*?\/\* Custom UI Style End \*\//, '')
        .trim()
  }

  patch(content: string): string {
    return patchWorkbenchStyle(content, config['agents.stylesheet'])
  }
}
