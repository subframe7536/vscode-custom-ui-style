import fs from 'node:fs'
import path from 'node:path/posix'
import { env, version } from 'vscode'
import { name as bakExt } from './generated/meta'
import { log } from './logger'
import { logError } from './utils'

function getDirectoryName(filePath: string): string {
  const lastSlashIndex = Math.max(
    filePath.lastIndexOf('/'),
    filePath.lastIndexOf('\\'),
  )

  if (lastSlashIndex === -1) {
    return ''
  }

  return filePath.substring(0, lastSlashIndex)
}

/**
 * Base dir: {VSCodeExecPath}/out
 */
export const baseDir = (() => {
  const envAppRoot = env.appRoot
  if (envAppRoot && fs.existsSync(envAppRoot)) {
    return path.join(envAppRoot, 'out')
  }
  const mainFilename = require.main?.filename.replace(/\\/g, '/')
  if (!mainFilename) {
    const msg = 'Cannot determine main file name'
    logError(msg)
    throw new Error(msg)
  }

  // `path.dirname(mainFilename)` will return '.' in extension, so here manually extract it
  return getDirectoryName(mainFilename)
})()

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
function getWorkbenchPath(baseExt: string, backupExt?: string) {
  const ext = backupExt ? `${backupExt}.${baseExt}` : baseExt
  return path.join(
    baseDir,
    'vs',
    'workbench',
    // https://github.com/microsoft/vscode/pull/141263
    env.appHost === 'desktop'
      ? `workbench.desktop.main.${ext}`
      : `workbench.web.main.${ext}`,
  )
}
/**
 * CSS file path
 */
export const cssPath = getWorkbenchPath('css')
/**
 * CSS file backup path
 */
export const cssBakPath = getWorkbenchPath('css', bakExt)
/**
 * Main js file path
 */
export const rendererPath = getWorkbenchPath('js')
/**
 * Main js file backup path
 */
export const rendererBakPath = getWorkbenchPath('js', bakExt)

function getMainPath(baseExt: string, backupExt?: string) {
  const ext = backupExt ? `${backupExt}.${baseExt}` : baseExt
  const defaultPath = path.join(
    baseDir,
    'vs',
    'code',
    'electron-main',
    `main.${ext}`,
  )
  return fs.existsSync(defaultPath) ? defaultPath : path.join(baseDir, `main.${ext}`)
}

export const mainPath = getMainPath('js')
export const mainBakPath = getMainPath('js', bakExt)

function getProductJSONPath(baseExt: string, backupExt?: string) {
  const ext = backupExt ? `${backupExt}.${baseExt}` : baseExt
  return path.join(path.dirname(baseDir), `product.${ext}`)
}

export const productJSONPath = getProductJSONPath('json')

export const productJSONBakPath = getProductJSONPath('json', `${version}.${bakExt}`)

const sandboxPath = path.join(
  baseDir,
  'vs',
  'code',
  'electron-sandbox',
  'workbench',
)

export const htmlPath = (() => {
  const WORKBENCH_NAMES = [
    'workbench',
    'workbench-dev',
    'workbench.esm',
    'workbench-dev.esm',
  ]
  for (const name of WORKBENCH_NAMES) {
    const result = path.join(sandboxPath, `${name}.html`)
    if (fs.existsSync(result)) {
      return result
    }
  }
  log.warn('No html found, use default html path')
  return path.join(sandboxPath, `${WORKBENCH_NAMES[0]}.html`)
})()

export const htmlBakPath = htmlPath.replace('.html', `.${bakExt}.html`)

export const externalCssName = 'external.css'
export const externalJsName = 'external.js'
export const externalJsModuleName = 'external.module.js'

export const externalCssPath = path.join(sandboxPath, externalCssName)
export const externalJsPath = path.join(sandboxPath, externalJsName)
export const externalJsModulePath = path.join(sandboxPath, externalJsModuleName)
export const externalCacheInfoPath = path.join(sandboxPath, 'external.cache.json')
