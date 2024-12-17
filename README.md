<p align="center">
  <img height="128" src="./res/icon.png"></img>
  <h1 align="center">Custom UI Style</h1>
  <p align="center">
    <a href="https://marketplace.visualstudio.com/items?itemName=subframe7536.custom-ui-style" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/v/subframe7536.custom-ui-style.svg?color=eee&amp;label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>
    <a href="https://kermanx.github.io/reactive-vscode/" target="__blank"><img src="https://img.shields.io/badge/made_with-reactive--vscode-%23007ACC?style=flat&labelColor=%23229863"  alt="Made with reactive-vscode" /></a>
  </p>
</p>

VSCode extension that custom ui css style in both editor and webview

- Works with VSCode 1.96!

> [!warning]
> This extension works by editting the VSCode's css and js files.
>
> ~~So, a warning appears while the first time to install or VSCode update. You can click the [never show again] to avoid it.~~
> From V0.4.0, the warning will no longer prompt. #11

## Features

- Unified global font family
- Setup background image
- Custom nest stylesheet for both editor and webview
- Custom Electron BrowserWindow options
- [From V0.4.0] support total restart
- [From V0.4.0] suppress corrupt message

### Usage

When first installed or new VSCode version upgraded, the plugin will prompt to dump backup file.

After changing the configuration, please open command panel and run `Custom UI Style: Reload` to apply the configuration.

To rollback or uninstall the plugin, please open command panel and run `Custom UI Style: Rollback` to restore the original VSCode file.

See [details](https://github.com/shalldie/vscode-background?tab=readme-ov-file#warns)

### FAQ

#### No Effect?

If you are using Windows or Linux, make sure you have closed all the VSCode windows and then restart.

If you are using MacOS, press <kbd>Command + Q</kbd> first, then restart VSCode.

There are [guide](https://github.com/subframe7536/vscode-custom-ui-style/issues/1#issuecomment-2423660217) and [video](https://github.com/subframe7536/vscode-custom-ui-style/issues/2#issuecomment-2432225106) (MacOS) of the process.

#### RangeError: Maximum call stack size exceeded

Due to system permission restrictions, you will receive `RangeError: Maximum call stack size exceeded` prompt when you reload the configuration. You need to fully close (press <kbd>Command + Q</kbd>) VSCode first, then run:

```sh
sudo chown -R $(whoami) "/Applications/Visual Studio Code.app"
```

See #6

### Notice

Please make sure the VSCode is totally replaced while upgrading.

## Configurations

<!-- configs -->

| Key                                         | Description                                                                                                     | Type      | Default    |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------- | ---------- |
| `custom-ui-style.preferRestart`             | Prefer to restart vscode after update instead of reload window only (ALWAYS true when VSCode version >= 1.95.0) | `boolean` | `false`    |
| `custom-ui-style.reloadWithoutPrompting`    | Reload/restart immediately, instead of having to click 'Reload Window' in the notification                      | `boolean` | `false`    |
| `custom-ui-style.watch`                     | Watch configuration changes and reload window automatically                                                     | `boolean` | `true`     |
| `custom-ui-style.electron`                  | Electron BrowserWindow options                                                                                  | `object`  | `{}`       |
| `custom-ui-style.font.monospace`            | Global monospace font family that apply in both editor and webview, fallback to editor's font family            | `string`  | ``         |
| `custom-ui-style.font.sansSerif`            | Global sans-serif font family that apply in both editor and webview                                             | `string`  | ``         |
| `custom-ui-style.background.url`            | Full-screen background image url, support protocol: 'https://', 'file://', 'data:'                              | `string`  | ``         |
| `custom-ui-style.background.opacity`        | Background image opacity                                                                                        | `number`  | `0.9`      |
| `custom-ui-style.background.size`           | Background image size                                                                                           | `string`  | `"cover"`  |
| `custom-ui-style.background.position`       | Background image position                                                                                       | `string`  | `"center"` |
| `custom-ui-style.stylesheet`                | Custom css for editor, support nest selectors                                                                   | `object`  | `{}`       |
| `custom-ui-style.webview.monospaceSelector` | Custom monospace selector in webview                                                                            | `array`   | ``         |
| `custom-ui-style.webview.sansSerifSelector` | Custom sans-serif selector in webview                                                                           | `array`   | ``         |
| `custom-ui-style.webview.stylesheet`        | Custom css for webview, support nest selectors                                                                  | `object`  | `{}`       |

<!-- configs -->

## Commands

<!-- commands -->

| Command                    | Title                     |
| -------------------------- | ------------------------- |
| `custom-ui-style.reload`   | Custom UI Style: Reload   |
| `custom-ui-style.rollback` | Custom UI Style: Rollback |

<!-- commands -->

## Example

Avaiable CSS Variables:

- `--cus-monospace-font`: Target monospace font family
- `--cus-sans-font`: Target sans-serif font family

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
    },
    ".monaco-workbench .activitybar .monaco-action-bar": {
      "& .action-label": {
        "font-size": "20px !important",
        "&::before": {
          "position": "absolute",
          "z-index": 2
        },
        "&::after": {
          "content": "''",
          "width": "75%",
          "height": "75%",
          "position": "absolute",
          "border-radius": "6px"
        }
      },
      "& .action-item:hover .action-label": {
        "color": "var(--vscode-menu-selectionForeground) !important",
        "&::after": {
          "background-color": "var(--vscode-menu-selectionBackground)"
        }
      }
    }
  }
}
```

## Credit

- [APC](https://github.com/drcika/apc-extension)
- [Background](https://github.com/shalldie/vscode-background)
- [vscode-sync-settings](https://github.com/zokugun/vscode-sync-settings)
- [vscode-fix-checksums](https://github.com/RimuruChan/vscode-fix-checksums)

## License

MIT
