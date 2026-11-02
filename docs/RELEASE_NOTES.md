# Rinse v0.1.4 发布说明

本地优先清洁周期追踪器，提供 Android、iOS 与 Web 版本。

这一版直接按 [Figma Make 原型（Version 26）](https://www.figma.com/make/zpog9lRPWVomLBPYMTKvOp/Rinse-Cleaning-Cycle-Tracker) 的源文件重新同步界面，修正了 v0.1.3 仍残留旧版头部、摘要与三视图的问题。

## 本版更新

- **品牌头部**：改为 `rinse` 图标 + 字标，右侧是设置与清洁历史两个圆形图标按钮；移除旧版大标题、摘要和副标题。
- **双视图首页**：只保留 Bubbles / List 两个视图，分段切换移回玻璃卡片底部；列表行、剩余天数和状态色与 Make 一致。
- **设置页**：新增 Notifications 开关、Privacy 展开说明、Backup & restore 入口，以及需要长按 1.2 秒确认的 Delete cleaning data。
- **历史页**：改为 `ACTIVITY / Cleaning log` 结构；保留记录胶囊、Undo 与 Make 的空状态，备份入口移到设置。
- **按压节奏**：长按清洁由 0.65 秒改为 Make 的 0.4 秒；轻点仍打开详情。
- **空状态**：改为 `Start with one small thing.` 的首项添加引导，不再复用旧版摘要。
- **WebView 109 兼容**：移除水泡底色对 `color-mix()` 的依赖，改用主题色变量 + 白色半透明叠层；在 Android 13 / WebView 109 模拟器上确认深色中心水泡与浅色外围水泡文字均可读。
- **版本同步**：Android versionCode 5 / versionName 0.1.4，iOS build 5 / version 0.1.4。

## 功能

- 水泡 / 列表两种首页视图，按紧急度自动排序。
- 按住 0.4 秒完成清洁；轻点打开详情。
- 详情面板：下次周期、上次清洁、重复频率、Mark as cleaned、Edit、Delete。
- 新增/编辑周期：名称、1–365 天间隔、预设 1/7/30/60 天、上次清洁日期。
- 历史日志：记录每次清洁，可 Undo 恢复上一次日期。
- 本地持久化：Android SharedPreferences、iOS UserDefaults、Web localStorage。
- 备份：设置中复制或下载 JSON；恢复时可预览条目数，再替换本机数据。
- 原生细节：Android 返回键分层返回、触感/气泡音效、状态栏与安全区适配、竖屏锁定、跨午夜自动刷新。

## 下载文件

- `Rinse-0.1.4-android-debug.apk` — Android debug 签名 APK，可直接侧载。
- `Rinse-0.1.4-ios-unsigned.ipa` — iOS 未签名 IPA，需要自行用 Apple ID 重签。
- `Rinse-0.1.4-ios-simulator.zip` — iOS 模拟器 App，需要 macOS + Xcode。
- `SHA256SUMS.txt` — 校验和。

## 验证情况

- Web：lint、格式、类型检查、22 项单元测试、15 项移动端 E2E 全部通过；E2E 覆盖品牌头部、双视图切换、设置页与通知开关、隐私展开、长按删除保护、400ms 长按清洁、历史撤销、备份恢复、跨午夜刷新与 360 × 740 窄屏无横向滚动。
- Android：API 33 x86_64 模拟器（1080 × 2400，WebView 109）完成卸载重装、冷启动、双视图、设置、详情、新增、清洁、历史、备份与删除确认验证；`dumpsys` 确认 versionCode 5 / versionName 0.1.4，首页、列表、设置、详情、历史、备份均有截图。
- iOS：GitHub Actions macOS 15 runner 构建模拟器包并在 iPhone 16 Pro 模拟器安装、启动、截图，同时构建设备未签名 IPA；本地环境为 Windows，无法在真机上运行验证；真机安装需要用户自己的 Apple 签名。

## 已知限制

- 暂无云同步、账号或通知；数据只在本机，跨设备迁移需手动复制备份。
- Android APK 未使用 release keystore 签名，不适合直接上架 Google Play。
- iOS 没有 Apple Developer 证书，因此只发布未签名 IPA 与模拟器包；真机安装与运行需要用户自行签名。
- 水泡视图在项目超过 9 个时会复用同一组有机位置，可能出现水泡重叠；列表可完整滚动查看所有项目。

## 校验

```bash
sha256sum -c SHA256SUMS.txt
```

或在 Windows PowerShell 中：

```powershell
Get-FileHash .\Rinse-0.1.4-android-debug.apk -Algorithm SHA256
```
