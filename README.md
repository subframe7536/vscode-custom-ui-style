<p align="center">
  <img height="128" src="./res/icon.png"></img>
  <h1 align="center">Custom UI Style</h1>
  <p align="center">
    <a href="https://marketplace.visualstudio.com/items?itemName=subframe7536.custom-ui-style" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/v/subframe7536.custom-ui-style.svg?color=eee&amp;label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>
    <a href="https://kermanx.github.io/reactive-vscode/" target="__blank"><img src="https://img.shields.io/badge/made_with-reactive--vscode-%23007ACC?style=flat&labelColor=%23229863"  alt="Made with reactive-vscode" /></a>
  </p>
</p>

VSCode extension that custom ui css style in both editor and webview

> [!warning]
> This extension works by editting the VSCode's css and js files.
>
> So, a warning appears while the first time to install or VSCode update. You can click the [never show again] to avoid it.
>
> And, you should run `Custom UI Style: reload` after VSCode is updated.
> See [details](https://github.com/shalldie/vscode-background?tab=readme-ov-file#warns)

## Features

- Unified global font family
- Setup background image
- Custom nest stylesheet for both editor and webview
- Custom Electron BrowserWindow options
  - No effect? See [process](https://github.com/subframe7536/vscode-custom-ui-style/issues/1#issuecomment-2423660217) and [video (Mac)](https://github.com/subframe7536/vscode-custom-ui-style/issues/2#issuecomment-2432225106)

## Configurations

<!-- configs -->

| Key                                           | Description                                                                                          | Type      | Default    |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------- | ---------- |
| `custom-ui-style.electron`                    | Electron BrowserWindow options                                                                       | `object`  | `{}`       |
| `custom-ui-style.font.monospace`              | Global monospace font family that apply in both editor and webview, fallback to editor's font family | `string`  | ``         |
| `custom-ui-style.font.sansSerif`              | Global sans-serif font family that apply in both editor and webview                                  | `string`  | ``         |
| `custom-ui-style.background.url`              | Full-screen background image url, support protocol: 'https://', 'file://', 'data:'                   | `string`  | ``         |
| `custom-ui-style.background.opacity`          | Background image opacity                                                                             | `number`  | `0.9`      |
| `custom-ui-style.background.size`             | Background image size                                                                                | `string`  | `"cover"`  |
| `custom-ui-style.background.position`         | Background image size                                                                                | `string`  | `"center"` |
| `custom-ui-style.stylesheet`                  | Custom css for editor, support nest selectors                                                        | `object`  | `{}`       |
| `custom-ui-style.webview.monospaceSelector`   | Custom monospace selector in webview                                                                 | `array`   | ``         |
| `custom-ui-style.webview.sansSerifSelector`   | Custom sans-serif selector in webview                                                                | `array`   | ``         |
| `custom-ui-style.webview.stylesheet`          | Custom css for webview, support nest selectors                                                       | `object`  | `{}`       |
| `custom-ui-style.applyOnConfigurationChanged` | Whether to apply styles when configuration changed, 1500ms debounce                                  | `boolean` | `false`    |

<!-- configs -->

## Commands

<!-- commands -->

| Command                    | Title                     |
| -------------------------- | ------------------------- |
| `custom-ui-style.reload`   | Custom UI Style: Reload   |
| `custom-ui-style.rollback` | Custom UI Style: Rollback |

<!-- commands -->

## Example

```json
{
  "custom-ui-style.font.sansSerif": "Maple UI, -apple-system",
  "custom-ui-style.background.url": "file:///D:/image/ide-bg.jpg",
  "custom-ui-style.webview.monospaceSelector": [".codeblock", ".prism [class*='language-']"],
  "custom-ui-style.stylesheet": {
    "span:not([class*='dyn-rule'])+span[class*='dyn-rule']": {
      "border-top-left-radius": "3px",
      "border-bottom-left-radius": "3px"
    },
    "span[class*='dyn-rule']:has(+span:not([class*='dyn-rule']))": {
      "border-top-right-radius": "3px",
      "border-bottom-right-radius": "3px"
    },
    ".cdr": {
      "border-radius": "3px"
    },
    ".quick-input-widget": {
      "top": "25vh !important"
    },
    ".overlayWidgets .editorPlaceholder": {
      "line-height": "unset !important"
    }
  }
}
```

## Credit

- [APC](https://github.com/drcika/apc-extension)
- [Background](https://github.com/shalldie/vscode-background)

## License

MIT
