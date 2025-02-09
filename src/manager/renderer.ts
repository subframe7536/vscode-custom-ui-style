import { getFamilies } from '../config'
import { rendererBakPath, rendererPath } from '../path'
import { escapeQuote } from '../utils'
import { BaseFileManager } from './base'

// Code positions for font settings:
// https://github.com/microsoft/vscode/blob/main/src/vs/base/browser/ui/contextview/contextview.ts#L391-L430
// https://github.com/microsoft/vscode/blob/main/src/vs/workbench/browser/media/style.css#L10-L33
// https://github.com/microsoft/vscode/blob/main/src/vs/editor/common/config/editorOptions.ts#L5403-L5405
export const VSC_DFAULT_MONO_FONT = {
  win: `Consolas, 'Courier New'`,
  mac: `Menlo, Monaco, 'Courier New'`,
  linux: `'Droid Sans Mono', 'monospace'`,
}
export const VSC_DFAULT_SANS_FONT = {
  win: `"Segoe WPC", "Segoe UI"`,
  mac: `-apple-system, BlinkMacSystemFont`,
  linux: `system-ui, "Ubuntu", "Droid Sans"`,
}

export const VSC_NOTEBOOK_MONO_FONT = `"SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace`

export class RendererFileManager extends BaseFileManager {
  constructor() {
    super(rendererPath, rendererBakPath)
  }

  patch(content: string): string {
    let { monospace, sansSerif } = getFamilies()
    if (monospace) {
      monospace = escapeQuote(monospace)
      content = content
        .replaceAll(VSC_DFAULT_MONO_FONT.win, monospace)
        .replaceAll(VSC_DFAULT_MONO_FONT.mac, monospace)
        .replaceAll(VSC_DFAULT_MONO_FONT.linux, monospace)
        .replaceAll(VSC_NOTEBOOK_MONO_FONT, monospace)
    }
    if (sansSerif) {
      sansSerif = escapeQuote(sansSerif)
      content = content
        .replaceAll(VSC_DFAULT_SANS_FONT.win, sansSerif)
        .replaceAll(VSC_DFAULT_SANS_FONT.mac, sansSerif)
        .replaceAll(VSC_DFAULT_SANS_FONT.linux, sansSerif)
    }
    return content
  }
}
