import type { FileManager } from './base'
import { runAndRestart } from '../utils'
import { CssFileManager } from './css'
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
  return {
    hasBakFile: () => managers.every(m => m.hasBakFile),
    reload: (text: string) => runAndRestart(
      text,
      () => Promise.all(managers.map(m => m.reload())),
    ),
    rollback: (text: string) => runAndRestart(
      text,
      () => Promise.all(managers.map(m => m.rollback())),
    ),
  }
}
