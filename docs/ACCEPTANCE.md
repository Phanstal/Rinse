# Rinse 真机验收清单

## 验收范围

本清单覆盖 Android、iOS 和 Web 三个运行面。v0.1.3 已在本地 API 33 模拟器完成一轮验收；iOS 模拟器由 GitHub Actions 的 macOS 15 runner 构建并启动，本地没有 macOS，因此 iOS 真机安装仍需在 Mac 上补充验证。

验收目标不是只看「能打开」，而是同时确认：

1. 视觉与交互是否忠实于原型；
2. 本地数据在重启、杀进程、切后台后是否仍在；
3. 原生返回、安全区、键盘、长按手势是否正常；
4. 发布产物是否与实际代码一致。

## 验收环境

| 项目     | 本地验收                                       | 发布验证                                                               |
| -------- | ---------------------------------------------- | ---------------------------------------------------------------------- |
| Android  | Android 13 / API 33 x86_64 模拟器，1080 × 2400 | GitHub Actions Ubuntu + JDK 17 + Android SDK                           |
| iOS      | 未在本地运行（Windows 无 Xcode）               | GitHub Actions macOS 15：模拟器构建与启动；设备未签名包由 release 构建 |
| Web      | Edge / Chromium，390 × 844 和 360 × 740        | GitHub Actions Chromium 移动端 E2E                                     |
| 应用版本 | 0.1.3（versionCode 4 / build 4）               | 同左                                                                   |
| 日期     | 2026-11-02                                     | 以 release workflow 实际运行日期为准                                   |

## Android 验收步骤

安装 debug APK 后，按顺序执行。

### A1 冷启动与首页

- 清除应用数据后启动，应出现浅色启动画面与 Rinse 水泡图标。
- 首页标题为「Your home, at a glance.」，摘要为「3 areas ready for care」。
- 标题下方是一张半透明圆角玻璃卡片；卡片内部是水泡区域、触控提示和 Bubbles / Grid / List 分段切换。
- 8 个水泡全部可见：Kitchen counter、Bathroom、Floors、Bedsheets、Shower、Mirrors、Towels、Fridge。
- Kitchen counter 水泡位于视觉中心、尺寸最大且为深蓝色，显示「2d overdue」；其余水泡按紧急度向外错落分布并依次变浅。
- 卡片下方有渐变圆形 `+` 按钮；页面底部不压系统手势条。

### A2 详情面板

- 轻点 Kitchen counter 水泡，底部面板滑入。
- 面板显示 CLEANING ITEM、Kitchen counter、Overdue、Next cycle「2 days overdue」、Last cleaned（当天往前 5 天）、Repeats「Every 3 days」。
- Mark as cleaned、Edit、Delete 三个按钮均可见。
- 点右上角关闭，面板退出，首页状态不变。

### A3 新增周期（含软键盘）

- 点 `+`，面板标题为「What would you like to care for?」。
- 点 Item name，软键盘弹出；输入「Native touch」。
- 点「7 days」预设，间隔输入框变为 7。
- 隐藏键盘后点 Save item，出现「Item added」提示；水泡、网格或列表中能看到新项目。
- 编辑面板打开时按 Android 返回键，应先关闭面板而不是退出应用。

### A4 编辑周期

- 打开 Kitchen counter → Edit。
- 标题变为「Keep it current.」，名称为 Kitchen counter，间隔 3。
- 修改名称与间隔，保存后出现「Changes saved」。
- 重新打开详情，名称、间隔、上次清洁日期已更新。

### A5 按住清洁

- 回到首页，按住 Kitchen counter 约 0.8 秒。
- 水泡出现收缩/回弹动画，出现「Cycle reset」提示，伴随短促气泡音。
- 首页摘要从「3 areas ready for care」变为「2 areas ready for care」。
- 松手后不应再打开详情面板。
- 进入历史，能看到 Kitchen counter，日期为今天。

### A6 历史与撤销

- 在历史页点 Undo。
- 出现「Cleaning undone」，历史恢复空状态。
- 返回首页，摘要恢复为「3 areas ready for care」，Kitchen counter 回到「2d overdue」。

### A7 Android 返回键

依次验证：

1. 备份面板打开时按返回 → 关闭备份面板。
2. 编辑面板打开时按返回 → 关闭编辑面板。
3. 详情面板打开时按返回 → 关闭详情面板。
4. 历史页按返回 → 返回首页。
5. 首页按返回 → 应用退到后台，不崩溃。

### A8 重启持久化

- 新增一个项目，或完成一次清洁。
- 从最近任务中划掉应用，再重新打开。
- 新增项目仍在；历史记录仍在。
- `adb shell run-as com.phanstal.rinse cat shared_prefs/CapacitorStorage.xml` 中能看到 `rinse.items.v1` 与 `rinse.history.v1`。

### A9 删除与空状态

- 删除一个项目，首页水泡数量减少；历史里已产生的记录不会被删除。
- 删除全部项目后显示「Start with one small thing.」与 Add your first item。
- 点 Add your first item 可以新增第一个项目。

### A10 三视图与窄屏

- 点底部 Grid，切换为两列圆角网格；前两个项目为深色底，顺序与紧急度一致。
- 点 List，切换为完整列表；8 行全部可见，最后一行的文字位于触控提示上方，不被提示或分段切换遮住。
- 点 Bubbles 切回水泡视图，水泡仍可见，选中态与排序不变。
- 在 360 × 740 视口下无横向滚动，`+` 按钮不被裁切，列表可滚动查看剩余项目。
- 应用锁定竖屏；旋转设备不应变成横屏。

### A11 备份与恢复

- 进入历史页，点右上角备份图标，确认面板显示当前项目数与日志数。
- 点「Copy backup」，粘贴到任意文本编辑器，确认 JSON 包含 `format: "rinse-backup"`、`version: 1`、`data.items` 与 `data.history`。
- 点「Restore from a backup」，粘贴一份有效备份，点「Check backup」，确认出现条目预览。
- 点「Replace my data」，出现「Backup restored」，返回首页后水泡数量与备份一致。
- 重启应用，恢复后的数据仍在；再用无效 JSON 测试，应显示错误且不修改现有数据。

### A12 日期自动刷新

- 把系统时间改到 23:59，进入列表视图，记录某个周期的到期文案。
- 等系统跨过午夜，或把应用切到后台再回到前台。
- 对应周期的剩余天数与紧急状态应在不重启应用的情况下更新。

## iOS 验收步骤

本地没有 Mac，以下需要在 macOS 或真机上完成。

### I1 模拟器运行

- 下载 `Rinse-0.1.3-ios-simulator.zip`，解压得到 `App.app`。
- 打开 Xcode Simulator，把 `App.app` 拖入模拟器；或从源码运行：

```bash
npm run build
npx cap sync ios
cd ios/App
pod install
open App.xcworkspace
```

- 选择任意 iPhone 模拟器 Run。CI 已在 iPhone 16 Pro 模拟器完成安装、启动与截图，截图见 README。
- 检查：安全区顶部不压状态栏；底部 FAB 不压 Home Indicator；详情/编辑面板可滚动；键盘弹出时编辑表单仍可完成保存。
- 检查历史、撤销、长按、三视图切换与 Android 一致。

### I2 真机安装（需要签名）

- 在 Xcode 打开 `ios/App/App.xcworkspace`。
- 选择 App target → Signing & Capabilities，选择自己的 Team，修改唯一 Bundle Identifier。
- 连接 iPhone，选择设备 Run。
- 或者用 Sideloadly / AltStore 重签 `Rinse-0.1.3-ios-unsigned.ipa`。
- 检查启动图、状态栏、安全区、触感反馈与本地持久化。
- 杀进程后重新打开，数据仍在。

### I3 iOS 限制说明

- 未签名 IPA 不能直接安装；这是 Apple 平台签名机制决定的，不是构建失败。
- 免费 Apple ID 签名通常 7 天过期，需要重新签名。
- 正式分发需要 Apple Developer Program 账号、证书与描述文件。

## Web 验收步骤

- `npm run build && npm run preview`，打开 `http://127.0.0.1:4784`。
- 检查桌面宽度下是否居中显示手机画布；移动端浏览器全屏显示。
- 浏览器刷新后数据仍在 localStorage。
- 清除站点数据后回到示例数据。
- 历史页右上角打开备份面板，复制/下载 JSON；再粘贴恢复，刷新后恢复的数据仍在。
- 在本地午夜前后停留，三视图中的到期天数与排序会自动跨日更新。

## 自动化证据

| 检查        | 命令                      | 结果                                                                                                                            |
| ----------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 单元测试    | `npm test`                | 22 passed                                                                                                                       |
| 移动端 E2E  | `npm run test:e2e`        | 14 passed                                                                                                                       |
| 类型        | `npm run typecheck`       | passed                                                                                                                          |
| Lint        | `npm run lint`            | passed                                                                                                                          |
| 格式        | `npm run format:check`    | passed                                                                                                                          |
| Android APK | `./gradlew assembleDebug` | BUILD SUCCESSFUL                                                                                                                |
| iOS 模拟器  | GitHub Actions macOS 15   | 构建、安装、启动与截图 passed（[CI run](https://github.com/Phanstal/Rinse/actions/runs/41327984411)）                           |
| CI 全流程   | GitHub Actions            | lint / 格式 / 类型 / 单元 / E2E / APK / iOS 全部 passed（[CI run](https://github.com/Phanstal/Rinse/actions/runs/41327984411)） |

## 发布产物验收

- [x] GitHub Release 包含 APK、未签名 IPA、模拟器 zip、SHA256SUMS.txt。
- [x] `sha256sum -c SHA256SUMS.txt` 全部通过。
- [x] APK 能在干净的 Android 设备/模拟器安装。
- [ ] 未签名 IPA 能被重签工具识别（不要求直接安装）。
- [x] 同源模拟器 App 在 macOS Xcode Simulator 中启动并截图。
- [ ] 真机验收记录补充到本文件。

## 发布记录

### v0.1.3

- Release：[v0.1.3](https://github.com/Phanstal/Rinse/releases/tag/v0.1.3)
- Release workflow：[run 41329179807](https://github.com/Phanstal/Rinse/actions/runs/41329179807)
- 发布校验：下载 Release 的三个文件后执行 `sha256sum -c SHA256SUMS.txt`，全部 `OK`。
- APK：`Rinse-0.1.3-android-debug.apk`，5,265,312 字节，SHA-256 `8b8684673f99a7c038b1de882e62bfe7e2181af20af2db3fdec85b65391fee6a`；在 API 33 模拟器上卸载旧 debug 签名包后全新安装，`aapt` 确认包名 `com.phanstal.rinse`、versionCode `4`、versionName `0.1.3`；启动生成 8 条示例数据，首页为新的玻璃卡片与三视图切换。
- iOS IPA：`Rinse-0.1.3-ios-unsigned.ipa`，1,713,179 字节，SHA-256 `17130352ca6fa61fe065a7c0e5cb404bf5b4f73b3b7704bd02cdf811bb441356`；解包确认包含 `Payload/App.app/App`、Bundle ID `com.phanstal.rinse`、版本 `0.1.3 (4)`、arm64 架构；未签名，需重签。
- iOS 模拟器 zip：`Rinse-0.1.3-ios-simulator.zip`，2,236,656 字节，SHA-256 `42c36d44df67292c62b6abc81f31e8afd04ef9f7df87269933b8fb52c2159a1b`；解包确认 `App.app`、Bundle ID `com.phanstal.rinse`、版本 `0.1.3 (4)`，同时包含 x86_64 与 arm64 架构；同源模拟器 App 已在 CI 的 iPhone 16 Pro 模拟器安装、启动并截图。
- 视觉验收：Android 1080 × 2400 与 iOS 1206 × 2622 截图均显示玻璃卡片、有机水泡、底部三段切换和渐变 `+`；iOS 卡片避开副标题，短标签不再换行。
- 兼容验收：Android WebView 109 下网格颜色与文字正常；详情/备份面板无透底残影；列表最后一行位于提示和切换上方。
- 交互/E2E：22 项单元测试、14 项移动端 E2E 全部通过，覆盖三视图切换、长按清洁、历史撤销、备份恢复、跨午夜刷新与 360 × 740 窄屏。
- 本版改动：按 Figma Make Version 26 重做首页；新增网格视图与三视图切换；新增 WebView 109 CSS 回退；修复 iOS 安全区、短标签换行、原生面板残影与列表底部遮挡。

### v0.1.2

- Release：[v0.1.2](https://github.com/Phanstal/Rinse/releases/tag/v0.1.2)
- Release workflow：[run 41302174592](https://github.com/Phanstal/Rinse/actions/runs/41302174592)
- 发布校验：以下三个文件的实际 SHA-256 与 `SHA256SUMS.txt` 完全一致。
- APK：`Rinse-0.1.2-android-debug.apk`，5,263,837 字节，SHA-256 `b0254d7b37170ddcfac26c6d35d81650724a1981e22842b003d7e52451816983`；在 API 33 模拟器上先卸载旧 debug 签名版本，再全新安装发布 APK，`aapt` 确认包名 `com.phanstal.rinse`、versionCode `3`、versionName `0.1.2`；启动后生成 8 条示例数据，历史页可打开备份面板。
- iOS IPA：`Rinse-0.1.2-ios-unsigned.ipa`，1,706,170 字节，SHA-256 `ea7daa439d1909b7fb12b984ef8bd068524c7e973b595bfeb1d1729632617df6`；解包确认包含 `Payload/App.app/App`、Bundle ID `com.phanstal.rinse`、版本 `0.1.2 (3)`、arm64 架构；未签名，需重签。
- iOS 模拟器 zip：`Rinse-0.1.2-ios-simulator.zip`，2,234,474 字节，SHA-256 `36b1ce84945b511b94bfb962e5fd5e2b10427dec2cbb288f778571a9498d48f8`；包含 x86_64 与 arm64 架构；CI 已在 iPhone 模拟器启动并截图。
- 备份恢复：Android debug WebView 中从 8 条示例数据恢复 2 条备份，返回首页显示 2 个水泡，刷新后仍为 2 条；Web E2E 覆盖复制路径之外的下载、校验、替换和非法备份拒绝。
- 日期刷新：Web E2E 用可控时钟跨过本地午夜，列表中的到期文案从「2 days overdue」自动变为「3 days overdue」。
- 本版新增：本地 JSON 备份/恢复；跨午夜与回前台日期刷新；修复到期天数按当前时刻而非日历日计算的问题。

### v0.1.1

- Release：[v0.1.1](https://github.com/Phanstal/Rinse/releases/tag/v0.1.1)（v0.1.0 已由本版取代）
- Release workflow：[run 40490994528](https://github.com/Phanstal/Rinse/actions/runs/40490994528)
- 发布校验：三个文件 SHA-256 与 `SHA256SUMS.txt` 一致。
- APK：在 API 33 模拟器上先卸载旧 debug 签名版本，再全新安装发布 APK，启动后生成 8 条示例数据；`aapt` 确认包名 `com.phanstal.rinse`、versionCode `2`、versionName `0.1.1`。
- iOS IPA：解包确认包含 `Payload/App.app/App`、`Info.plist`、Bundle ID `com.phanstal.rinse`、版本 `0.1.1 (2)`、arm64 架构；未签名，需重签。
- iOS 模拟器 zip：解包确认包含 `App.app`，同时包含 x86_64 与 arm64 架构；CI 已安装并在 iPhone 15 Pro 模拟器启动截图。
- 本版修正：iOS 与 Web 上深色紧急水泡被 `color-mix` 冲淡；现在紧急水泡保持原型的深蓝层次。
