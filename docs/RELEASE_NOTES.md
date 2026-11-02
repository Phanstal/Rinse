# Rinse v0.1.5 发布说明

本地优先清洁周期追踪器，提供 Android、iOS 与 Web 版本。

这一版先通过 Figma MCP 重新抓取 [Figma Make 原型](https://www.figma.com/make/zpog9lRPWVomLBPYMTKvOp/Rinse-Cleaning-Cycle-Tracker) 的最新源码，并与 v0.1.4 基线逐字节比较，确认最新版界面代码（`App.tsx`、`index.css`）没有变化。真正需要补齐的是**品牌资产**：最新 Make 使用单颗 3D 玻璃水泡图标，而 Android / iOS 的桌面图标、启动画面和 PWA 图标此前仍是旧的三水泡插画。v0.1.5 把最新图标同步到全部运行面。

## 本版更新

- **最新 Make 核对**：最新 `App.tsx` SHA-256 `86AB0DEC…EE42C`、`index.css` SHA-256 `DC96BBEF…F3221`，与 v0.1.4 基线一致，界面布局与交互无需重做。
- **Web 图标**：头部 256px 品牌图标、favicon、Apple touch icon、PWA 192/512 图标全部换为最新单水泡图标。
- **PWA manifest**：修正图标路径与 MIME，新增 `public/icons/`，安装到桌面后使用新图标。
- **Android 桌面图标**：重新生成全部密度 `ic_launcher`、圆形图标、自适应图标前景/背景，统一为最新图标。
- **Android 启动画面**：全部 26 张横竖屏 / 深浅色 splash 改为新图标 + `rinse` 字标。
- **iOS**：`AppIcon-512@2x.png` 与 6 张启动图替换为最新图标，保持不透明 App Icon。
- **版本同步**：Android versionCode 6 / versionName 0.1.5，iOS build 6 / version 0.1.5。

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

- `Rinse-0.1.5-android-debug.apk` — Android debug 签名 APK，可直接侧载。
- `Rinse-0.1.5-ios-unsigned.ipa` — iOS 未签名 IPA，需要自行用 Apple ID 重签。
- `Rinse-0.1.5-ios-simulator.zip` — iOS 模拟器 App，需要 macOS + Xcode。
- `SHA256SUMS.txt` — 校验和。

## 验证情况

- Web：lint、格式、类型检查、22 项单元测试、15 项移动端 E2E 全部通过。
- Android：API 33 x86_64 模拟器（1080 × 2400）卸载重装 0.1.5 APK，确认桌面图标为最新的单颗玻璃水泡、启动画面为 `rinse` 字标，核心流程无回归。
- iOS：GitHub Actions macOS 15 runner 构建设备未签名 IPA 与模拟器 App；资源目录由 Xcode 资源编译器校验并打包。
- 真实界面代码与最新 Make 一致，本轮不重做布局；详细对比见 `REPORT.md`。

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
Get-FileHash .\Rinse-0.1.5-android-debug.apk -Algorithm SHA256
```
