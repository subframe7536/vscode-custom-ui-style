import type { Promisable } from '@subframe7536/type-utils'
import os from 'node:os'
import Url from 'node:url'
import { readFileSync } from 'atomically'
import { config } from './config'
import { log, logError, showMessage } from './utils'

let css: string | undefined
let js: string | undefined

export async function getCssImports(): Promise<string> {
  if (!config['external.enable']) {
    return ''
  }
  if (typeof css === 'undefined') {
    log.warn('No import parsed, ignore')
  }
  return css || ''
}

export async function getJsImports(): Promise<string> {
  if (!config['external.enable']) {
    return ''
  }
  if (typeof js === 'undefined') {
    log.warn('No import parsed, ignore')
  }
  return js || ''
}

export function resetCachedImports() {
  css = js = undefined
}

let hasPrompted = false
export async function parseImports(): Promise<void> {
  const urls = config['external.imports'] || []
  css = js = ''
  if (!hasPrompted && urls.some(u => u.startsWith('http') && u.endsWith('.js'))) {
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
  url: string,
): Promise<[type: 'css' | 'js', url: string, content: string] | undefined> {
  let type: 'css' | 'js'
  if (url.endsWith('.css')) {
    type = 'css'
  } else if (url.endsWith('.js')) {
    type = 'js'
  } else {
    log.warn(`Unsupported extension: ${url}. Must be '.css' or '.js`)
    return undefined
  }

  if (url.startsWith('file://')) {
    return await getContent(
      type,
      parseFilePath(url),
      path => readFileSync(path, 'utf-8'),
    )
  } else if (url.startsWith('https://')) {
    return await getContent(
      type,
      new URL(url).toString(),
      async url => await fetch(url, { headers: { 'User-Agent': ua } })
        .then(resp => resp.text())
        .then(async (txt) => {
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
        }),
    )
  } else {
    log.warn(`Unsupported protocol: ${url}. Must be 'file://' or 'https://'`)
    return undefined
  }
}

async function getContent<T>(
  type: T,
  url: string,
  fn: (url: string) => Promisable<string>,
): Promise<[type: T, url: string, content: string] | undefined> {
  try {
    return [type, url, await fn(url)]
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
