# Rinse v0.1.3 发布说明

本地优先清洁周期追踪器，提供 Android、iOS 与 Web 版本。

这一版按 [Figma Make 原型（Version 26）](https://www.figma.com/make/zpog9lRPWVomLBPYMTKvOp/Rinse-Cleaning-Cycle-Tracker) 重做了首页视觉与信息结构，上一版的旧首页布局已被完全替换。

## 本版更新

- **首页重做**：柔和渐变背景 + 半透明玻璃卡片；标题、摘要、历史入口、触控提示与底部 `+` 按钮重新排布，贴近当前 Figma 原型。
- **三视图切换**：卡片底部新增 Bubbles / Grid / List 分段切换；水泡、网格、列表共享同一份紧急度排序。
  - 水泡视图：有机错落分布，最急的水泡居中放大，其余按紧急度向外扩散。
  - 网格视图：两列圆角方块，前两个最急项目使用深色底，可滚动查看全部项目。
  - 列表视图：完整清单，显示周期、状态与剩余天数。
- **统一的紧急度色彩**：从深蓝到近白的连续色阶；逾期、今天、剩余天数分别用深色、中色、浅色表达。
- **长按与回弹**：水泡和网格共用 0.65 秒长按清洁逻辑，保留触感、气泡音效与按压缩放动画。
- **原生面板修正**：Android WebView 109 上固定定位的详情/备份面板会透出背景残影；本版在原生端使用不透明、无动画的面板，消除重影与闪烁。
- **小屏适配**：360 × 740 与 375 × 667 下压缩水泡尺寸与字号；列表底部留出触控提示和分段切换的空间，最后一行不再压住控件。
- **WebView 109 兼容**：移除不被 Chrome 109 支持的 `color-mix()` 依赖，网格改用白色叠加 + 主题色回退，旧版 Android WebView 也能正确显示。
- **版本同步**：Android versionCode 4 / versionName 0.1.3，iOS build 4 / version 0.1.3。

## 功能

- 水泡 / 网格 / 列表三种首页视图，按紧急度自动排序。
- 按住 0.65 秒完成清洁；轻点打开详情。
- 详情面板：下次周期、上次清洁、重复频率、Mark as cleaned、Edit、Delete。
- 新增/编辑周期：名称、1–365 天间隔、预设 1/7/30/60 天、上次清洁日期。
- 历史日志：记录每次清洁，可 Undo 恢复上一次日期。
- 本地持久化：Android SharedPreferences、iOS UserDefaults、Web localStorage。
- 备份：复制或下载 JSON；恢复时可预览条目数，再替换本机数据。
- 原生细节：Android 返回键分层返回、触感/气泡音效、状态栏与安全区适配、竖屏锁定、跨午夜自动刷新。

## 下载文件

- `Rinse-0.1.3-android-debug.apk` — Android debug 签名 APK，可直接侧载。
- `Rinse-0.1.3-ios-unsigned.ipa` — iOS 未签名 IPA，需要自行用 Apple ID 重签。
- `Rinse-0.1.3-ios-simulator.zip` — iOS 模拟器 App，需要 macOS + Xcode。
- `SHA256SUMS.txt` — 校验和。

## 验证情况

- Web：lint、格式、类型检查、22 项单元测试、14 项移动端 E2E 全部通过；E2E 覆盖三视图切换、长按清洁、历史撤销、跨午夜刷新与 360 × 740 窄屏无横向滚动。
- Android：API 33 x86_64 模拟器（1080 × 2400，WebView 109）完成安装、冷启动、三视图、详情、新增、长按清洁、历史、备份与恢复验证；首页、网格、列表、历史、备份均有截图。
- iOS：GitHub Actions macOS 15 runner 构建并启动模拟器包，同时构建设备未签名 IPA；本地环境为 Windows，无法在真机上运行验证；真机安装需要用户自己的 Apple 签名。
- 原生视觉：按原型核对卡片圆角、底部切换、水泡尺寸层级、网格深色首行与列表行距；Android 端截图见 README。

## 已知限制

- 暂无云同步、账号或通知；数据只在本机，跨设备迁移需手动复制备份。
- Android APK 未使用 release keystore 签名，不适合直接上架 Google Play。
- iOS 没有 Apple Developer 证书，因此只发布未签名 IPA 与模拟器包；真机安装与运行需要用户自行签名。
- 水泡视图在项目超过 9 个时会复用同一组有机位置，可能出现水泡重叠；列表与网格可完整滚动查看所有项目。

## 校验

```bash
sha256sum -c SHA256SUMS.txt
```

或在 Windows PowerShell 中：

```powershell
Get-FileHash .\Rinse-0.1.3-android-debug.apk -Algorithm SHA256
```
