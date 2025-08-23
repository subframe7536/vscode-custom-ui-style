import type { FileManager } from './base'

import { version } from 'vscode'

import { flushCache } from '../cache'
import { config } from '../config'
import { runAndRestart } from '../utils'
import { CssFileManager } from './css'
import { createExtensionFileManagers } from './extension'
import { ExternalFileManager } from './external'
import { JsonFileManager } from './json'
import { MainFileManager } from './main'
import { RendererFileManager } from './renderer'
import { WebViewFileManager } from './webview'

/**
 * Version >= 1.95
 */
const isVSCodeUsingESM = (() => {
  const versionArray = version.split('.').map(Number)
  return versionArray[0] === 1 && versionArray[1] >= 95
})()

export function createFileManagers() {
  const builtinManagers: FileManager[] = [
    new CssFileManager(),
    new MainFileManager(),
    new RendererFileManager(),
    new ExternalFileManager(),
    new WebViewFileManager(),
    new JsonFileManager(), // MUST be the end of built-in file managers
  ]
  flushCache()

  return {
    hasBakFile: () => builtinManagers.every(m => m.hasBakFile),
    hasBakExtFiles: () => createExtensionFileManagers(true).every(m => m.hasBakFile),
    reload: async (text: string) => {
      await runAndRestart(
        text,
        isVSCodeUsingESM || config.preferRestart,
        async () => {
          const total = [...builtinManagers, ...createExtensionFileManagers()]
          for (const manager of total) {
            await manager.reload()
          }
        },
      )
    },
    rollback: async (text: string) => {
      await runAndRestart(
        text,
        isVSCodeUsingESM || config.preferRestart,
        () => Promise.all([...builtinManagers, ...createExtensionFileManagers()].map(m => m.rollback())),
      )
    },
  }
}
