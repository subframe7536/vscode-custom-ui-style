import { Uri } from 'vscode'

import { config, getFamilies } from '../config'
import { cssBakPath, cssPath } from '../path'
import { fileProtocol, generateStyleFromObject, resolveVariable } from '../utils'

import { BaseFileManager } from './base'
import { VSC_DFAULT_SANS_FONT, VSC_NOTEBOOK_MONO_FONT } from './renderer'

function normalizeUrl(url: string) {
  url = url.replace(/\\/g, '/')
  if (!url.startsWith(fileProtocol)) {
    return url
  }
  // file:///Users/foo/bar.png => vscode-file://vscode-app/Users/foo/bar.png
  return Uri.parse(url.replace(fileProtocol, 'vscode-file://vscode-app')).toString()
}

function generateBackgroundCSS() {
  const url = config['background.url'] || resolveVariable(config['background.syncURL'] || '')
  if (!url) {
    return ''
  }
  return `
body:has(div[role=application]) {
  background-size: ${config['background.size']} !important;
  background-repeat: no-repeat !important;
  background-attachment: fixed !important; /* for code-server */
  background-position: ${config['background.position']} !important;
  opacity: ${config['background.opacity']} !important;
  background-image: url('${normalizeUrl(url)}') !important;
}`
}

function generateFontCSS() {
  let result = ''
  const { monospace, sansSerif } = getFamilies()
  if (monospace) {
    result += `
body {
  --cus-mono: ${monospace}, ${VSC_NOTEBOOK_MONO_FONT};
  --cus-monospace-font: var(--cus-mono);
}
span.monaco-keybinding-key,
.setting-list-row,
kbd {
  font-family: var(--cus-mono) !important;
}
.windows,
.mac,
.linux {
  --monaco-monospace-font: var(--cus-mono) !important;
}`
  }
  if (sansSerif) {
    result += `
body {
  --cus-sans: ${sansSerif};
  --cus-sans-font: var(--cus-sans);
  --vscode-font-family: var(--cus-sans);
}
.windows {
  font-family: var(--cus-sans), ${VSC_DFAULT_SANS_FONT.win} !important;
}
.mac {
  font-family: var(--cus-sans), ${VSC_DFAULT_SANS_FONT.mac} !important;
}
.linux {
  font-family: var(--cus-sans), ${VSC_DFAULT_SANS_FONT.linux} !important;
}`
  }
  return result
}

export class CssFileManager extends BaseFileManager {
  constructor() {
    super(cssPath, cssBakPath)
    this.cleanup = (content) =>
      content
        .replace(/\/\* Custom UI Style Start \*\/[\s\S]*?\/\* Custom UI Style End \*\//, '')
        .trim()
  }

  patch(content: string): string {
    return `${content}
/* Custom UI Style Start */
${generateBackgroundCSS()}
${generateFontCSS()}
${generateStyleFromObject(config.stylesheet)}
/* Custom UI Style End */
`
  }
}
