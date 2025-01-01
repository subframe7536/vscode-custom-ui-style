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

#### External Resources

From v0.4.2, the extension supports to load external CSS or JS file, from local file or remote. This operation may introduce security issue or runtime crash, use it with caution!

All resources will be fetched, merged and persist during reload, so there is no watcher support

```jsonc
{
  "custom-ui-style.external.enable": true,
  "custom-ui-style.external.imports": [
    // assume the script is ESM format
    "file://D:/data/test.js",
    "file:///Users/yourname/test.js",

    // Variable supports:
    // load from user home dir
    "file://${userHome}/test.css",
    // load according to environment variable (with optional fallback value)
    "file://${env:YOUR_ENV_NAME:optional_fallback_value}/other.js",

    // Remote resources will be downloaded
    {
      "type": "css",
      "url": "https://fonts.googleapis.com/css?family=Sofia",
    },
    {
      "type": "js",
      "url": "https://example.com/test.js",
    },
    {
      "type": "js-module",
      "url": "https://example.com/test.module.js",
    }
  ]
}
```

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

See in [#6](https://github.com/subframe7536/vscode-custom-ui-style/issues/6)

#### Fail to restart VSCode after adding remote JS file

The remote JS script is garbled or have syntax error, you may need to manually **truncate** the external file:

```
{VSCodeAppExecPath}/Resources/app/out/vs/electron-sandbox/workbench/external.js
{VSCodeAppExecPath}/Resources/app/out/vs/electron-sandbox/workbench/external.module.js
```

or just remove extra script import in
```
{VSCodeAppExecPath}/Resources/app/out/vs/electron-sandbox/workbench/workbench.html
```

### Notice

Please make sure the VSCode is totally replaced while upgrading.

## Configurations

<!-- configs -->

| Key                                         | Description                                                                                                                          | Type      | Default    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------- | ---------- |
| `custom-ui-style.preferRestart`             | Prefer to restart vscode after update instead of reload window only (ALWAYS true when VSCode version &gt;= 1.95.0)                   | `boolean` | `false`    |
| `custom-ui-style.reloadWithoutPrompting`    | Reload/restart immediately, instead of having to click 'Reload Window' in the notification                                           | `boolean` | `false`    |
| `custom-ui-style.watch`                     | Watch configuration changes and reload window automatically (ignore imports)                                                         | `boolean` | `true`     |
| `custom-ui-style.electron`                  | Electron BrowserWindow options                                                                                                       | `object`  | `{}`       |
| `custom-ui-style.font.monospace`            | Global monospace font family that apply in both editor and webview, fallback to editor's font family                                 | `string`  | ``         |
| `custom-ui-style.font.sansSerif`            | Global sans-serif font family that apply in both editor and webview                                                                  | `string`  | ``         |
| `custom-ui-style.background.url`            | Full-screen background image url (will not sync), support protocol: 'https://', 'file://', 'data:'                                   | `string`  | ``         |
| `custom-ui-style.background.remoteURL`      | Full-screen background image remote url (will sync), has lower priority than 'Url', support protocol: 'https://', 'file://', 'data:' | `string`  | ``         |
| `custom-ui-style.background.opacity`        | Background image opacity                                                                                                             | `number`  | `0.9`      |
| `custom-ui-style.background.size`           | Background image size                                                                                                                | `string`  | `"cover"`  |
| `custom-ui-style.background.position`       | Background image position                                                                                                            | `string`  | `"center"` |
| `custom-ui-style.external.loadStrategy`     | Load strategy for external CSS or JS resources                                                                                       | `string`  | `"fetch"`  |
| `custom-ui-style.external.imports`          | External CSS or JS resources, support protocol: 'https://', 'file://'                                                                | `array`   | ``         |
| `custom-ui-style.stylesheet`                | Custom css for editor, support nest selectors                                                                                        | `object`  | `{}`       |
| `custom-ui-style.webview.monospaceSelector` | Custom monospace selector in webview                                                                                                 | `array`   | ``         |
| `custom-ui-style.webview.sansSerifSelector` | Custom sans-serif selector in webview                                                                                                | `array`   | ``         |
| `custom-ui-style.webview.stylesheet`        | Custom css for webview, support nest selectors                                                                                       | `object`  | `{}`       |

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

```jsonc
{
  // Electron BrowserWindow options
  //  - https://www.electronjs.org/docs/latest/api/base-window
  //  - https://www.electronjs.org/docs/latest/api/browser-window
  "custom-ui-style.electron": {
    // Frameless window (no title bar, no macos traffic light buttons)
    //  - "A frameless window removes all chrome applied by the OS, including window controls"
    //  - https://www.electronjs.org/docs/latest/api/base-window#new-basewindowoptions
    //  - https://www.electronjs.org/docs/latest/tutorial/custom-window-styles#frameless-windows
    //  - https://www.electronjs.org/docs/latest/tutorial/custom-title-bar
    "frame": false,
    // Disable rounded corners (macos)
    //  - https://www.electronjs.org/docs/latest/api/base-window#new-basewindowoptions
    //  - "Whether frameless window should have rounded corners on macOS"
    //  - "Setting this property to false will prevent the window from being fullscreenable"
    "roundedCorners": false,
  },
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
- [Custom CSS and JS Loader](https://github.com/be5invis/vscode-custom-css)
- [vscode-sync-settings](https://github.com/zokugun/vscode-sync-settings)
- [vscode-fix-checksums](https://github.com/RimuruChan/vscode-fix-checksums)

## License

MIT
