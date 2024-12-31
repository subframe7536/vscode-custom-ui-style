import type { Promisable } from '@subframe7536/type-utils'
import { writeFileSync } from 'atomically'
import { getJsImports, getJsModuleImports } from '../imports'
import { externalJsModuleName, externalJsModulePath, externalJsName, externalJsPath, htmlBakPath, htmlPath } from '../path'
import { BaseFileManager } from './base'

const entry = '<script src="./workbench.js" type="module"></script>'

export class HTMLFileManager extends BaseFileManager {
  constructor() {
    super(htmlPath, htmlBakPath)
  }

  patch(content: string): string {
    writeFileSync(externalJsPath, getJsImports(), 'utf-8')
    writeFileSync(externalJsModulePath, getJsModuleImports(), 'utf-8')
    return content.replace(
      entry,
      `${entry}
  <!-- External Script Start -->
  <script src="./${externalJsName}"></script>
  <script src="./${externalJsModuleName}" type="module"></script>
  <!-- External Script End -->
`,
    )
  }
}
