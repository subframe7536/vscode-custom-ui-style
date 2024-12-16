import { readFileSync, writeFileSync } from 'atomically'
import { cssBakPath, cssPath, mainBakPath, mainPath, rendererBakPath, rendererPath, webviewHTMLBakPath, webviewHTMLPath } from './path'

function uninstall(srcPath: string, bakPath: string) {
  writeFileSync(srcPath, readFileSync(bakPath, 'utf-8'))
}

uninstall(cssPath, cssBakPath)
uninstall(mainPath, mainBakPath)
uninstall(rendererPath, rendererBakPath)
uninstall(webviewHTMLPath, webviewHTMLBakPath)
