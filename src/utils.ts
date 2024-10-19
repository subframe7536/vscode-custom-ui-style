import type { AnyFunction } from '@subframe7536/type-utils'
import { existsSync, rmSync } from 'node:fs'
import path from 'node:path'
import { readFileSync, writeFileSync } from 'atomically'
import { useLogger } from 'reactive-vscode'
import { commands, window } from 'vscode'
import { displayName, name } from './generated/meta'
import { baseDir } from './path'

export const log = useLogger(displayName)

const lockFile = path.join(baseDir, `__${name}__.lock`)

export async function runAndRestart(message: string, action: () => Promise<any>) {
  let count = 5
  const check = () => existsSync(lockFile)
  while (check() && count--) {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  if (!count) {
    // If exists and expire time exceed 10 minutes, just remove it
    if (check() && Number(readFileSync(lockFile, 'utf-8')) - Date.now() > 6e5) {
      rmSync(lockFile)
    } else {
      await showMessage('File locked, cancel operation')
      return
    }
  }
  try {
    writeFileSync(lockFile, String(Date.now()))
    await action()
    const item = await window.showInformationMessage(message, { title: 'Restart vscode' })
    if (item) {
      commands.executeCommand('workbench.action.reloadWindow')
    }
  } catch (e) {
    log.error(e)
    showMessage(`Fail to execute action, ${e}`)
  } finally {
    rmSync(lockFile)
  }
}

export async function showMessage<T extends string[]>(
  content: string,
  ...buttons: T
): Promise<T[number] | undefined> {
  return await window.showInformationMessage(content, ...buttons)
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
