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
  let { monospace, sansSerif } = config
  monospace ||= editorConfig.fontFamily
  return { monospace, sansSerif }
}
