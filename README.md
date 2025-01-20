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
> From V0.4.0, the warning will no longer prompt after fully restart. #11

## Features

- Unified global font family
- Setup background image
- Custom nest stylesheet for both editor and webview
- Custom Electron `BrowserWindow` options
- [From V0.4.0] Support total restart
- [From V0.4.0] Suppress corrupt message
- [From V0.4.2] Load external CSS or JS file

## Usage

When first installed or new VSCode version upgraded, the plugin will prompt to dump backup file.

After changing the configuration, please open command panel and run `Custom UI Style: Reload` to apply the configuration.

To rollback or uninstall the plugin, please open command panel and run `Custom UI Style: Rollback` to restore the original VSCode file.

See [details](https://github.com/shalldie/vscode-background?tab=readme-ov-file#warns)

### Example

Avaiable CSS Variables:

- `--cus-monospace-font`: Target monospace font family
- `--cus-sans-font`: Target sans-serif font family

```jsonc
{
  // Electron BrowserWindow options
  //  - https://www.electronjs.org/docs/latest/api/base-window
  //  - https://www.electronjs.org/docs/latest/api/browser-window
  "custom-ui-style.electron": {
    // Frameless window (no title bar, no MacOS traffic light buttons)
    //  - "A frameless window removes all chrome applied by the OS, including window controls"
    //  - https://www.electronjs.org/docs/latest/api/base-window#new-basewindowoptions
    //  - https://www.electronjs.org/docs/latest/tutorial/custom-window-styles#frameless-windows
    //  - https://www.electronjs.org/docs/latest/tutorial/custom-title-bar
    "frame": false,
    // Disable rounded corners (MacOS)
    //  - https://www.electronjs.org/docs/latest/api/base-window#new-basewindowoptions
    //  - "Whether frameless window should have rounded corners on MacOS"
    //  - "Setting this property to false will prevent the window from being fullscreenable"
    "roundedCorners": false,
  },
  "custom-ui-style.font.sansSerif": "Maple UI, -apple-system",
  "custom-ui-style.background.url": "file:///D:/image/ide-bg.jpg",
  "custom-ui-style.webview.monospaceSelector": [".codeblock", ".prism [class*='language-']"],
  // Custom stylesheet, support native nest selectors
  "custom-ui-style.stylesheet": {
    "kbd, .statusbar": {
      "font-family": "var(--cus-monospace-font)",
    },
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
    ".monaco-findInput .monaco-inputbox": {
      "width": "calc(100% + 6px)"
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

### External Resources (CSS or JS File)

From v0.4.2, the extension supports loading external CSS or JS file from local file or remote URL. This operation may introduce security issue or runtime crash, use it with caution!

All resources will be applied in editor instead of webview.

All resources will be fetched, merged and persist according to resource type during reload, so there is no watcher support.

```jsonc
{
  "custom-ui-style.external.imports": [
    // assume the script is ESM format
    "file://D:/data/test.js",
    "file:///Users/yourname/test.js",

    // Variable supports:
    // Load from user home dir
    "file://${userHome}/test.css",
    // Load from environment variable (with optional fallback value)
    "file://${env:your_env_name:optional_fallback_value}/other.js",

    // Remote resources will be downloaded
    {
      // <link rel="stylesheet" href="./external.css"></link>
      // will load before `custom-ui-style.stylesheet`
      "type": "css",
      "url": "https://fonts.googleapis.com/css?family=Sofia",
    },
    {
      // <script src="./external.js"></script>
      "type": "js",
      "url": "https://example.com/test.js",
    },
    {
      // <script src="./external.module.js" type="module"></script>
      "type": "js-module",
      "url": "https://example.com/test.module.js",
    }
  ]
}
```

#### Load Strategy

By default, all resources will be refetched during every reload. Failed fetch will be skipped.

To skip refetching resources if there is nothing changed on `custom-ui-style.external.imports` and all resources are successfully fetched before, setup:

```jsonc
{
  "custom-ui-style.external.loadStrategy": "cache"
}
```

To disable all external resources, setup:

```jsonc
{
  "custom-ui-style.external.loadStrategy": "disable"
}
```

## FAQ

### No Effect?

If you are using Windows or Linux, make sure you have closed all the VSCode windows and then restart.

If you are using MacOS, press <kbd>Command + Q</kbd> first, then restart VSCode.

There are [guide](https://github.com/subframe7536/vscode-custom-ui-style/issues/1#issuecomment-2423660217) and [video](https://github.com/subframe7536/vscode-custom-ui-style/issues/2#issuecomment-2432225106) (MacOS) of the process.

### RangeError: Maximum call stack size exceeded

Due to system permission restrictions, you will receive `RangeError: Maximum call stack size exceeded` prompt when you reload the configuration. You need to fully close VSCode first (press <kbd>Command + Q</kbd> on MacOS), then run:

```sh
# MacOS
sudo chown -R $(whoami) "/Applications/Visual Studio Code.app"

# Linux
sudo chown -R $(whoami) "/opt/visual-studio-code"
```

See in [#6](https://github.com/subframe7536/vscode-custom-ui-style/issues/6)

## Configurations

<!-- configs -->

| Key                                         | Description                                                                                                                                                                                                  | Type      | Default     |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ----------- |
| `custom-ui-style.preferRestart`             | Prefer to restart vscode after update instead of reload window only (ALWAYS true when VSCode version &gt;= 1.95.0)                                                                                           | `boolean` | `false`     |
| `custom-ui-style.reloadWithoutPrompting`    | Reload/restart immediately, instead of having to click 'Reload Window' in the notification                                                                                                                   | `boolean` | `false`     |
| `custom-ui-style.watch`                     | Watch configuration changes and reload window automatically (ignore imports)                                                                                                                                 | `boolean` | `true`      |
| `custom-ui-style.electron`                  | Electron BrowserWindow options                                                                                                                                                                               | `object`  | `{}`        |
| `custom-ui-style.font.monospace`            | Global monospace font family that apply in both editor and webview, fallback to editor's font family                                                                                                         | `string`  | ``          |
| `custom-ui-style.font.sansSerif`            | Global sans-serif font family that apply in both editor and webview                                                                                                                                          | `string`  | ``          |
| `custom-ui-style.background.url`            | Full-screen background image url (will not sync), support protocol: 'https://', 'file://', 'data:'                                                                                                           | `string`  | ``          |
| `custom-ui-style.background.syncURL`        | Full-screen background image url (will sync), support variable: [${userHome}, ${env:your_env_name:optional_fallback_value}], has lower priority than 'Url', support protocol: 'https://', 'file://', 'data:' | `string`  | ``          |
| `custom-ui-style.background.opacity`        | Background image opacity (0 ~ 1)                                                                                                                                                                             | `number`  | `0.9`       |
| `custom-ui-style.background.size`           | Background image size                                                                                                                                                                                        | `string`  | `"cover"`   |
| `custom-ui-style.background.position`       | Background image position                                                                                                                                                                                    | `string`  | `"center"`  |
| `custom-ui-style.external.loadStrategy`     | Load strategy for external CSS or JS resources                                                                                                                                                               | `string`  | `"refetch"` |
| `custom-ui-style.external.imports`          | External CSS or JS resources, support variable: [${userHome}, ${env:your_env_name:optional_fallback_value}], support protocol: 'https://', 'file://'                                                         | `array`   | ``          |
| `custom-ui-style.stylesheet`                | Custom css for editor, support nest selectors                                                                                                                                                                | `object`  | `{}`        |
| `custom-ui-style.webview.monospaceSelector` | Custom monospace selector in webview                                                                                                                                                                         | `array`   | ``          |
| `custom-ui-style.webview.sansSerifSelector` | Custom sans-serif selector in webview                                                                                                                                                                        | `array`   | ``          |
| `custom-ui-style.webview.stylesheet`        | Custom css for webview, support nest selectors                                                                                                                                                               | `object`  | `{}`        |

<!-- configs -->

## Commands

<!-- commands -->

| Command                    | Title                     |
| -------------------------- | ------------------------- |
| `custom-ui-style.reload`   | Custom UI Style: Reload   |
| `custom-ui-style.rollback` | Custom UI Style: Rollback |

<!-- commands -->

## Credit

- [APC](https://github.com/drcika/apc-extension) for my previous usage
- [Background](https://github.com/shalldie/vscode-background) for my previous usage
- [vscode-sync-settings](https://github.com/zokugun/vscode-sync-settings) for fully restart logic
- [vscode-fix-checksums](https://github.com/RimuruChan/vscode-fix-checksums) for checksum patch logic
- [Custom CSS and JS Loader](https://github.com/be5invis/vscode-custom-css) for external resource logic

## License

MIT
