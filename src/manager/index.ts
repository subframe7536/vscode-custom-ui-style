import type { FileManager } from './base'
import { version } from 'vscode'
import { config, logWindowOptionsChanged } from '../config'
import { runAndRestart } from '../utils'
import { CssFileManager } from './css'
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
    new WebViewFileManager(),
  ]
  const productJsonManager = new JsonFileManager()
  return {
    hasBakFile: () => [...managers, productJsonManager].every(m => m.hasBakFile),
    reload: async (text: string) => {
      logWindowOptionsChanged()
      await runAndRestart(
        text,
        isVSCodeUsingESM || config.preferRestart,
        () => Promise.all(managers.map(m => m.reload()))
          // ensure other files are already modified
          .then(() => productJsonManager.reload()),
      )
    },
    rollback: async (text: string) => {
      logWindowOptionsChanged()
      await runAndRestart(
        text,
        isVSCodeUsingESM || config.preferRestart,
        () => Promise.all([...managers, productJsonManager].map(m => m.rollback())),
      )
    },
  }
}
