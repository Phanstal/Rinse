# Rinse 真机验收清单

## 验收范围

本清单覆盖 Android、iOS 和 Web 三个运行面。Android 已在本地 API 33 模拟器完成一轮验收；iOS 受限于本地没有 macOS，需在 Mac/iPhone 或 GitHub Actions 的 macOS runner 上补充真机验证。

验收目标不是只看「能打开」，而是同时确认：

1. 视觉与交互是否忠实于原型；
2. 本地数据在重启、杀进程、切后台后是否仍在；
3. 原生返回、安全区、键盘、长按手势是否正常；
4. 发布产物是否与实际代码一致。

## 验收环境

| 项目     | 本地验收                                       | 发布验证                                            |
| -------- | ---------------------------------------------- | --------------------------------------------------- |
| Android  | Android 13 / API 33 x86_64 模拟器，1080 × 2400 | GitHub Actions Ubuntu + JDK 17 + Android SDK        |
| iOS      | 未在本地运行（Windows 无 Xcode）               | GitHub Actions macOS 14，模拟器构建与未签名设备构建 |
| Web      | Edge / Chromium，390 × 844 和 360 × 740        | GitHub Actions Chromium 移动端 E2E                  |
| 应用版本 | 0.1.0（versionCode 1 / build 1）               | 同左                                                |
| 日期     | 2026-10-27                                     | 以 release workflow 实际运行日期为准                |

## Android 验收步骤

安装 debug APK 后，按顺序执行。

### A1 冷启动与首页

- 清除应用数据后启动，应出现浅色启动画面与 Rinse 水泡图标。
- 首页标题为「Your home, at a glance.」，摘要为「3 areas ready for care」。
- 8 个水泡全部可见：Kitchen counter、Bathroom、Floors、Bedsheets、Shower、Mirrors、Towels、Fridge。
- 第一个水泡为深蓝色，显示「2d overdue」；其余水泡按紧急度依次变浅。
- 底部有「Press and hold a bubble when it's clean」、水泡/列表切换和 `+` 按钮。

### A2 详情面板

- 轻点 Kitchen counter 水泡，底部面板滑入。
- 面板显示 CLEANING ITEM、Kitchen counter、Overdue、Next cycle「2 days overdue」、Last cleaned「Oct 22」、Repeats「Every 3 days」。
- Mark as cleaned、Edit、Delete 三个按钮均可见。
- 点右上角关闭，面板退出，首页状态不变。

### A3 新增周期（含软键盘）

- 点 `+`，面板标题为「What would you like to care for?」。
- 点 Item name，软键盘弹出；输入「Native touch」。
- 点「7 days」预设，间隔输入框变为 7。
- 隐藏键盘后点 Save item，出现「Item added」提示；水泡或列表中能看到新项目。
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

1. 编辑面板打开时按返回 → 关闭编辑面板。
2. 详情面板打开时按返回 → 关闭详情面板。
3. 历史页按返回 → 返回首页。
4. 首页按返回 → 应用退到后台，不崩溃。

### A8 重启持久化

- 新增一个项目，或完成一次清洁。
- 从最近任务中划掉应用，再重新打开。
- 新增项目仍在；历史记录仍在。
- `adb shell run-as com.phanstal.rinse cat shared_prefs/CapacitorStorage.xml` 中能看到 `rinse.items.v1` 与 `rinse.history.v1`。

### A9 删除与空状态

- 删除一个项目，首页水泡数量减少；历史里已产生的记录不会被删除。
- 删除全部项目后显示「Start with one small thing.」与 Add your first item。
- 点 Add your first item 可以新增第一个项目。

### A10 列表与窄屏

- 点底部列表图标，所有项目按紧急度排列，显示状态、周期。
- 切回水泡视图，水泡仍可见。
- 在 360 × 740 视口下无横向滚动，`+` 按钮不被裁切。
- 应用锁定竖屏；旋转设备不应变成横屏。

## iOS 验收步骤

本地没有 Mac，以下需要在 macOS 或真机上完成。

### I1 模拟器运行

- 下载 `Rinse-0.1.0-ios-simulator.zip`，解压得到 `App.app`。
- 打开 Xcode Simulator，把 `App.app` 拖入模拟器；或从源码运行：

```bash
npm run build
npx cap sync ios
cd ios/App
pod install
open App.xcworkspace
```

- 选择任意 iPhone 模拟器 Run。
- 检查：安全区顶部不压状态栏；底部 FAB 不压 Home Indicator；详情/编辑面板可滚动；键盘弹出时编辑表单仍可完成保存。
- 检查历史、撤销、长按、列表切换与 Android 一致。

### I2 真机安装（需要签名）

- 在 Xcode 打开 `ios/App/App.xcworkspace`。
- 选择 App target → Signing & Capabilities，选择自己的 Team，修改唯一 Bundle Identifier。
- 连接 iPhone，选择设备 Run。
- 或者用 Sideloadly / AltStore 重签 `Rinse-0.1.0-ios-unsigned.ipa`。
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

## 自动化证据

| 检查        | 命令                      | 结果             |
| ----------- | ------------------------- | ---------------- |
| 单元测试    | `npm test`                | 16 passed        |
| 移动端 E2E  | `npm run test:e2e`        | 11 passed        |
| 类型        | `npm run typecheck`       | passed           |
| Lint        | `npm run lint`            | passed           |
| 格式        | `npm run format:check`    | passed           |
| Android APK | `./gradlew assembleDebug` | BUILD SUCCESSFUL |
| iOS 模拟器  | GitHub Actions macOS      | 以 CI 日志为准   |

## 发布产物验收

- [ ] GitHub Release 包含 APK、未签名 IPA、模拟器 zip、SHA256SUMS.txt。
- [ ] `sha256sum -c SHA256SUMS.txt` 全部通过。
- [ ] APK 能在干净的 Android 设备/模拟器安装。
- [ ] 未签名 IPA 能被重签工具识别（不要求直接安装）。
- [ ] 模拟器 zip 能在 macOS Xcode Simulator 中启动。
- [ ] 真机验收记录补充到本文件。
