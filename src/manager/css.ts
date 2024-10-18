import type { Promisable } from '@subframe7536/type-utils'
import { config, getFamilies } from '../config'
import { cssBakPath, cssPath, normalizeUrl } from '../path'
import { generateStyleFromObject } from '../utils'
import { BaseFileManager } from './base'
import { VSC_DFAULT_SANS_FONT, VSC_NOTEBOOK_MONO_FONT } from './renderer'

const banner = '/* Custom UI Style Start */'
const footer = '/* Custom UI Style End */'

function generateBackgroundCSS() {
  const url = config['background.url']
  if (!url) {
    return ''
  }
  return `
body:has([id='workbench.parts.editor']) {
    background-size: ${config['background.size']};
    background-repeat: no-repeat;
    background-attachment: fixed; // for code-server
    background-position: ${config['background.position']};
    opacity: ${config['background.opacity']};
    background-image: url('${normalizeUrl(url)}');
}`
}

function generateFontCSS() {
  let result = ''
  const { monospace, sansSerif } = getFamilies()
  if (monospace) {
    result += `
span.monaco-keybinding-key, .setting-list-row {
  font-family: ${monospace}, ${VSC_NOTEBOOK_MONO_FONT} !important;
}
.windows,
.mac,
.linux {
  --monaco-monospace-font: ${monospace}, ${VSC_NOTEBOOK_MONO_FONT} !important;
}`
  }
  if (sansSerif) {
    result += `
.windows {
  font-family: ${sansSerif}, ${VSC_DFAULT_SANS_FONT.win} !important;
}
.mac {
  font-family: ${sansSerif}, ${VSC_DFAULT_SANS_FONT.mac} !important;
}
.linux {
  font-family: ${sansSerif}, ${VSC_DFAULT_SANS_FONT.linux} !important;
}`
  }
  return result
}

export class CssFileManager extends BaseFileManager {
  constructor() {
    super(cssPath, cssBakPath)
  }

  patch(_fontChanged: boolean, content: () => string): Promisable<string | undefined> {
    return `${content()}
${banner}
${generateBackgroundCSS()}
${generateFontCSS()}
${generateStyleFromObject(config.stylesheet)}
${footer}
`
  }
}
