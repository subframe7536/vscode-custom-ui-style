import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/uninstall.ts',
  ],
  format: ['cjs'],
  dts: false,
  external: [
    'vscode',
  ],
})
