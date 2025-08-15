import type { Promisable } from '@subframe7536/type-utils'

import path from 'node:path'

import { extensions } from 'vscode'

import { log } from '../logger'
import { promptWarn } from '../utils'
import { BaseFileManager } from './base'

interface ExtensionPatchConfig {
  filePath: string
  find: string
  replace: string
}

function getBackupPath(filePath: string) {
  const obj = path.parse(filePath)
  return path.join(obj.dir, `${obj.name}.custom-ui-style${obj.ext}`)
}

function tryParseRegex(str: string): RegExp | string {
  if (str.length < 3) {
    return str
  }
  if (!str.startsWith('/')) {
    return str
  }

  const lastSlashPos = str.lastIndexOf('/')
  if (lastSlashPos <= 0) {
    return str
  }

  const body = str.slice(1, lastSlashPos)
  if (body.length === 0) {
    return str
  }

  const flags = str.slice(lastSlashPos + 1)
  if (!/^[gimsuy]*$/.test(flags)) {
    return str
  }

  try {
    return new RegExp(body, flags)
  } catch (e) {
    log.error(e)
    return str
  }
}

class ExtensionFileManager extends BaseFileManager {
  constructor(private config: ExtensionPatchConfig) {
    super(config.filePath, getBackupPath(config.filePath))
  }

  patch(content: string): Promisable<string> {
    return content.replace(tryParseRegex(this.config.find), this.config.replace)
  }
}

export function createExtensionFileManagers(extensionConfig?: Record<string, unknown>) {
  if (!extensionConfig) {
    return []
  }
  const managers = []
  for (const [extensionId, patchConfig] of Object.entries(extensionConfig)) {
    const rootPath = extensions.getExtension(extensionId)?.extensionPath
    if (!rootPath) {
      promptWarn(`No such extension: ${extensionId}, skip patch`)
      continue
    }
    if (!Array.isArray(patchConfig)) {
      promptWarn(`Config should be an array, skip patching ${extensionId}`)
      continue
    }
    const warningArray = []
    for (const conf of patchConfig) {
      if (conf.filePath && conf.find && conf.replace) {
        managers.push(new ExtensionFileManager({
          ...conf,
          filePath: path.join(rootPath, conf.filePath),
        }))
      } else {
        warningArray.push(conf)
      }
    }
    if (warningArray.length > 0) {
      promptWarn(`Configs of ${extensionId} are invalid: ${JSON.stringify(warningArray, null, 2)}`)
    }
  }
  return managers
}
