import type { FileManager } from './base'
import {
  cssBakPath,
  cssPath,
  mainBakPath,
  mainPath,
  rendererBakPath,
  rendererPath,
  webviewHTMLBakPath,
  webviewHTMLPath,
} from '../path'
import { runAndRestart } from '../utils'
import { CssFileManager } from './css'
import { MainFileManager } from './main'
import { RendererFileManager } from './renderer'
import { WebViewFileManager } from './webview'

export function createFileManagers() {
  const managers: FileManager[] = [
    new CssFileManager(cssPath, cssBakPath),
    new RendererFileManager(rendererPath, rendererBakPath),
    new WebViewFileManager(webviewHTMLPath, webviewHTMLBakPath),
    new MainFileManager(mainPath, mainBakPath),
  ]
  return {
    reload: (text: string, fontChanged = true) => runAndRestart(
      text,
      () => Promise.all(managers.map(m => m.reload(fontChanged))),
    ),
    rollback: (text: string) => runAndRestart(
      text,
      () => Promise.all(managers.map(m => m.rollback())),
    ),
  }
}
