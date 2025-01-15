import { useDisposable } from 'reactive-vscode'
import { window } from 'vscode'
import * as Meta from './generated/meta'

const outputChannel = useDisposable(window.createOutputChannel(Meta.displayName))

function createLoggerFunc(type: string) {
  return (...message: any[]) => {
    outputChannel.appendLine(`[${type}] ${message.join(' ')}`)
  }
}

export const log = {
  info: createLoggerFunc('INFO'),
  warn: createLoggerFunc('WARN'),
  error: createLoggerFunc('ERROR'),
  append: outputChannel.append.bind(outputChannel),
  appendLine: outputChannel.appendLine.bind(outputChannel),
  replace: outputChannel.replace.bind(outputChannel),
  clear: outputChannel.clear.bind(outputChannel),
  show: outputChannel.show.bind(outputChannel),
  hide: outputChannel.hide.bind(outputChannel),
}
