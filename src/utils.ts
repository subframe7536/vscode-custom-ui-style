import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path/posix'
import Url from 'node:url'

import { readFileSync, writeFileSync } from 'atomically'
import { commands } from 'vscode'

import { config } from './config'
import * as Meta from './generated/meta'
import { log, logError, showMessage } from './logger'
import { baseDir } from './path'
import { ManualRestartRequiredError, restartApp } from './restart'

export { logError, promptWarn, showMessage } from './logger'

export type Promisable<T> = T | Promise<T>

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
    void showMessage(
      `Note: Please TOTALLY restart VSCode (${method}) to take effect, "custom-ui-style.electron" is changed`,
    )
  }
  last = current
}

async function notifyManualRestartRequired(error: ManualRestartRequiredError) {
  log.warn(error.message)
  await showMessage(error.message)
}

export async function runAndRestart(
  message: string,
  fullRestart: boolean,
  action: () => Promise<any>,
  instantRestart = false,
) {
  let count = 5
  const check = () => fs.existsSync(lockFile)
  while (check() && count--) {
    log.warn('Lock file detected, waiting...')
    await new Promise((resolve) => setTimeout(resolve, 1000))
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
      const base = "This extension need to modify VSCode's source code but"
      if ('code' in err && err.code === 'EROFS') {
        logError(
          `${base} it runs on read-only filesystem. Maybe you need to choose another way to install VSCode`,
          err,
        )
        return
      } else if (
        err.message.includes('Maximum call stack size exceeded') ||
        ('code' in err && err.code === 'EACCES')
      ) {
        logError(
          `${base} current user is not allowed. Please run "sudo chown -R $(whoami) '${path.dirname(baseDir)}'" to grant permissions`,
          err,
        )
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
    if (instantRestart) {
      try {
        await restartApp()
      } catch (error) {
        if (error instanceof ManualRestartRequiredError) {
          await notifyManualRestartRequired(error)
        } else {
          throw error
        }
      }
      return
    }
    let shouldProceed: boolean
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
          if (error instanceof ManualRestartRequiredError) {
            await notifyManualRestartRequired(error)
          } else {
            logError('Fail to restart VSCode', error)
          }
        }
      } else {
        await commands.executeCommand('workbench.action.reloadWindow')
      }
    }
  }
}

export function escapeQuote(str: string) {
  return str.replaceAll(`'`, `\\'`).replaceAll(`"`, `\\"`)
}

export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: NodeJS.Timeout | undefined
  return Object.assign(
    (...args: Parameters<T>) => {
      clearTimeout(timer)
      timer = setTimeout(() => fn(...args), delay)
    },
    { dispose: () => clearTimeout(timer) },
  )
}

export function generateStyleFromObject(obj: Record<string, any>) {
  function gen(obj: Record<string, any>, styles = '') {
    for (const [prop, value] of Object.entries(obj)) {
      if (typeof value === 'string' || typeof value === 'number') {
        styles += `${prop}:${value};`
      } else if (typeof value === 'object' && value) {
        styles += `${prop}{${gen(value)}}`
      }
    }
    return styles
  }

  let style = ''
  for (const [selectors, val] of Object.entries(obj)) {
    let css: string
    if (typeof val === 'string') {
      css = val
    } else if (typeof val === 'object') {
      css = gen(val)
    } else {
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
  return url.replace(varRegex, (substr, key) => {
    if (key === 'userHome') {
      return os.homedir()
    } else if (key.startsWith('env:')) {
      const [_, envKey, optionalDefault] = key.split(':')
      return process.env[envKey] ?? optionalDefault ?? ''
    } else {
      return substr
    }
  })
}
