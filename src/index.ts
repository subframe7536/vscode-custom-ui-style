import { defineExtension, useCommand, useDisposable } from 'reactive-vscode'
import { workspace } from 'vscode'
import { config } from './config'
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

  useDisposable(
    workspace.onDidChangeConfiguration(
      debounce(
        e => (e.affectsConfiguration(Meta.name) || e.affectsConfiguration('editor.fontFamily'))
          && config.watch
          && showMessage('Configuration changed, apply now?', 'Yes', 'No')
            .then<any>(item => item === 'Yes' && reload(changedMsg)),
        1000,
      ),
    ),
  )
})

export { activate, deactivate }
