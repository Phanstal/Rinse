# Rinse v0.1.6 发布说明

本地优先清洁周期追踪器，提供 Android、iOS 与 Web 版本。

这一版按 Figma 设计补齐首次进入体验，并按最新 [Figma Make 原型](https://www.figma.com/make/zpog9lRPWVomLBPYMTKvOp/Rinse-Cleaning-Cycle-Tracker) 的交互调整首屏。新安装不再预置示例清洁项目，而是先让用户创建第一颗自己的水泡。

## 本版更新

- **首次进入引导**：新安装只显示中央创建水泡与提示 `Tap to create your first cleaning bubble`；没有 Bubbles / List 切换、没有底部 `+`，也没有示例数据。
- **首颗水泡**：保存第一个项目后，创建水泡消失，新项目成为中央主水泡；双视图切换与底部加号出现，可继续添加更多空间。
- **删除后回到引导**：删除最后一个项目或「删除全部数据」后，首页回到中央创建水泡，不会出现没有入口的空屏。
- **旧示例自动清理**：升级时自动移除 v0.1.5 及更早版本中未被编辑、未被清洁的 8 个默认示例；自定义项目、改过的示例与已有清洁历史保留。
- **布局对齐**：新增 `Your home, at a glance.` 标题，卡片顶部、中央水泡与底部提示按 Figma 设计稿重新对齐；360 × 740 窄屏也保持三行文案不溢出。
- **版本同步**：Android versionCode 7 / versionName 0.1.6，iOS build 7 / version 0.1.6。

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

- `Rinse-0.1.6-android-debug.apk` — Android debug 签名 APK，可直接侧载。
- `Rinse-0.1.6-ios-unsigned.ipa` — iOS 未签名 IPA，需要自行用 Apple ID 重签。
- `Rinse-0.1.6-ios-simulator.zip` — iOS 模拟器 App，需要 macOS + Xcode。
- `SHA256SUMS.txt` — 校验和。

## 验证情况

- Web：lint、格式、类型检查、27 项单元测试、16 项移动端 E2E 全部通过。
- Android：API 33 x86_64 模拟器（1080 × 2400）卸载重装 0.1.6 APK，验证首次进入、创建第一颗、底部加号添加第二颗、列表切换与重启持久化；通过原生 Preferences 注入旧示例后确认自动清理。
- iOS：GitHub Actions macOS runner 构建未签名 IPA 与模拟器 App；共享 Web 资源与 Android/Web 一致。
- 真实界面代码与最新 Make 的首次进入交互一致，布局按 Figma 设计稿对齐；详细对比见 `REPORT.md`。

## 已知限制

- 暂无云同步、账号或通知；数据只在本机，跨设备迁移需手动复制备份。
- 旧示例迁移只移除未被触碰过的内置示例；改名、改间隔或清洁过的示例按用户数据处理并保留。
- Android APK 未使用 release keystore 签名，不适合直接上架 Google Play。
- iOS 没有 Apple Developer 证书，因此只发布未签名 IPA 与模拟器包；真机安装与运行需要用户自行签名。

## 校验

```bash
sha256sum -c SHA256SUMS.txt
```

或在 Windows PowerShell 中：

```powershell
Get-FileHash .\Rinse-0.1.6-android-debug.apk -Algorithm SHA256
```
