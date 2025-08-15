import type { FileManager } from './base'

import { version } from 'vscode'

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
  const managers: FileManager[] = [
    new CssFileManager(),
    new MainFileManager(),
    new RendererFileManager(),
    new ExternalFileManager(),
    new WebViewFileManager(),
    new JsonFileManager(), // MUST be the end of built-in file managers
    ...createExtensionFileManagers(),
  ]

  return {
    hasBakFile: () => managers.every(m => m.hasBakFile),
    reload: async (text: string) => {
      await runAndRestart(
        text,
        isVSCodeUsingESM || config.preferRestart,
        async () => {
          for (const manager of managers) {
            await manager.reload()
          }
        },
      )
    },
    rollback: async (text: string) => {
      await runAndRestart(
        text,
        isVSCodeUsingESM || config.preferRestart,
        () => Promise.all(managers.map(m => m.rollback())),
      )
    },
  }
}
