import fs from 'node:fs'

import { createExtensionFileManagers } from './manager/extension'
import * as paths from './path'

function uninstall(srcPath: string, bakPath: string) {
  if (fs.existsSync(srcPath)) {
    fs.renameSync(bakPath, srcPath)
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

if (paths.htmlPath) {
  uninstall(
    paths.htmlPath,
    paths.htmlBakPath,
  )
}

uninstall(
  paths.productJSONPath,
  paths.productJSONBakPath,
)

for (const manager of createExtensionFileManagers(true)) {
  uninstall(manager.srcPath, manager.bakPath)
}
