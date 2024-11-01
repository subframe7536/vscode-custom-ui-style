import { defineExtension, useCommand } from 'reactive-vscode'
import * as Meta from './generated/meta'
import { createFileManagers } from './manager'
import { showMessage } from './utils'

const changedMsg = 'UI Style changed.'
const rollbackMsg = 'UI Style rollback.'

const { activate, deactivate } = defineExtension(() => {
  const { hasBakFile, reload, rollback } = createFileManagers()

  if (!hasBakFile()) {
    showMessage(
      'Seems like first time use or new version is installed, reload now?',
      'Reload',
      'Cancel',
    )
      .then<any>(item => item === 'Reload' && reload(changedMsg))
  }

  useCommand(Meta.commands.reload, () => reload(changedMsg))
  useCommand(Meta.commands.rollback, () => rollback(rollbackMsg))
})

export { activate, deactivate }
