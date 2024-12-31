// Reference from https://github.com/be5invis/vscode-custom-css/blob/master/src/extension.js
import type { Promisable } from '@subframe7536/type-utils'
import os from 'node:os'
import Url from 'node:url'
import { readFileSync } from 'atomically'
import { config } from './config'
import { log, logError, showMessage } from './utils'

let css: string | undefined
let js: string | undefined
let jsModule: string | undefined

export function getCssImports(): string {
  if (!config['external.enable']) {
    return ''
  }
  if (typeof css === 'undefined') {
    log.warn('No import parsed, ignore')
  }
  return css || ''
}

export function getJsImports(): string {
  if (!config['external.enable']) {
    return ''
  }
  if (typeof js === 'undefined') {
    log.warn('No import parsed, ignore')
  }
  return js || ''
}

export function getJsModuleImports(): string {
  if (!config['external.enable']) {
    return ''
  }
  if (typeof jsModule === 'undefined') {
    log.warn('No import parsed, ignore')
  }
  return jsModule || ''
}

export function resetCachedImports() {
  css = js = jsModule = undefined
}
type ResourceType = 'css' | 'js' | 'js-module'
type ImportConfig = string | { type: ResourceType, url: string }

let hasPrompted = false
export async function parseImports(): Promise<void> {
  const urls = (config['external.imports'] || []) as ImportConfig[]
  css = js = ''
  if (!hasPrompted && urls.some(u => typeof u === 'object' && u.type === 'js')) {
    await showMessage('Loading external JS script, be care of its source code!')
    hasPrompted = true
  }

  for (const url of urls) {
    const data = await getImportsContent(url)
    if (!data) {
      continue
    }
    const [type, parsedURL, content] = data
    switch (type) {
      case 'css':
        css += `\n/* >> ${parsedURL} */${content}\n`
        break
      case 'js':
        js += `\n// >> ${parsedURL}\n${content}\n`
        break
      case 'js-module':
        js += `\n// >> ${parsedURL}\n${content}\n`
        break
    }
  }
}

// check encoding error
const garbledPattern = /[^\x20-\x7F]/g
function isGarbled(text: string): boolean {
  return (text.match(garbledPattern) || []).length / text.length > 0.5
}

const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
async function getImportsContent(
  config: ImportConfig,
): Promise<[type: ResourceType, url: string, content: string] | undefined> {
  let type: ResourceType

  if (typeof config === 'string') {
    if (config.endsWith('.css')) {
      type = 'css'
    } else if (config.endsWith('.js')) {
      type = 'js-module'
    } else {
      log.warn(`Unsupported extension: ${config}. Must be '.css' or '.js'`)
      return undefined
    }
    const protocol = 'file://'
    if (!config.startsWith(protocol)) {
      log.warn(`${config} must startsWith '${protocol}'`)
      return undefined
    }
    return await getContent(
      type,
      parseFilePath(config),
      path => readFileSync(path, 'utf-8'),
    )
  } else {
    const protocol = 'https://'
    if (!config.url.startsWith(protocol)) {
      log.warn(`${config.url} must startsWith '${protocol}'`)
      return undefined
    }
    return await getContent(
      config.type,
      new URL(config.url).toString(),
      readURLContent,
    )
  }
}

async function readURLContent(url: string, type: string): Promise<string> {
  const resp = await fetch(url, { headers: { 'User-Agent': ua } })
  const txt = await resp.text()
  if (!isGarbled(txt)) {
    return txt
  }
  const base = `The content of ${url} may be garbled and crash your VSCode`
  log.warn(base, '\n', txt)
  const result = await showMessage(`${base}: ${txt.substring(0, 100)}`, 'Skip And Show Details', 'Apply at my own risk')
  if (result === 'Apply at my own risk') {
    log.warn(`Apply ${url}`)
    return txt
  } else {
    log.show()
    return type === 'css' ? `/* ${base}, skip */` : `// ${base}, skip`
  }
}

async function getContent<T>(
  type: T,
  url: string,
  fn: (url: string, type: T) => Promisable<string>,
): Promise<[type: T, url: string, content: string] | undefined> {
  try {
    return [type, url, await fn(url, type)]
  } catch (error) {
    logError(`Fail to get content of [${url}]`, error)
    return undefined
  }
}

const envRegex = /\$\{([^{}]+)\}/g
function parseFilePath(url: string): string {
  if (url.startsWith('file://')) {
    const resolved = url.replace(envRegex, (substr, key) => resolveVariable(key) ?? substr)
    return Url.fileURLToPath(resolved)
  } else {
    return url
  }
}

function resolveVariable(key: string): string | undefined {
  if (key === 'userHome') {
    return os.homedir()
  } else if (key.startsWith('env:')) {
    const [_, envKey, optionalDefault] = key.split(':')
    return process.env[envKey] ?? optionalDefault ?? ''
  }
}
