import { defineExtension, useCommand, watch } from 'reactive-vscode'
import { config, editorConfig } from './config'
import * as Meta from './generated/meta'
import { createFileManagers } from './manager'

const { activate, deactivate } = defineExtension(() => {
  const { reload, rollback } = createFileManagers()
  useCommand(Meta.commands.reload, () => {
    reload('UI style changed')
  })
  useCommand(Meta.commands.rollback, () => {
    rollback('UI style rollback')
  })

  watch(
    () => editorConfig.fontFamily,
    () => !config.monospace && reload('Configuration changed, reload'),
  )
  watch(
    config,
    () => reload('Configuration changed, reload'),
  )
})

export { activate, deactivate }
