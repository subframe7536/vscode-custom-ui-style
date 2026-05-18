import { version } from 'vscode'

import { flushCache } from '../cache'
import { config } from '../config'
import { runAndRestart } from '../utils'

import type { FileManager } from './base'
import { CssFileManager } from './css'
import { createExtensionFileManagers } from './extension'
import { ExternalFileManager } from './external'
import { JsonFileManager } from './json'
import { MainFileManager } from './main'
import { RendererFileManager } from './renderer'
import { SessionsCssFileManager } from './sessions-css'
import { SessionsMainFileManager } from './sessions-main'
import { WebViewFileManager } from './webview'

/**
 * Version >= 1.95
 */
const isVSCodeUsingESM = (() => {
  const versionArray = version.split('.').map(Number)
  return versionArray[0] === 1 && versionArray[1]! >= 95
})()

export function createFileManagers() {
  const builtinManagers: FileManager[] = [
    new CssFileManager(),
    new MainFileManager(),
    new SessionsCssFileManager(),
    new SessionsMainFileManager(),
    new RendererFileManager(),
    new ExternalFileManager(),
    new WebViewFileManager(),
    new JsonFileManager(), // MUST be the end of built-in file managers
  ]
  flushCache()

  return {
    hasBakFile: () => builtinManagers[builtinManagers.length - 1]?.hasBakFile,
    hasBakExtFiles: () => createExtensionFileManagers(true).every((m) => m.hasBakFile),
    reload: async (text: string, override = false) => {
      await runAndRestart(text, isVSCodeUsingESM || config.preferRestart, async () => {
        const total = [...builtinManagers, ...createExtensionFileManagers()]
        for (const manager of total) {
          await manager.reload(override)
        }
      })
    },
    rollback: async (text: string, cleanup = false) => {
      await runAndRestart(
        text,
        isVSCodeUsingESM || config.preferRestart,
        () =>
          Promise.all(
            [...builtinManagers, ...createExtensionFileManagers()].map((m) => m.rollback(cleanup)),
          ),
        cleanup,
      )
    },
  }
}
