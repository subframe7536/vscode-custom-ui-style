import { config, getFamilies } from '../config'
import { getCssImports } from '../imports'
import { cssBakPath, cssPath, normalizeUrl } from '../path'
import { generateStyleFromObject } from '../utils'
import { BaseFileManager } from './base'
import { VSC_DFAULT_SANS_FONT, VSC_NOTEBOOK_MONO_FONT } from './renderer'

function generateBackgroundCSS() {
  const url = config['background.url'] || config['background.remoteURL']
  if (!url) {
    return ''
  }
  return `
body:has(div[role=application]) {
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
body {
  --cus-monospace-font: ${monospace}, ${VSC_NOTEBOOK_MONO_FONT};
}
span.monaco-keybinding-key,
.setting-list-row,
kbd {
  font-family: var(--cus-monospace-font) !important;
}
.windows,
.mac,
.linux {
  --monaco-monospace-font: var(--cus-monospace-font) !important;
}`
  }
  if (sansSerif) {
    result += `
body {
  --cus-sans-font: ${sansSerif};
}
.windows {
  font-family: var(--cus-sans-font), ${VSC_DFAULT_SANS_FONT.win} !important;
}
.mac {
  font-family: var(--cus-sans-font), ${VSC_DFAULT_SANS_FONT.mac} !important;
}
.linux {
  font-family: var(--cus-sans-font), ${VSC_DFAULT_SANS_FONT.linux} !important;
}`
  }
  return result
}

export class CssFileManager extends BaseFileManager {
  constructor() {
    super(cssPath, cssBakPath)
  }

  async patch(content: string): Promise<string> {
    return `${content}
/* Custom UI Style Start */${await getCssImports()}
${generateBackgroundCSS()}
${generateFontCSS()}
${generateStyleFromObject(config.stylesheet)}
/* Custom UI Style End */
`
  }
}
