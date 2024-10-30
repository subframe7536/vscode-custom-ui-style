import { defineExtension, useCommand, watch } from 'reactive-vscode'
import { config, editorConfig } from './config'
import * as Meta from './generated/meta'
import { createFileManagers } from './manager'
import { debounce, showMessage } from './utils'

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

  const startWatch = () => {
    const watchAndReload = debounce(
      () => showMessage('Configuration changed, apply?', 'Apply', 'Cancel')
        .then<any>(item => item === 'Apply' && reload(changedMsg)),
      1500,
    )
    const cleanup1 = watch(
      () => editorConfig.fontFamily,
      () => !config['font.monospace'] && watchAndReload(),
    )
    const cleanup2 = watch(
      config,
      () => watchAndReload(),
    )
    return () => {
      cleanup1()
      cleanup2()
    }
  }

  let cleanup = () => {}

  watch(() => config.applyOnConfigurationChanged, (is) => {
    if (is) {
      cleanup = startWatch()
    } else {
      cleanup()
    }
  }, { immediate: true })
})

export { activate, deactivate }
