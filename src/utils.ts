import type { AnyFunction } from '@subframe7536/type-utils'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import Url from 'node:url'
import { readFileSync, writeFileSync } from 'atomically'
import { commands, window } from 'vscode'
import { config } from './config'
import * as Meta from './generated/meta'
import { log } from './logger'
import { baseDir } from './path'
import { restartApp } from './restart'

export const fileProtocol = 'file://'
export const httpsProtocol = 'https://'

const lockFile = path.join(baseDir, `__${Meta.name}__.lock`)

let last = hasElectronWindowOptions()
function hasElectronWindowOptions(): string {
  return JSON.stringify(config.electron)
}

function logWindowOptionsChanged(useFullRestart: boolean) {
  const current = hasElectronWindowOptions()
  if (last !== current) {
    if (useFullRestart) {
      return
    }
    const method = process.platform === 'darwin' ? 'Press "Command + Q"' : 'Close all windows'
    showMessage(`Note: Please TOTALLY restart VSCode (${method}) to take effect, "custom-ui-style.electron" is changed`)
  }
  last = current
}

export async function runAndRestart(message: string, fullRestart: boolean, action: () => Promise<any>) {
  let count = 5
  const check = () => fs.existsSync(lockFile)
  while (check() && count--) {
    log.warn('Lock file detected, waiting...')
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  if (!count) {
    // If exists and expire time exceed 10 minutes, just remove it
    if (check() && Number(readFileSync(lockFile, 'utf-8')) - Date.now() > 6e5) {
      log.warn('Lock file timeout, remove and continue')
      fs.rmSync(lockFile)
    } else {
      log.error('File locked:', lockFile)
      await showMessage('File locked, cancel operation')
      return
    }
  }
  try {
    writeFileSync(lockFile, String(Date.now()))
    let success = true
    try {
      logWindowOptionsChanged(fullRestart)
      await action()
    } catch (error) {
      logError('Fail to execute action', error)
      success = false
    }
    if (success) {
      let shouldProceed = false
      if (config.reloadWithoutPrompting) {
        shouldProceed = true
      } else {
        const item = await showMessage(message, 'Reload Window', 'Cancel')
        shouldProceed = item === 'Reload Window'
      }
      if (shouldProceed) {
        if (fullRestart) {
          try {
            await restartApp()
          } catch (error) {
            logError('Fail to restart VSCode', error)
          }
        } else {
          commands.executeCommand('workbench.action.reloadWindow')
        }
      }
    }
  } catch (e) {
    logError(`npm:atomically error, maybe you need to enhance VSCode's permissions?`, e)
  } finally {
    fs.rmSync(lockFile)
  }
}

export function logError(message: string, error?: unknown) {
  if (error instanceof Error) {
    const msg = `${message}, ${error.message}`
    log.error(msg)
    showMessage(msg)
  } else if (error) {
    log.error(message, error)
    showMessage(`${message}, Error: ${error}`)
  } else {
    log.error(message)
    showMessage(`Error: ${message}`)
  }
}

export function promptWarn(message: string) {
  log.warn(message)
  showMessage(message)
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

export function escapeQuote(str: string) {
  return str
    .replaceAll(`'`, `\\'`)
    .replaceAll(`"`, `\\"`)
}

export function debounce<T extends AnyFunction<void>>(fn: T, delay: number): T {
  let timer: NodeJS.Timeout
  return ((...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as T
}

export function generateStyleFromObject(obj: Record<string, any>) {
  function gen(obj: Record<string, any>, styles = '') {
    for (const [prop, value] of Object.entries(obj)) {
      switch (typeof value) {
        case 'string':
        case 'number':
          styles += `${prop}:${value};`
          break
        case 'object':
          if (value) {
            styles += `${prop}{${gen(value)}}`
          }
          break
      }
    }
    return styles
  }

  let style = ''
  for (const [selectors, val] of Object.entries(obj)) {
    let css = ''
    switch (typeof val) {
      case 'string':
        css = val
        break
      case 'object':
        css = gen(val)
        break
      default:
        continue
    }
    style += `${selectors}{${css}}`
  }
  return style
}
export function parseFilePath(url: string): string {
  if (url.startsWith('file://')) {
    return Url.fileURLToPath(resolveVariable(url))
  } else {
    return url
  }
}
const varRegex = /\$\{([^{}]+)\}/g
export function resolveVariable(url: string): string {
  return url.replace(
    varRegex,
    (substr, key) => {
      if (key === 'userHome') {
        return os.homedir()
      } else if (key.startsWith('env:')) {
        const [_, envKey, optionalDefault] = key.split(':')
        return process.env[envKey] ?? optionalDefault ?? ''
      } else {
        return substr
      }
    },
  )
}
