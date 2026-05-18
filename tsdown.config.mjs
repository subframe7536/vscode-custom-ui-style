import { defineConfig } from 'tsdown'

const opts = {
  format: ['cjs'],
  dts: false,
  deps: {
    neverBundle: ['vscode'],
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
