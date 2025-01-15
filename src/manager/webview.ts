import { createHash } from 'node:crypto'
import { config, getFamilies } from '../config'
import { webviewHTMLBakPath, webviewHTMLPath } from '../path'
import { escapeQuote, generateStyleFromObject } from '../utils'
import { log } from '../logger'
import { BaseFileManager } from './base'

const entry = `'<!DOCTYPE html>\\n' + newDocument.documentElement.outerHTML`

const defaultMonospaceSelector: string[] = ['.font-mono', 'code', 'pre', '.mono', '.monospace', 'kbd']
const defaultSansSerifSelector: string[] = ['.font-sans', '.github-markdown-body']

function getCSS() {
  const { monospace, sansSerif } = getFamilies()
  let result = ''
  if (monospace) {
    const monoSelectors = [...defaultMonospaceSelector, ...config['webview.monospaceSelector'] || []]
    result += `${monoSelectors}{font-family:${escapeQuote(monospace)}!important}`
  }
  if (sansSerif) {
    const sansSelectors = [...defaultSansSerifSelector, ...config['webview.sansSerifSelector'] || []]
    result += `${sansSelectors}{font-family:${escapeQuote(sansSerif)}!important}`
  }
  if (config['webview.stylesheet']) {
    result += generateStyleFromObject(config['webview.stylesheet'])
  }
  return result
}

export function fixSha256(html: string) {
  const [,scriptString] = html.match(/<script async type="module">([\s\S]*?)<\/script>/) || []
  if (!scriptString) {
    return html
  }
  const sha = createHash('sha256').update(scriptString).digest('base64')
  log.info('update script sha256', sha)
  return html.replace(/'sha256-[^']*'/, `'sha256-${sha}'`)
}

export class WebViewFileManager extends BaseFileManager {
  constructor() {
    super(webviewHTMLPath, webviewHTMLBakPath)
  }

  patch(content: string): string {
    return fixSha256(
      content.replace(
        entry,
        `${entry}.replace('</body>', '</body><style>${getCSS()}</style>')`,
      ),
    )
  }
}
