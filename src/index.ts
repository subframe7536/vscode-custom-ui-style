import { defineExtension, useCommand, watch } from 'reactive-vscode'
import { config, editorConfig } from './config'
import * as Meta from './generated/meta'
import { createFileManagers } from './manager'
import { debounce, showMessage } from './utils'

const { activate, deactivate } = defineExtension(() => {
  const { hasBakFile, reload, rollback } = createFileManagers()

  if (!hasBakFile()) {
    showMessage(
      'Seems like first time use or new version is installed, reload the configuration now?',
      'Reload',
      'Cancel',
    )
      .then<any>(item => item === 'Reload' && reload('UI style changed'))
  }

  useCommand(Meta.commands.reload, () => reload('UI style changed'))
  useCommand(Meta.commands.rollback, () => rollback('UI style rollback'))

  const watchAndReload = debounce(
    () => showMessage('Configuration changed, apply?', 'Apply', 'Cancel')
      .then<any>(item => item === 'Apply' && reload('UI style changed')),
    1500,
  )
  const startWatch = () => {
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
  })
})

export { activate, deactivate }
