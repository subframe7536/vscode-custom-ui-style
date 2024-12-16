import type { AnyFunction } from '@subframe7536/type-utils'
import fs from 'node:fs'
import path from 'node:path'
import { readFileSync, writeFileSync } from 'atomically'
import { useLogger } from 'reactive-vscode'
import { commands, version, window } from 'vscode'
import { displayName, name } from './generated/meta'
import { baseDir } from './path'
import { restartApp } from './restart'

export const log = useLogger(displayName)

const lockFile = path.join(baseDir, `__${name}__.lock`)

export async function runAndRestart(message: string, action: () => Promise<any>) {
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
      await action()
    } catch (error) {
      log.error(`Fail to execute action,`, error)
      showMessage(`Fail to execute action: ${error}`)
      success = false
    }
    if (success) {
      const item = await showMessage(message, 'Reload Window', 'Cancel')
      if (item === 'Reload Window') {
        if (checkIsVSCodeUsingESM()) {
          try {
            await restartApp()
          } catch (error) {
            log.error('Fail to restart VSCode', (error as Error).message, (error as Error).stack)
            showMessage(`Fail to restart VSCode, ${error}`)
          }
        } else {
          commands.executeCommand('workbench.action.reloadWindow')
        }
      }
    }
  } catch (e) {
    log.error(`npm:atomically error,`, e)
    showMessage(`npm:atomically error: ${e}, maybe you need to enhance VSCode's permissions?`)
  } finally {
    fs.rmSync(lockFile)
  }
}

/**
 * Version >= 1.95
 */
function checkIsVSCodeUsingESM() {
  const versionArray = version.split('.').map(Number)
  return versionArray[0] === 1 && versionArray[1] >= 95
}

export async function showMessage<T extends string[]>(
  content: string,
  ...buttons: T
): Promise<T[number] | undefined> {
  try {
    return await window.showInformationMessage(content, ...buttons)
  } catch (error) {
    log.error('VSCode error:', error)
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
