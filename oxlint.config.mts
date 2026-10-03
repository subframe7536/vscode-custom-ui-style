import { subfLint } from '@subf/config/oxlint'

export default subfLint({
  options: {
    typeAware: true,
  },
  rules: {
    'class-methods-use-this': 'off',
  },
})
