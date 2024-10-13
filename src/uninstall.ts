import { readFileSync, writeFileSync } from 'node:fs'
import { cssBakPath, cssPath, jsBakPath, jsPath, webviewHTMLBakPath, webviewHTMLPath } from './path'

function uninstall(srcPath: string, bakPath: string) {
  writeFileSync(srcPath, readFileSync(bakPath, 'utf-8'))
}

uninstall(cssPath, cssBakPath)
uninstall(jsPath, jsBakPath)
uninstall(webviewHTMLPath, webviewHTMLBakPath)
