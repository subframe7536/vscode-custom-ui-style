import type { Promisable } from '@subframe7536/type-utils'
import type { ConfigShorthandMap } from '../generated/meta'
import { config, getFamilies } from '../config'
import { normalizeUrl } from '../path'
import { captialize, generateStyleFromObject } from '../utils'
import { BaseFileManager } from './base'
import { VSC_DFAULT_SANS_FONT, VSC_NOTEBOOK_MONO_FONT } from './js'

const banner = '/* Custom UI Style Start */'
const footer = '/* Custom UI Style End */'

function generateBackgroundCSS() {
  const url = config.backgroundUrl
  if (!url) {
    return ''
  }
  return `body {
    background-size: ${config.backgroundSize};
    background-repeat: no-repeat;
    background-attachment: fixed; // for code-server
    background-position: ${config.backgroundPosition};
    opacity: ${config.backgroundOpacity};
    background-image: url('${normalizeUrl(url)}');
}`
}

function generateFontCSS() {
  let result = ''
  const { monospace, sansSerif } = getFamilies()
  if (monospace) {
    result += `span.monaco-keybinding-key, .setting-list-row {
  font-family: ${monospace}, ${VSC_NOTEBOOK_MONO_FONT} !important;
}
.windows,
.mac,
.linux {
  --monaco-monospace-font: ${monospace}, ${VSC_NOTEBOOK_MONO_FONT} !important;";
}`
  }
  if (sansSerif) {
    result += `.windows {
  font-family: ${sansSerif}, ${VSC_DFAULT_SANS_FONT.win} !important;";
}
.mac {
  font-family: ${sansSerif}, ${VSC_DFAULT_SANS_FONT.mac} !important;";
}
.linux {
  font-family: ${sansSerif}, ${VSC_DFAULT_SANS_FONT.linux} !important;";
}`
  }
  return result
}

export class CssFileManager extends BaseFileManager {
  patch(content: string): Promisable<string> {
    return `${content}
${banner}
${generateBackgroundCSS()}
${generateFontCSS()}
${generateStyleFromObject(config.stylesheet)}
${footer}
`
  }
}
