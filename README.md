# Custom UI Style

<a href="https://marketplace.visualstudio.com/items?itemName=subframe7536.custom-ui-style" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/v/subframe7536.custom-ui-style.svg?color=eee&amp;label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>
<a href="https://kermanx.github.io/reactive-vscode/" target="__blank"><img src="https://img.shields.io/badge/made_with-reactive--vscode-%23007ACC?style=flat&labelColor=%23229863"  alt="Made with reactive-vscode" /></a>

VSCode extension that custom ui css style in both editor and webview

## Features

- Unified global font family
- Setup background image
- Custom nest stylesheet for both editor and webview

## Configurations

<!-- configs -->

| Key                                        | Description                                                         | Type     | Default    |
| ------------------------------------------ | ------------------------------------------------------------------- | -------- | ---------- |
| `custom-ui-style.monospace`                | Global monospace font family that apply in both editor and webview  | `string` | ``         |
| `custom-ui-style.sansSerif`                | Global sans-serif font family that apply in both editor and webview | `string` | ``         |
| `custom-ui-style.backgroundUrl`            |                                                                     | `string` | ``         |
| `custom-ui-style.backgroundOpacity`        | Background image opacity                                            | `number` | `0.9`      |
| `custom-ui-style.backgroundSize`           | Background image size                                               | `string` | `"cover"`  |
| `custom-ui-style.backgroundPosition`       | Background image size                                               | `string` | `"center"` |
| `custom-ui-style.stylesheet`               | Custom css for editor, support nest selectors                       | `object` | `{}`       |
| `custom-ui-style.webviewMonospaceSelector` | Custom monospace selector in webview                                | `array`  | ``         |
| `custom-ui-style.webviewSansSerifSelector` | Custom sans-serif selector in webview                               | `array`  | ``         |
| `custom-ui-style.webviewStylesheet`        | Custom css for webview, support nest selectors                      | `object` | `{}`       |

<!-- configs -->

## Commands

<!-- commands -->

| Command                    | Title                              |
| -------------------------- | ---------------------------------- |
| `custom-ui-style.reload`   | Custom UI Style: Load custom style |
| `custom-ui-style.rollback` | Custom UI Style: Rollback          |

<!-- commands -->

## License

MIT
