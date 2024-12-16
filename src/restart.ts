// Reference from https://github.com/zokugun/vscode-sync-settings/blob/master/src/utils/restart-app.ts
import { spawn } from 'node:child_process'
import { readdirSync } from 'node:fs'
import path from 'node:path'
import { productJSONPath } from './path'

export async function restartApp(): Promise<void> {
  let sp
  switch (process.platform) {
    case 'darwin':
      sp = await restartMacOS()
      break
    case 'win32':
      sp = await restartWindows()
      break
    default:
      sp = await restartLinux()
  }
  sp.unref()
}

function getAppBinary(appHomeDir: string): string {
  // remove tunnel
  let files = readdirSync(appHomeDir).filter(file => !file.includes('-tunnel'))

  if (files.length === 1) {
    return path.join(appHomeDir, files[0])
  }

  if (process.platform === 'win32') {
    // select *.cmd
    files = files.filter(file => file.endsWith('.cmd'))

    if (files.length === 1) {
      return path.join(appHomeDir, files[0])
    }
  }

  throw new Error('Can determine binary path')
}

async function restartMacOS() {
  const { nameLong } = JSON.parse(productJSONPath) as { nameLong: string }

  const match = /(.*\.app)\/Contents\/Frameworks\//.exec(process.execPath)
  const appPath = match ? match[1] : `/Applications/${nameLong}.app`
  const binary = getAppBinary(`${appPath}/Contents/Resources/app/bin/`)

  return spawn(
    'osascript',
    [
      '-e',
      `quit app "${nameLong}"`,
      '-e',
      'delay 1',
      '-e',
      `do shell script quoted form of "${binary}"`,
    ],
    {
      detached: true,
      stdio: 'ignore',
    },
  )
}

async function restartWindows() {
  const appHomeDir = path.dirname(process.execPath)
  const exeName = path.basename(process.execPath)
  const binary = getAppBinary(`${appHomeDir}\\bin\\`)

  return spawn(
    process.env.comspec ?? 'cmd',
    [`/C taskkill /F /IM ${exeName} >nul && timeout /T 1 && "${binary}"`],
    {
      detached: true,
      stdio: 'ignore',
      windowsVerbatimArguments: true,
    },
  )
}

async function restartLinux() {
  const appHomeDir = path.dirname(process.execPath)
  const binary = getAppBinary(`${appHomeDir}/bin/`)

  return spawn(
    '/bin/sh',
    [
      '-c',
      `killall "${process.execPath}" && sleep 1 && killall -9 "${process.execPath}" && sleep 1 && "${binary}"`,
    ],
    {
      detached: true,
      stdio: 'ignore',
    },
  )
}
