import { defineConfig } from 'tsdown'
import type { UserConfig } from 'tsdown'

const opts: UserConfig = {
  format: ['cjs'],
  dts: false,
  deps: {
    neverBundle: ['vscode'],
    onlyBundle: false,
  },
  outExtensions: () => ({ js: '.js' }),
  outputOptions: {
    codeSplitting: false,
  },
}

export default defineConfig([
  {
    entry: 'src/index.ts',
    ...opts,
  },
  {
    entry: 'src/uninstall.ts',
    ...opts,
  },
])
