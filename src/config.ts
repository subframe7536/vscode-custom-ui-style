import { defineConfigObject } from 'reactive-vscode'
import * as Meta from './generated/meta'

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
