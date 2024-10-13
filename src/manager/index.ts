import type { FileManager } from './base'
import { cssBakPath, cssPath, jsBakPath, jsPath, webviewHTMLBakPath, webviewHTMLPath } from '../path'
import { runAndRestart } from '../utils'
import { CssFileManager } from './css'
import { JsFileManager } from './js'
import { WebViewFileManager } from './webview'

export function createFileManagers() {
  const managers: FileManager[] = [
    new CssFileManager(cssPath, cssBakPath),
    new JsFileManager(jsPath, jsBakPath),
    new WebViewFileManager(webviewHTMLPath, webviewHTMLBakPath),
  ]
  return {
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
