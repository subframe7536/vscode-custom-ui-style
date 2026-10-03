import type { ConfigurationChangeEvent, ExtensionContext } from 'vscode'
import { commands, workspace } from 'vscode'

import { config, ffKey } from './config'
import * as Meta from './generated/meta'
import { outputChannel } from './logger'
import { createFileManagers } from './manager'
import { debounce, showMessage } from './utils'

const changedMsg = 'UI Style changed.'
const rollbackMsg = 'UI Style rollback.'

const configChangedMsg = 'Configuration changed, apply now?'
const newVersionMsg =
  'Seems like first time use or new version is installed, initialize and reload config now?'
const extensionUpdatedMsg = 'Seems like extensions are updated, reload config now?'
export function activate(context: ExtensionContext) {
  context.subscriptions.push(outputChannel)
  const { hasBakFile, hasBakExtFiles, reload, rollback } = createFileManagers()

  const requestReload = (msg: string, override = false) =>
    showMessage(msg, 'Yes', 'No').then((item) => {
      if (item === 'Yes') {
        return reload(changedMsg, override)
      }
    })

  if (!hasBakFile()) {
    void requestReload(newVersionMsg, true)
  } else if (!hasBakExtFiles()) {
    void requestReload(extensionUpdatedMsg)
  }

  const onConfigurationChanged = debounce((e: ConfigurationChangeEvent) => {
    if (!config.watch) {
      return
    }
    if (e.affectsConfiguration(Meta.name)) {
      void requestReload(configChangedMsg)
    } else if (e.affectsConfiguration(ffKey) && !config['font.monospace']) {
      const { globalValue, workspaceValue } = workspace.getConfiguration().inspect<string>(ffKey)!
      if (globalValue === workspaceValue) {
        void requestReload(configChangedMsg)
      }
    }
  }, 1000)
  context.subscriptions.push(
    commands.registerCommand(Meta.commands.reload, () => reload(changedMsg)),
    commands.registerCommand(Meta.commands.rollback, () => rollback(rollbackMsg)),
    commands.registerCommand(Meta.commands.cleanup, () => rollback(rollbackMsg, true)),
    onConfigurationChanged,
    workspace.onDidChangeConfiguration(onConfigurationChanged),
  )
}
