<p align="center">
  <img height="128" src="./res/icon.png"></img>
  <h1 align="center">Custom UI Style</h1>
  <p align="center">
    <a href="https://marketplace.visualstudio.com/items?itemName=subframe7536.custom-ui-style" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/v/subframe7536.custom-ui-style.svg?color=eee&amp;label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>
    <a href="https://kermanx.github.io/reactive-vscode/" target="__blank"><img src="https://img.shields.io/badge/made_with-reactive--vscode-%23007ACC?style=flat&labelColor=%23229863"  alt="Made with reactive-vscode" /></a>
  </p>
</p>

Custom UI Style is a VSCode extension that allows you to customize the editor's appearance and behavior by injecting custom CSS and JavaScript. You can unify the global font family, set a background image, modify Electron `BrowserWindow` options, add your own custom styles and scripts, and even patch files in other VSCode extensions.

- Works with VSCode 1.103! (Tested on Windows and MacOS)

> [!warning]
>
> This extension works by modifying the VSCode's source css and js files.

# ❗CLAIM

Untested on Linux and VSCode forks (like Cursor, WindSurf, etc.), and I currently lack the energy to adapt them. If this extension causes issues in your editor, please consider using [these more mature alternative extensions](#credit)

## Features

- Unify the global font family for the editor and webviews.
- Set a background image for the editor window.
- Apply custom stylesheets to both the editor and webviews.
- Configure Electron `BrowserWindow` options.
- Support for restarting VSCode to apply changes.
- Suppress the "Your Code installation is corrupt" message.
- Load external CSS and JavaScript files.
- Patch files in other extensions.

## Usage

1.  **Backup:** When you first install the extension or after a VSCode update, you'll be prompted to create a backup of the original files. This is important for rollback.
2.  **Configure:** Add your customizations to your `settings.json` file. See the [Example](#example) and [Configurations](#configurations) sections for details.
3.  **Apply:** Open the Command Palette (<kbd>Ctrl+Shift+P</kbd> or <kbd>Cmd+Shift+P</kbd>) and run `Custom UI Style: Reload` to apply your changes.
4.  **Rollback:** To revert all changes and restore the original VSCode files, run `Custom UI Style: Rollback` from the Command Palette.

See [details](https://github.com/shalldie/vscode-background?tab=readme-ov-file#warns) for more information.

### Example

Available CSS Variables:

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
    // No longer needed since v1.97.0 allows to move the command palette position
    // ".quick-input-widget": {
    //   "top": "25vh !important"
    // },
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

Starting from v0.4.2, you can load external CSS and JavaScript files from local or remote URLs.

> [!caution]
> Loading external resources can introduce security risks or cause runtime crashes. Use this feature with caution.

- All resources are applied to the editor, not webviews.
- Resources are fetched and merged during reload. Live-watching of files is not supported.

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

By default, all resources are re-fetched on every reload, and failed fetches are skipped.

To cache resources and avoid re-fetching when `custom-ui-style.external.imports` is unchanged, set the load strategy to `"cache"`:

```jsonc
{
  "custom-ui-style.external.loadStrategy": "cache"
}
```

To disable all external resources, set the load strategy to `"disable"`:

```jsonc
{
  "custom-ui-style.external.loadStrategy": "disable"
}
```

### Patch Extension

Find and replace target string or `Regexp` in extension's file

```jsonc
{
  // "custom-ui-style.extensions.enable": false,
  "custom-ui-style.extensions.config": {
    // extension id
    "github.copilot-chat": [
      {
        // target file path related to extension root
        "filePath": "dist/extension.js",
        // find string (support JavaScript like regexp)
        "find": "https://generativelanguage.googleapis.com/v1beta/openai",
        // replace string
        "replace": "<path/to/url>"
      }
    ]
  },
}
```

## FAQ

### What is modified?

This extension modifies files in your VSCode installation directory. All modified files are backed up with a `.custom-ui-style` suffix in the same directory. You can see the full list of modified files in [`path.ts`](https://github.com/subframe7536/vscode-custom-ui-style/tree/main/src/path.ts).

When you reload the configuration, the extension restores the original files from the backup, applies your custom patches, and then reloads the window or restarts the application.

### No Effect

If your changes don't seem to apply, you may need to fully restart VSCode.

- **Windows/Linux:** Close all VSCode windows and restart the application.
- **macOS:** Press <kbd>Command + Q</kbd> to quit the application, then restart it.

There are also a [guide](https://github.com/subframe7536/vscode-custom-ui-style/issues/1#issuecomment-2423660217) and a [video](https://github.com/subframe7536/vscode-custom-ui-style/issues/2#issuecomment-2432225106) (macOS) available for more detailed instructions.

### EROFS: read-only file system

If you see this error, it means VSCode is installed on a read-only filesystem (e.g., via Snap or AppImage). This extension needs to write to the installation directory, so you'll need to install VSCode using a different method.

### RangeError: Maximum call stack size exceeded

This error can occur due to system permission restrictions. To fix it, you need to change the ownership of the VSCode installation directory.

First, fully close VSCode (<kbd>Command + Q</_kbd> on macOS). Then, run the following command:

```sh
# macOS
sudo chown -R $(whoami) "/Applications/Visual Studio Code.app"

# Linux
sudo chown -R $(whoami) "/usr/local/code"
```

See [#6](https://github.com/subframe7536/vscode-custom-ui-style/issues/6) for more details.

### Fail to render panel

In some VSCode forks like Cursor, the extension detail panel may not render due to a Content Security Policy (CSP) violation. To work around this, you can disable the webview patch:

```json
{
  "custom-ui-style.webview.enable": false
}
```

## Configurations

<!-- configs -->

| Key                                         | Description                                                                                                                       | Type      | Default     |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| `custom-ui-style.preferRestart`             | Prefer restarting VSCode after updates (always true for VSCode &gt;= 1.95.0)                                                      | `boolean` | `false`     |
| `custom-ui-style.reloadWithoutPrompting`    | Reload/restart immediately without a notification prompt                                                                          | `boolean` | `false`     |
| `custom-ui-style.watch`                     | Automatically reload window on configuration changes (ignores imports)                                                            | `boolean` | `true`      |
| `custom-ui-style.electron`                  | Electron BrowserWindow options (see Electron documentation)                                                                       | `object`  | `{}`        |
| `custom-ui-style.font.monospace`            | Global monospace font family for editor and webviews (falls back to editor's font)                                                | `string`  | ``          |
| `custom-ui-style.font.sansSerif`            | Global sans-serif font family for editor and webviews                                                                             | `string`  | ``          |
| `custom-ui-style.background.url`            | Full-screen background image URL (e.g., 'https://', 'file://', 'data:') - not synced                                              | `string`  | ``          |
| `custom-ui-style.background.syncURL`        | Full-screen background image URL (synced), supports variables like ${userHome} or ${env:VAR:fallback}. Lower priority than 'url'. | `string`  | ``          |
| `custom-ui-style.background.opacity`        | Background image opacity (0 to 1)                                                                                                 | `number`  | `0.9`       |
| `custom-ui-style.background.size`           | Background image size (e.g., 'cover', 'contain')                                                                                  | `string`  | `"cover"`   |
| `custom-ui-style.background.position`       | Background image position                                                                                                         | `string`  | `"center"`  |
| `custom-ui-style.external.loadStrategy`     | Strategy for loading external CSS or JS resources                                                                                 | `string`  | `"refetch"` |
| `custom-ui-style.external.imports`          | External CSS or JS resources; supports variables (${userHome}, ${env:VAR:fallback}) and protocols ('https://', 'file://')         | `array`   | ``          |
| `custom-ui-style.stylesheet`                | Custom CSS for the editor; supports nested selectors                                                                              | `object`  | `{}`        |
| `custom-ui-style.extensions.enable`         | Enable file patching in other extensions                                                                                          | `boolean` | `true`      |
| `custom-ui-style.extensions.config`         | Configuration for patching extension files (key: extension ID, value: patch config)                                               | `object`  | `{}`        |
| `custom-ui-style.webview.enable`            | Enable style patching in webviews                                                                                                 | `boolean` | `true`      |
| `custom-ui-style.webview.removeCSP`         | Remove Content-Security-Policy restrictions in webviews                                                                           | `boolean` | `true`      |
| `custom-ui-style.webview.monospaceSelector` | Custom monospace selector for webviews                                                                                            | `array`   | ``          |
| `custom-ui-style.webview.sansSerifSelector` | Custom sans-serif selector for webviews                                                                                           | `array`   | ``          |
| `custom-ui-style.webview.stylesheet`        | Custom CSS for webviews; supports nested selectors                                                                                | `object`  | `{}`        |

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
- [vscode-fix-checksums](https://github.com/RimuruChan/vscode-fix-checksums) for checksum patch logic (Prevent corrupt warning notice on startup)
- [Custom CSS and JS Loader](https://github.com/be5invis/vscode-custom-css) for external resource logic

## License

MIT
