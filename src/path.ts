import fs from 'node:fs'
import path from 'node:path'
import vscode from 'vscode'
import { name as bakExt } from './generated/meta'

/**
 * Base dir
 */
export const baseDir = (() => {
  const mainFilename = require.main?.filename
  return mainFilename?.length ? path.dirname(mainFilename) : path.join(vscode.env.appRoot, 'out')
})()
// export const baseDir = path.join(vscode.env.appRoot, 'out')

function getWebviewHTML(ext: string) {
  return path.join(
    baseDir,
    'vs',
    'workbench',
    'contrib',
    'webview',
    'browser',
    'pre',
    `index${ext}`,
  )
}

export const webviewHTMLPath = getWebviewHTML('.html')
export const webviewHTMLBakPath = getWebviewHTML(`.${bakExt}.html`)
/**
 * See https://code.visualstudio.com/api/references/vscode-api#env
 */
function getRendererPath(baseExt: string, backupExt?: string) {
  const ext = backupExt ? `${backupExt}.${baseExt}` : baseExt
  return path.join(
    baseDir,
    'vs',
    'workbench',
    // https://github.com/microsoft/vscode/pull/141263
    vscode?.env.appHost === 'desktop'
      ? `workbench.desktop.main.${ext}`
      : `workbench.web.main.${ext}`,
  )
}
/**
 * CSS file path
 */
export const cssPath = getRendererPath('css')
/**
 * CSS file backup path
 */
export const cssBakPath = getRendererPath('css', bakExt)
/**
 * Main js file path
 */
export const rendererPath = getRendererPath('js')
/**
 * Main js file backup path
 */
export const rendererBakPath = getRendererPath('js', bakExt)

function getMainPath(baseExt: string, backupExt?: string) {
  const ext = backupExt ? `${backupExt}.${baseExt}` : baseExt
  const defaultPath = path.join(
    baseDir,
    'vs',
    'code',
    'electron-main',
    `main.${ext}`,
  )
  return fs.existsSync(defaultPath) ? defaultPath : path.join(baseDir, `main.${baseExt}`)
}

export const mainPath = getMainPath('js')
export const mainBakPath = getMainPath('js', bakExt)

export function normalizeUrl(url: string) {
  if (!url.startsWith('file://')) {
    return url
  }
  // file:///Users/foo/bar.png => vscode-file://vscode-app/Users/foo/bar.png
  return vscode.Uri.parse(url.replace('file://', 'vscode-file://vscode-app')).toString()
}
