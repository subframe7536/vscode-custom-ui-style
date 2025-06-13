// Reference from https://github.com/be5invis/vscode-custom-css/blob/master/src/extension.js
import type { Promisable } from '@subframe7536/type-utils'

import fs from 'node:fs'

import { readFileSync, writeFileSync } from 'atomically'

import { config } from '../config'
import { log } from '../logger'
import {
  externalCacheInfoPath,
  externalCssName,
  externalCssPath,
  externalJsModuleName,
  externalJsModulePath,
  externalJsName,
  externalJsPath,
  htmlBakPath,
  htmlPath,
} from '../path'
import { fileProtocol, httpsProtocol, logError, parseFilePath, promptWarn, showMessage } from '../utils'
import { BaseFileManager } from './base'

type ResourceType = 'css' | 'js' | 'js-module'
type ResourceMeta = [type: ResourceType, url: string, content: () => Promisable<string | undefined>]
type ResourceConfig = string | { type: ResourceType, url: string }

const EMPTY_CSS = '/* EMPTY EXTERNAL CSS */'
const EMPTY_JS = '// EMPTY EXTERNAL JS'
const EMPTY_JS_MODULE = '// EMPTY EXTERNAL JS MODULE'

let hasPrompted = false
async function parseImports(urls: ResourceConfig[]): Promise<ResourceMeta[]> {
  if (
    !hasPrompted
    && urls.some(u =>
      (typeof u === 'object' && u.type.startsWith('.js'))
      || (typeof u === 'string' && u.startsWith('http') && u.endsWith('.js')),
    )
  ) {
    showMessage('Loading remote JS script, be care of its source code!')
    hasPrompted = true
  }

  const result: ResourceMeta[] = []
  for (const url of urls) {
    const data = await getResourceMeta(url)
    if (data) {
      result.push(data)
    }
  }
  return result
}

// check encoding error
const garbledPattern = /[^\x20-\x7F]/g
function isGarbled(text: string): boolean {
  return (text.match(garbledPattern) || []).length / text.length > 0.5
}

const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

async function getResourceMeta(config: ResourceConfig): Promise<ResourceMeta | undefined> {
  let type: ResourceType

  if (typeof config === 'string') {
    if (config.endsWith('.css')) {
      type = 'css'
    } else if (config.endsWith('.js')) {
      type = 'js-module'
    } else {
      promptWarn(`Unsupported extension: [${config}]. Must be '.css' or '.js'`)
      return undefined
    }
    if (config.startsWith(httpsProtocol)) {
      return await getResourceMeta({ type, url: config })
    }
    if (!config.startsWith(fileProtocol)) {
      promptWarn(`[${config}] must startsWith '${fileProtocol}'`)
      return undefined
    }
    return await parseResourceMeta(
      type,
      parseFilePath(config),
      path => readFileSync(path, 'utf-8'),
    )
  } else {
    if (!config.url.startsWith(httpsProtocol)) {
      promptWarn(`[${config.url}] must startsWith '${httpsProtocol}'`)
      return undefined
    }
    return await parseResourceMeta(
      config.type,
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
  const base = `The content of ${url} may be garbled`
  log.warn(`${base}\n${txt}`)

  const result = await showMessage(
    `${base}: ${txt.substring(0, 100)}`,
    'Skip And Show Details',
    'Apply at my own risk',
  )

  if (result === 'Apply at my own risk') {
    log.warn(`Apply ${url}`)
    return txt
  } else {
    log.show()
    return type === 'css' ? `/* ${base}, skip */` : `// ${base}, skip`
  }
}

async function parseResourceMeta<T extends ResourceType>(
  type: T,
  url: string,
  fn: (url: string, type: T) => Promisable<string>,
): Promise<ResourceMeta | undefined> {
  return [
    type,
    url,
    async () => {
      try {
        return await fn(url, type)
      } catch (error) {
        logError(`Fail to get content of [${url}]`, error)
        return undefined
      }
    },
  ]
}

type CacheInfo = {
  hasFailed: boolean
  urls: string[]
}

async function mergeAndWriteContent(
  resources: ResourceMeta[],
  useCached: boolean,
): Promise<void> {
  // Check if resources changed compared to cache
  if (useCached) {
    let cachedInfo: CacheInfo = {
      hasFailed: true,
      urls: [],
    }

    try {
      if (useCached && fs.existsSync(externalCacheInfoPath)) {
        cachedInfo = JSON.parse(readFileSync(externalCacheInfoPath, 'utf-8'))
      }
    } catch (error) {
      logError('Failed to read cache file', error)
    }

    const resourceUrls = new Set(resources.map(([type, url]) => `${type}:${url}`))
    if (
      !cachedInfo.hasFailed
      && resourceUrls.size === cachedInfo.urls.length
      && [...resourceUrls].every(url => cachedInfo.urls.includes(url))
    ) {
      log.info('No changes detected and no failed fetches, using cached content')
      return
    }
  }

  const resourcesByType: Record<
    ResourceType,
    { url: string, content: string }[]
  > = {
    'css': [],
    'js': [],
    'js-module': [],
  }

  // Track new fetch status
  let newCacheInfo: CacheInfo
  if (useCached) {
    newCacheInfo = {
      hasFailed: false,
      urls: [],
    }
  }

  for (const [type, url, contentFn] of resources) {
    const content = await contentFn()
    if (useCached) {
      newCacheInfo!.urls.push(`${type}:${url}`)
      if (!newCacheInfo!.hasFailed && !content) {
        newCacheInfo!.hasFailed = true
      }
    }
    if (content) {
      resourcesByType[type].push({ url, content })
    }
  }

  if (useCached) {
    try {
      writeFileSync(externalCacheInfoPath, JSON.stringify(newCacheInfo!, null, 2), 'utf-8')
    } catch (error) {
      logError('Failed to write cache file', error)
    }
  }

  try {
    const sep = '\n\n'
    writeFileSync(
      externalCssPath,
      resourcesByType.css.length > 0
        ? resourcesByType.css.map(r => `/* ${r.url} */\n${r.content}`).join(sep)
        : EMPTY_CSS,
      'utf-8',
    )

    writeFileSync(
      externalJsPath,
      resourcesByType.js.length > 0
        ? resourcesByType.js.map(r => `// ${r.url}\n${r.content}`).join(sep)
        : EMPTY_JS,
      'utf-8',
    )

    writeFileSync(
      externalJsModulePath,
      resourcesByType['js-module'].length > 0
        ? resourcesByType['js-module'].map(r => `// ${r.url}\n${r.content}`).join(sep)
        : EMPTY_JS_MODULE,
      'utf-8',
    )
  } catch (error) {
    logError('Failed to write external files', error)
  }
}

const entryJS = '<script src="./workbench.js" type="module"></script>'
const entryCSS = '<link rel="stylesheet" href="../../../workbench/workbench.desktop.main.css">'

export class ExternalFileManager extends BaseFileManager {
  constructor() {
    super(htmlPath, htmlBakPath)
    if (!htmlPath) {
      this.skipAll = () => 'No workbench html found, external resouces are disabled'
    }
  }

  async patch(content: string): Promise<string> {
    const strategy = config['external.loadStrategy']
    if (strategy === 'disable') {
      writeFileSync(externalCssPath, undefined)
      writeFileSync(externalJsPath, undefined)
      writeFileSync(externalJsModulePath, undefined)
      return content
    }

    await mergeAndWriteContent(
      await parseImports(
        (config['external.imports'] || []) as ResourceConfig[],
      ),
      strategy === 'cache',
    )
    return content
      .replace(
        entryJS,
        `${entryJS}
\t<!-- External Script Start -->
\t<script src="./${externalJsName}"></script>
\t<script src="./${externalJsModuleName}" type="module"></script>
\t<!-- External Script End -->
`,
      )
      .replace(
        entryCSS,
        `<!-- External Style Start -->
\t\t<link rel="stylesheet" href="./${externalCssName}"></link>
\t\t<!-- External Style End -->
\t\t${entryCSS}`,
      )
  }
}
