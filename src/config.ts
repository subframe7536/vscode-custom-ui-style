import { defineConfigObject } from 'reactive-vscode'
import { workspace } from 'vscode'

import * as Meta from './generated/meta'

export const config = defineConfigObject<Meta.ScopedConfigKeyTypeMap>(
  Meta.scopedConfigs.scope,
  Meta.scopedConfigs.defaults,
)

export const ffKey = 'editor.fontFamily'

export function getFamilies() {
  return {
    monospace: config['font.monospace']
      || workspace.getConfiguration().inspect<string>(ffKey)!.globalValue,
    sansSerif: config['font.sansSerif'],
  }
}
