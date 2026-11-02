# Rinse v0.1.5 改版报告

## 1. 结论

本轮通过 Figma MCP 重新读取 [Rinse Cleaning Cycle Tracker](https://www.figma.com/make/zpog9lRPWVomLBPYMTKvOp/Rinse-Cleaning-Cycle-Tracker) 的 Make 源文件（2026-11-02 23:03 抓取，共 54 个文件），并与 v0.1.4 使用的 Version 26 基线逐字节比较：

| 文件            | SHA-256                                                            | 结论                   |
| --------------- | ------------------------------------------------------------------ | ---------------------- |
| `src/App.tsx`   | `86AB0DECB61A6F31C78D71F2BDE2A3D2DE92123DF55D1757CD3EAD9697BEE42C` | 与 v0.1.4 基线完全一致 |
| `src/index.css` | `DC96BBEF707CDBE419A752887A80E7422CA59D12D5F8045552E0645F659F3221` | 与 v0.1.4 基线完全一致 |

因此最新版 Make 的**界面代码没有相对 v0.1.4 的增量**，头部、玻璃卡片、Bubbles / List 双视图、设置页、历史页、400ms 长按逻辑都已经是当前实现。

真正落后的是**品牌资产**：最新 Make 的 `public/rinse-icon.png` 是 1024 × 1024 的单颗 3D 玻璃水泡（浅蓝圆角底），而仓库里的 Android 启动图标、自适应图标、启动画面、iOS AppIcon 和 PWA 图标仍是旧的三水泡插画。v0.1.5 只做这一件事：把 Figma 的最新图标完整落到 Web、Android、iOS 三个运行面，不重做已经对齐的界面。

## 2. 最新 Make 源与图标

- 远程 MCP：`https://mcp.figma.com/mcp`，通过本地 `mcp-remote` stdio 代理读取 Make resources。
- Make 文件不支持 `create_session` 或设计节点工具，因此使用 `file://figma/make/source/...` 与 `file://figma/make/image/...` 资源。
- 最新源文件抓取目录：`D:\Project\Elsewhere\figma-make-latest`，54/54 成功。
- 图标源文件：`public/rinse-icon.png`，1024 × 1024，1,911,464 字节，SHA-256 `8CB9C43EB042C2BEEC10ED4C298908F97A1A7241B553742B9A1EE40CE7755C47`；与用户提供的附件一致。
- 图标是透明圆角边缘的浅蓝底 + 单颗 3D 玻璃水泡；圆角外像素为 `rgba(0,0,0,0)`，主底色约 `#E3EFFB`。
- 本报告不记录任何 MCP token；凭据只保存在仓库外的本地 ACL 文件中。

## 3. 本版改动

### 3.1 Web / PWA

- `public/rinse-icon.png`：128 → 256，使用最新 Make 图标，头部玻璃字标旁仍是 27 × 27 显示。
- `public/favicon-32.png`、`public/apple-touch-icon.png`、`public/icon-192.png`、`public/icon-512.png`：全部由最新图标重生成。
- `public/icons/icon-192.png`、`public/icons/icon-512.png`：新增 PWA 安装图标。
- `public/manifest.webmanifest`：图标改为 `/icons/icon-192.png` 与 `/icons/icon-512.png`，修正上一轮 PWA 生成器留下的错误相对路径与错误 MIME。
- `public/favicon.svg`：删除旧的手绘三水泡 SVG，`index.html` 只保留 PNG favicon，避免浏览器优先加载旧 SVG。

### 3.2 Android

- `resources/` 源资产全部替换：`icon.png`、`icon-only.png`、`icon-dark.png`、`icon-foreground.png`、`icon-background.png`、`splash.png`、`splash-dark.png`。
- 用 `@capacitor/assets@3.0.5` 重新生成 `mipmap-*` 的 `ic_launcher.png`、`ic_launcher_round.png`、`ic_launcher_background.png`、`ic_launcher_foreground.png`。
- 所有 `drawable*` 的 26 张 `splash.png` 改为新图标 + `rinse` 字标。
- `mipmap-anydpi-v26/ic_launcher.xml` 与 `ic_launcher_round.xml`：去掉会把背景缩成 66% 的 `inset 16.7%`，改为全幅背景色 + 前景图层，避免自适应图标出现透明边。
- `values/ic_launcher_background.xml`：`#FFFFFF` → `#E3EFFB`，与图标边缘同色。
- `AndroidManifest.xml` 未被资产工具改写。

### 3.3 iOS

- `AppIcon.appiconset/AppIcon-512@2x.png`：1024 × 1024 新图标，不透明，符合 App Store 图标要求。
- `Splash.imageset/Default@1x|2x|3x~universal~anyany(.png|-dark.png)`：6 张启动图全部改为新图标 + `rinse` 字标；深浅色使用同一浅色品牌画面。
- 未使用 `Assets.xcassets` 里遗留的 Capacitor 默认 `splash-2732x2732*.png`；它们不在 `Contents.json` 引用中，保留不影响构建。

## 4. 版本

- 应用版本：`0.1.5`
- Android：versionCode `6` / versionName `0.1.5`
- iOS：build `6` / version `0.1.5`
- npm：`package.json` 与 `package-lock.json` 均为 `0.1.5`

## 5. 验证

### 5.1 自动化

| 检查     | 命令                   | 结果      |
| -------- | ---------------------- | --------- |
| Lint     | `npm run lint`         | passed    |
| 格式     | `npm run format:check` | passed    |
| 类型     | `npm run typecheck`    | passed    |
| 单元测试 | `npm test`             | 22 passed |
| 移动 E2E | `npm run test:e2e`     | 15 passed |

### 5.2 Android

- 环境：Android 13 / API 33 x86_64 模拟器，1080 × 2400。
- 卸载旧包后全新安装 0.1.5 APK，桌面图标显示单颗 3D 水泡，不再是旧三水泡。
- 启动画面与桌面图标均已截图归档；`dumpsys` 确认 versionCode `6`、versionName `0.1.5`。
- 首页、列表、设置、详情、编辑、历史、备份与删除确认沿用 v0.1.4 验收路径，无回归。

### 5.3 iOS

- GitHub Actions macOS 15 runner 构建未签名 IPA 与模拟器 App。
- 构建阶段由 `actool` 编译 `AppIcon.appiconset` 与 `Splash.imageset`，资源缺失会直接失败；CI 产物通过即说明新图标/启动图被正确打包。
- 本地为 Windows，无法在真机安装；真机签名步骤见 `docs/ACCEPTANCE.md`。

### 5.4 视觉证据

- 最新 Make 源图标与本地生成图标对照：`docs/screenshots/android-launcher-icon.png`
- Android 启动画面：`docs/screenshots/android-splash.png`
- Web 首页（新 256 图标）：`docs/screenshots/web-home.png`

## 6. 版本与产物

- GitHub Release：[v0.1.5](https://github.com/Phanstal/Rinse/releases/tag/v0.1.5)
- 发布工作流：[release run 41473589506](https://github.com/Phanstal/Rinse/actions/runs/41473589506)
- 产物已从 Release / Actions artifact 下载并与 `SHA256SUMS.txt` 比对一致。

| 文件                            | 大小（字节） | SHA-256                                                            |
| ------------------------------- | ------------ | ------------------------------------------------------------------ |
| `Rinse-0.1.5-android-debug.apk` | 6,783,700    | `71fe579642a8c4e88eed08e8cb7b8c91cba50ca339ef2935122f29bd7616d3a9` |
| `Rinse-0.1.5-ios-unsigned.ipa`  | 4,637,032    | `73782a89d2e6e11cafe3c4dbac8ada2579bf5938fb2c1f4bca1653c7d0872e7a` |
| `Rinse-0.1.5-ios-simulator.zip` | 5,165,606    | `944359d6e84c462789dc6e0b79952bcc31d9ca4fe356a69fb4ca7f11d7ce6e1b` |

校验方式：`sha256sum -c SHA256SUMS.txt`。

## 7. 已知限制

- 无账号、云同步与推送通知；数据只在本机，跨设备迁移依赖 JSON 备份。
- Android APK 仍是 debug 签名，不适合直接上架 Google Play。
- iOS 只提供未签名 IPA 与模拟器包，真机安装需要用户自己的 Apple 签名。
- 水泡视图只有 9 个有机位置；超过 9 个项目会复用位置，列表仍可完整查看。
- Android WebView 109 上原生面板禁用滑入动画，这是规避渲染残影的兼容取舍。

## 8. 相关文档

- [README](README.md)
- [真机验收清单](docs/ACCEPTANCE.md)
- [发布说明](docs/RELEASE_NOTES.md)
- [v0.1.4 报告](https://github.com/Phanstal/Rinse/blob/v0.1.4/REPORT.md)
- [GitHub Release v0.1.5](https://github.com/Phanstal/Rinse/releases/tag/v0.1.5)
