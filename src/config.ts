import { defineConfigObject } from 'reactive-vscode'
import * as Meta from './generated/meta'
import { showMessage } from './utils'

export const config = defineConfigObject<Meta.ScopedConfigKeyTypeMap>(
  Meta.scopedConfigs.scope,
  Meta.scopedConfigs.defaults,
)

export const editorConfig = defineConfigObject('editor', {
  fontFamily: String,
})

export function getFamilies() {
  return {
    monospace: config['font.monospace'] || editorConfig.fontFamily,
    sansSerif: config['font.sansSerif'],
  }
}

let last = hasElectronWindowOptions()
function hasElectronWindowOptions(): string {
  return JSON.stringify(config.electron)
}

export function logWindowOptionsChanged() {
  const current = hasElectronWindowOptions()
  if (last !== current) {
    const method = process.platform === 'darwin' ? 'Press "Command + Q"' : 'Close all windows'
    showMessage(`Note: Please TOTALLY restart VSCode (${method}) to take effect, "custom-ui-style.electron" is changed`)
  }
  last = current
}
