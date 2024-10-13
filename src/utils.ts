import { useLogger } from 'reactive-vscode'
import { commands, window } from 'vscode'
import { displayName } from './generated/meta'

export const logger = useLogger(displayName)

export async function runAndRestart(message: string, action: () => Promise<any>) {
  await action()
  const item = await window.showInformationMessage(message, { title: 'Restart vscode' })
  if (item) {
    commands.executeCommand('workbench.action.reloadWindow')
  }
}

export async function showMessage(content: string) {
  await window.showInformationMessage(content)
}

export function escapeQuote(str: string) {
  return str
    .replaceAll(`'`, `\\'`)
    .replaceAll(`"`, `\\"`)
}

export function captialize(text: string) {
  return text[0].toUpperCase() + text.substring(1)
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
