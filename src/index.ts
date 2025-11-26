import { defineExtension, useCommand, useDisposable } from 'reactive-vscode'
import { workspace } from 'vscode'

import { config, ffKey } from './config'
import * as Meta from './generated/meta'
import { createFileManagers } from './manager'
import { debounce, showMessage } from './utils'

const changedMsg = 'UI Style changed.'
const rollbackMsg = 'UI Style rollback.'

const configChangedMsg = 'Configuration changed, apply now?'
const newVersionMsg = 'Seems like first time use or new version is installed, initialize and reload config now?'
const extensionUpdatedMsg = 'Seems like extensions are updated, reload config now?'
const { activate, deactivate } = defineExtension(() => {
  const { hasBakFile, hasBakExtFiles, reload, rollback } = createFileManagers()

  const requestReload = (msg: string, override = false) => showMessage(msg, 'Yes', 'No')
    .then<any>(item => item === 'Yes' && reload(changedMsg, override))

  if (!hasBakFile()) {
    requestReload(newVersionMsg, true)
  } else if (!hasBakExtFiles()) {
    requestReload(extensionUpdatedMsg)
  }

  useCommand(Meta.commands.reload, () => reload(changedMsg))
  useCommand(Meta.commands.rollback, () => rollback(rollbackMsg))

  useDisposable(
    workspace.onDidChangeConfiguration(
      debounce(
        (e) => {
          if (!config.watch) {
            return
          }
          if (e.affectsConfiguration(Meta.name)) {
            requestReload(configChangedMsg)
          } else if (e.affectsConfiguration(ffKey) && !config['font.monospace']) {
            const {
              globalValue,
              workspaceValue,
            } = workspace.getConfiguration().inspect<string>(ffKey)!
            if (globalValue === workspaceValue) {
              requestReload(configChangedMsg)
            }
          }
        },
        1000,
      ),
    ),
  )
})

export { activate, deactivate }
