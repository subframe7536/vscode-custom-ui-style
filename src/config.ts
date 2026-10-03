import { workspace } from 'vscode'

import * as Meta from './generated/meta'

export const config = Object.defineProperties(
  {},
  Object.fromEntries(
    Object.entries(Meta.scopedConfigs.defaults).map(([key, defaultValue]) => [
      key,
      {
        enumerable: true,
        get: () => workspace.getConfiguration(Meta.scopedConfigs.scope).get(key, defaultValue),
      },
    ]),
  ),
) as Readonly<Meta.ScopedConfigKeyTypeMap>

export const ffKey = 'editor.fontFamily'

export function getFamilies() {
  return {
    monospace:
      config['font.monospace'] || workspace.getConfiguration().inspect<string>(ffKey)!.globalValue,
    sansSerif: config['font.sansSerif'],
  }
}
