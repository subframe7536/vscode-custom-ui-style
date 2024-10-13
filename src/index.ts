import { defineExtension, useCommand, watch } from 'reactive-vscode'
import { config, editorConfig } from './config'
import * as Meta from './generated/meta'
import { createFileManagers } from './manager'
import { debounce, showMessage } from './utils'

const { activate, deactivate } = defineExtension(() => {
  const { reload, rollback } = createFileManagers()

  useCommand(Meta.commands.reload, () => {
    reload('UI style changed')
  })
  useCommand(Meta.commands.rollback, () => {
    rollback('UI style rollback')
  })

  const watchAndReload = debounce(
    (fontChanged: boolean) => showMessage('Configuration changed, apply?', 'Apply', 'Cancel')
      .then<any>(item => item === 'Apply' && reload('UI style changed', fontChanged)),
    1500,
  )
  const startWatch = () => {
    const cleanup1 = watch(
      () => editorConfig.fontFamily,
      () => !config.monospace && watchAndReload(true),
    )
    const cleanup2 = watch(
      config,
      (conf, oldConf) => watchAndReload(
        conf.monospace !== oldConf.monospace || conf.sansSerif !== oldConf.sansSerif,
      ),
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
