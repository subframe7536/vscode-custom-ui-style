import { subfLint } from '@subf/config/oxlint'

const config = subfLint({
  options: {
    typeAware: true,
  },
  rules: {
    'class-methods-use-this': 'off',
  },
})

config.overrides?.push({
  files: ['src/**/*.ts'],
  rules: {
    'typescript/switch-exhaustiveness-check': [
      'error',
      { considerDefaultExhaustiveForUnions: true },
    ],
  },
})

export default config
