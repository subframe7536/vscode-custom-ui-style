import fs from 'node:fs'
import { readFileSync, writeFileSync } from 'atomically'

import * as paths from './path'

function uninstall(srcPath: string, bakPath: string) {
  if (fs.existsSync(srcPath)) {
    writeFileSync(srcPath, readFileSync(bakPath, 'utf-8'))
  }
}

uninstall(
  paths.cssPath,
  paths.cssBakPath,
)

uninstall(
  paths.mainPath,
  paths.mainBakPath,
)

uninstall(
  paths.rendererPath,
  paths.rendererBakPath,
)

uninstall(
  paths.webviewHTMLPath,
  paths.webviewHTMLBakPath,
)

uninstall(
  paths.htmlPath,
  paths.htmlBakPath,
)

uninstall(
  paths.productJSONPath,
  paths.productJSONBakPath,
)
