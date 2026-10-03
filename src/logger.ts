import { inspect } from 'node:util'

import { window } from 'vscode'

import * as Meta from './generated/meta'

export const outputChannel = window.createOutputChannel(Meta.displayName)

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

export function logError(message: string, error?: unknown) {
  if (error instanceof Error) {
    const msg = `${message}, ${error}`
    log.error(msg)
    void showMessage(msg)
  } else if (error) {
    log.error(message, error)
    void showMessage(`${message}, Error: ${inspect(error)}`)
  } else {
    log.error(message)
    void showMessage(`Error: ${message}`)
  }
  log.show()
}

export function promptWarn(message: string) {
  log.warn(message)
  void showMessage(message, 'Show logs').then((result) => {
    if (result === 'Show logs') {
      log.show()
    }
  })
}

export async function showMessage<T extends string[]>(
  content: string,
  ...buttons: T
): Promise<T[number] | undefined> {
  try {
    return await window.showInformationMessage(content, ...buttons)
  } catch (error) {
    logError('VSCode error', error)
  }
}
