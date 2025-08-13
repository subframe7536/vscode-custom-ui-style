import fs from 'node:fs'
import path from 'node:path/posix'

import { env, version } from 'vscode'

import { name as bakExt } from './generated/meta'
import { logError, printFileTree } from './utils'

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
 * Base dir for all modified file
 *
 * The `product.json` is in its parent dir
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

/**
 * <baseDir>/vs/code
 */
const codeBaseDir = path.join(baseDir, 'vs', 'code')
/**
 * <baseDir>/vs/workbench
 */
const workbenchBaseDir = path.join(baseDir, 'vs', 'workbench')

function getWebviewHTML(ext: string) {
  return path.join(
    workbenchBaseDir,
    'contrib',
    'webview',
    'browser',
    'pre',
    `index.${ext}`,
  )
}

export const webviewHTMLPath = getWebviewHTML('html')
export const webviewHTMLBakPath = getWebviewHTML(`${bakExt}.html`)
/**
 * See https://code.visualstudio.com/api/references/vscode-api#env
 */
function getWorkbenchPath(baseExt: string, backupExt?: string) {
  const ext = backupExt ? `${backupExt}.${baseExt}` : baseExt
  return path.join(
    workbenchBaseDir,
    // https://github.com/microsoft/vscode/pull/141263
    env.appHost === 'desktop'
      ? `workbench.desktop.main.${ext}`
      : `workbench.web.main.${ext}`,
  )
}
/**
 * Workbench CSS file path
 */
export const cssPath = getWorkbenchPath('css')
/**
 * Workbench CSS file backup path
 */
export const cssBakPath = getWorkbenchPath('css', bakExt)
/**
 * Workbench main js file path
 */
export const rendererPath = getWorkbenchPath('js')
/**
 * Workbench main js file backup path
 */
export const rendererBakPath = getWorkbenchPath('js', bakExt)

function getMainPath(baseExt: string, backupExt?: string) {
  const ext = backupExt ? `${backupExt}.${baseExt}` : baseExt
  const defaultPath = path.join(
    codeBaseDir,
    'electron-main',
    `main.${ext}`,
  )
  return fs.existsSync(defaultPath) ? defaultPath : path.join(baseDir, `main.${ext}`)
}

/**
 * VSCode main js path
 */
export const mainPath = getMainPath('js')
/**
 * VSCode main js backup path
 */
export const mainBakPath = getMainPath('js', bakExt)

function getProductJSONPath(baseExt: string, backupExt?: string) {
  const ext = backupExt ? `${backupExt}.${baseExt}` : baseExt
  return path.join(path.dirname(baseDir), `product.${ext}`)
}

export const productJSONPath = getProductJSONPath('json')

export const productJSONBakPath = getProductJSONPath('json', `${version}.${bakExt}`)

const AVAILIABLE_DIR = [
  'electron-sandbox/workbench',
  'electron-browser/workbench',
]

const htmlDirPath = (() => {
  for (const dir of AVAILIABLE_DIR) {
    const result = path.join(codeBaseDir, dir)
    if (fs.existsSync(result)) {
      return result
    }
  }
  return ''
})()

const WORKBENCH_HTML_NAMES = [
  'workbench.html',
  'workbench-dev.html',
  'workbench.esm.html',
  'workbench-dev.esm.html',
]
export const htmlPath = (() => {
  if (!htmlDirPath) {
    return ''
  }
  for (const name of WORKBENCH_HTML_NAMES) {
    const result = path.join(htmlDirPath, name)
    if (fs.existsSync(result)) {
      return result
    }
  }
  return ''
})()

export function generateNoHtmlErrorMessage() {
  if (!htmlDirPath) {
    return `Cannot find the workbench html dir in ${codeBaseDir}, known dirs are [${AVAILIABLE_DIR}]. File tree: ${printFileTree(codeBaseDir)}`
  }
  if (!htmlPath) {
    return `Cannot find the workbench html file in ${htmlDirPath}, known files are [${WORKBENCH_HTML_NAMES}]. File tree: ${printFileTree(htmlDirPath)}`
  }
  return 'Workbench html file found. You should not see this message.'
}

export const htmlBakPath = htmlPath.replace('.html', `.${bakExt}.html`)

export const externalCssName = 'external.css'
export const externalJsName = 'external.js'
export const externalJsModuleName = 'external.module.js'

export const externalCssPath = path.join(htmlDirPath, externalCssName)
export const externalJsPath = path.join(htmlDirPath, externalJsName)
export const externalJsModulePath = path.join(htmlDirPath, externalJsModuleName)
export const externalCacheInfoPath = path.join(htmlDirPath, 'external.cache.json')
