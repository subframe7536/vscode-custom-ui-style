// Reference from https://github.com/be5invis/vscode-custom-css/blob/master/src/extension.js
import type { Promisable } from '@subframe7536/type-utils'
import os from 'node:os'
import Url from 'node:url'
import { readFileSync, writeFileSync } from 'atomically'
import { config } from '../config'
import {
  externalCssName,
  externalCssPath,
  externalJsModuleName,
  externalJsModulePath,
  externalJsName,
  externalJsPath,
  htmlBakPath,
  htmlPath,
} from '../path'
import { log, logError, promptWarn, showMessage } from '../utils'
import { BaseFileManager } from './base'

type ResourceType = 'css' | 'js' | 'jsModule'
type ImportConfig = string | { type: ResourceType, url: string }

let hasPrompted = false
async function parseImports(): Promise<Record<ResourceType, string>> {
  const urls = (config['external.imports'] || []) as ImportConfig[]
  let css = ''
  let js = ''
  let jsModule = ''
  if (!hasPrompted && urls.some(u => typeof u === 'object' && u.type === 'js')) {
    await showMessage('Loading external JS script, be care of its source code!')
    hasPrompted = true
  }

  for (const url of urls) {
    const data = await getImportsContent(url)
    if (data === undefined) {
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
      case 'jsModule':
        jsModule += `\n// >> ${parsedURL}\n${content}\n`
        break
    }
  }
  return { css, js, jsModule }
}

// check encoding error
const garbledPattern = /[^\x20-\x7F]/g
function isGarbled(text: string): boolean {
  return (text.match(garbledPattern) || []).length / text.length > 0.5
}

const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
const fileProtocol = 'file://'
const httpsProtocol = 'https://'
async function getImportsContent(
  config: ImportConfig,
): Promise<[type: ResourceType, url: string, content: string] | undefined> {
  let type: ResourceType

  if (typeof config === 'string') {
    if (config.endsWith('.css')) {
      type = 'css'
    } else if (config.endsWith('.js')) {
      type = 'jsModule'
    } else {
      promptWarn(`Unsupported extension: [${config}]. Must be '.css' or '.js'`)
      return undefined
    }
    if (config.startsWith(httpsProtocol)) {
      return await getImportsContent({ type, url: config })
    }
    if (!config.startsWith(fileProtocol)) {
      promptWarn(`[${config}] must startsWith '${fileProtocol}'`)
      return undefined
    }
    return await getContent(
      type,
      parseFilePath(config),
      path => readFileSync(path, 'utf-8'),
    )
  } else {
    if (!config.url.startsWith(httpsProtocol)) {
      promptWarn(`[${config.url}] must startsWith '${httpsProtocol}'`)
      return undefined
    }
    return await getContent(
      config.type.replace('-m', 'M') as ResourceType,
      new URL(config.url).toString(),
      fetchURLContent,
    )
  }
}

async function fetchURLContent(url: string, type: string): Promise<string> {
  const resp = await fetch(url, { headers: { 'User-Agent': ua } })
  const txt = await resp.text()
  if (!isGarbled(txt)) {
    return txt
  }
  const base = `The content of ${url} may be garbled and crash your VSCode`
  log.warn(`${base}\n${txt}`)
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

const entryJS = '<script src="./workbench.js" type="module"></script>'
const entryCSS = '<link rel="stylesheet" href="../../../workbench/workbench.desktop.main.css">'

export class ExternalFileManager extends BaseFileManager {
  constructor() {
    super(htmlPath, htmlBakPath)
  }

  async patch(content: string): Promise<string> {
    switch (config['external.loadStrategy']) {
      case 'disable':
        writeFileSync(externalCssPath, '')
        writeFileSync(externalJsPath, '')
        writeFileSync(externalJsModulePath, '')
        return content
      case 'keep':
        return content
      case 'enable':
        break
    }
    const { css, js, jsModule } = await parseImports()
    writeFileSync(externalCssPath, css, 'utf-8')
    writeFileSync(externalJsPath, js, 'utf-8')
    writeFileSync(externalJsModulePath, jsModule, 'utf-8')
    return content
      .replace(
        entryJS,
        `${entryJS}
        <!-- External Script Start -->
        <script src="./${externalJsName}"></script>
        <script src="./${externalJsModuleName}" type="module"></script>
        <!-- External Script End -->
`,
      )
      .replace(
        entryCSS,
        `${entryCSS}
                <!-- External Style Start -->
                <script src="./${externalCssName}"></script>
                <!-- External Style End -->
`,
      )
  }
}
