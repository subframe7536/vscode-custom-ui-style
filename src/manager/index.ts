import type { FileManager } from './base'
import { logWindowOptionsChanged } from '../config'
import { runAndRestart } from '../utils'
import { CssFileManager } from './css'
import { JsonFileManager } from './json'
import { MainFileManager } from './main'
import { RendererFileManager } from './renderer'
import { WebViewFileManager } from './webview'

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
        () => Promise.all(managers.map(m => m.reload()))
          // ensure other files are already modified
          .then(() => productJsonManager.reload())
        ,
      )
    },
    rollback: async (text: string) => {
      logWindowOptionsChanged()
      await runAndRestart(
        text,
        () => Promise.all([...managers, productJsonManager].map(m => m.rollback())),
      )
    },
  }
}
