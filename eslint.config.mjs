import { defineEslintConfig } from '@subframe7536/eslint-config'

export default defineEslintConfig({
  type: 'app',
  ignoreRuleOnFile: {
    files: '**/*.md/*.jsonc',
    rules: [
      'jsonc/comma-dangle',
    ],
  },
})
