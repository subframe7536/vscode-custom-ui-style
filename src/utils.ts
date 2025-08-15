import type { AnyFunction } from '@subframe7536/type-utils'

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path/posix'
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
      logError('File locked, please retry later')
      return
    }
  }
  let success = true
  try {
    writeFileSync(lockFile, String(Date.now()))
  } catch (err) {
    if (err instanceof Error) {
      const base = 'This extension need to modify VSCode\'s source code but'
      if ('code' in err && err.code === 'EROFS') {
        logError(`${base} it runs on read-only filesystem. Maybe you need to choose another way to install VSCode`, err)
        return
      } else if (err.message.includes('Maximum call stack size exceeded')) {
        logError(`${base} current user is not allowed. Please run "sudo chown -R $(whoami) '${path.dirname(baseDir)}'" to grant permissions`, err)
        return
      }
    }
    logError('Unknown error in npm:atomically', err)
    return
  }
  try {
    logWindowOptionsChanged(fullRestart)
    await action()
  } catch (err) {
    logError('Fail to execute action', err)
    success = false
  } finally {
    try {
      fs.rmSync(lockFile)
    } catch {}
  }

  if (success) {
    let shouldProceed = false
    if (config.reloadWithoutPrompting) {
      shouldProceed = true
    } else {
      const item = await showMessage(
        message,
        fullRestart ? 'Restart APP' : 'Reload Window',
        'Cancel',
      )
      shouldProceed = item === 'Reload Window' || item === 'Restart APP'
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
}

export function logError(message: string, error?: unknown) {
  if (error instanceof Error) {
    const msg = `${message}, ${error}`
    log.error(msg)
    showMessage(msg)
  } else if (error) {
    log.error(message, error)
    showMessage(`${message}, Error: ${error}`)
  } else {
    log.error(message)
    showMessage(`Error: ${message}`)
  }
  log.show()
}

export function promptWarn(message: string) {
  log.warn(message)
  showMessage(message, 'Show logs')
    .then((result) => {
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

export function printFileTree(dir: string) {
  const tree = fs.readdirSync(dir, { recursive: true })
  return JSON.stringify(tree, null, 2)
}
