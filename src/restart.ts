// Reference from https://github.com/zokugun/vscode-sync-settings/blob/master/src/utils/restart-app.ts
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { readFileSync } from 'atomically'

import { log } from './logger'
import { baseDir, productJSONPath } from './path'

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

function getAppBinary(...binDirectories: string[]): string {
  for (const dir of binDirectories) {
    if (!fs.existsSync(dir)) {
      continue
    }
    // remove tunnel
    let files = fs.readdirSync(dir).filter(file => !file.includes('-tunnel'))

    if (process.platform === 'win32') {
      // select *.cmd
      files = files.filter(file => file.endsWith('.cmd'))

      if (files.length > 0) {
        return path.join(dir, files[0])
      }
    } else if (files.length > 0) {
      return path.join(dir, files[0])
    }
  }

  // Fallback to using `which` to locate `vscode` or `vscode-insiders`
  const fallbackPaths = ['code-insiders', 'code']
  for (const p of fallbackPaths) {
    try {
      const target = spawnSync('which', [p], { encoding: 'utf-8' }).stdout.trim()
      if (target) {
        return target
      }
    } catch {
    }
  }

  throw new Error(`Cannot find binary path in [${binDirectories}]`)
}

async function restartMacOS() {
  const { nameLong } = JSON.parse(readFileSync(productJSONPath, 'utf-8')) as { nameLong: string }

  const match = /(.*\.app)\/Contents\/Frameworks\//.exec(process.execPath)
  const appPath = match ? match[1] : `/Applications/${nameLong}.app`
  const binary = getAppBinary(`${appPath}/Contents/Resources/app/bin/`)

  return spawn(
    'osascript',
    [
      '-e',
      `quit app "${nameLong}"`,
      '-e',
      'repeat with i from 1 to 100',
      '-e',
      `if not (application "${nameLong}" is running) then exit repeat`,
      '-e',
      'delay 0.1',
      '-e',
      'end repeat',
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
  const exeName = path.basename(process.execPath, '.exe')
  const binary = getAppBinary(`${appHomeDir}\\bin\\`, `${path.dirname(baseDir)}\\bin\\`)

  const checkScript = [
    'for ($i = 0; $i -lt 100; $i++) {',
    `    $vscodeProcess = Get-Process '${exeName}' -ErrorAction SilentlyContinue;`,
    '    if ($vscodeProcess -eq $null) {',
    '        exit',
    '    }',
    '    Start-Sleep -Milliseconds 100',
    '}',
  ].join('')
  const batchScript = `taskkill /F /IM "${exeName}.exe" >nul && powershell -Command "${checkScript}" && "${binary}"`

  return spawn(
    process.env.comspec ?? 'cmd',
    [`/C ${batchScript}`],
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
  const processName = path.basename(process.execPath)

  return spawn(
    '/bin/sh',
    [
      '-c',
      `
      pkill -f "${processName}"
      counter=0
      while pgrep -f "${processName}" > /dev/null && [ $counter -lt 100 ]; do
        sleep 0.1
        counter=$((counter + 1))
      done
      "${binary}"
      `,
    ],
    {
      detached: true,
      stdio: 'ignore',
    },
  )
}
