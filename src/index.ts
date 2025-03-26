import { defineExtension, useCommand, useDisposable } from 'reactive-vscode'
import { workspace } from 'vscode'
import { config, ffKey } from './config'
import * as Meta from './generated/meta'
import { createFileManagers } from './manager'
import { debounce, showMessage } from './utils'

const changedMsg = 'UI Style changed.'
const rollbackMsg = 'UI Style rollback.'

const { activate, deactivate } = defineExtension(() => {
  const { hasBakFile, reload, rollback } = createFileManagers()

  if (!hasBakFile()) {
    showMessage(
      'Seems like first time use or new version is installed, initialize and reload config now?',
      'Yes',
      'No',
    )
      .then<any>(item => item === 'Yes' && reload(changedMsg))
  }

  useCommand(Meta.commands.reload, () => reload(changedMsg))
  useCommand(Meta.commands.rollback, () => rollback(rollbackMsg))

  const notifyChanged = () => showMessage(
    'Configuration changed, apply now?',
    'Yes',
    'No',
  )
    .then<any>(item => item === 'Yes' && reload(changedMsg))

  useDisposable(
    workspace.onDidChangeConfiguration(
      debounce(
        (e) => {
          if (!config.watch) {
            return
          }
          if (e.affectsConfiguration(Meta.name)) {
            notifyChanged()
          } else if (e.affectsConfiguration(ffKey) && !config['font.monospace']) {
            const {
              globalValue,
              workspaceValue,
            } = workspace.getConfiguration().inspect<string>(ffKey)!
            if (globalValue === workspaceValue) {
              notifyChanged()
            }
          }
        },
        1000,
      ),
    ),
  )
})

export { activate, deactivate }
