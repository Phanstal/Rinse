# Rinse v0.1.1 发布说明

公开版本更新，提供 Android 与 iOS 原生外壳，以及可在浏览器中运行的本地优先 Web 版本。

## 本版修正

- 修正 iOS 与 Web 上深色紧急水泡被 `color-mix` 冲淡的问题；紧急水泡恢复原型的深蓝层次，浅色水泡继续保留玻璃质感。
- 同步更新版本号：Android versionCode 2 / versionName 0.1.1，iOS build 2 / version 0.1.1。

## 功能

- 水泡首页：8 个预置清洁周期，按紧急度排序并以颜色、大小区分。
- 按住 0.65 秒完成清洁；轻点打开详情。
- 详情面板：下次周期、上次清洁、重复频率、Mark as cleaned、Edit、Delete。
- 新增/编辑周期：名称、1–365 天间隔、预设 1/7/30/60 天、上次清洁日期。
- 历史日志：记录每次清洁，可 Undo 恢复上一次日期。
- 列表视图：水泡视图之外的完整可滚动视图。
- 本地持久化：Android SharedPreferences、iOS UserDefaults、Web localStorage。
- 原生细节：Android 返回键分层返回、触感/气泡音效、状态栏与安全区适配、竖屏锁定。

## 下载文件

- `Rinse-0.1.1-android-debug.apk` — Android debug 签名 APK，可直接侧载。
- `Rinse-0.1.1-ios-unsigned.ipa` — iOS 未签名 IPA，需要自行用 Apple ID 重签。
- `Rinse-0.1.1-ios-simulator.zip` — iOS 模拟器 App，需要 macOS + Xcode。
- `SHA256SUMS.txt` — 校验和。

## 验证情况

- Web：lint、格式、类型检查、16 项单元测试、11 项移动端 E2E 全部通过。
- Android：API 33 x86_64 模拟器上完成安装、启动、详情、新增（含软键盘）、按住清洁、历史撤销、返回键、重启持久化验证。APK 为 debug 签名，并已用 CI 产物复装验证。
- iOS：GitHub Actions macOS 14 runner 上模拟器构建通过；设备目标由 release workflow 构建未签名 IPA。本地环境为 Windows，无法在本机完成模拟器或真机运行验证。真机安装需要用户自己的 Apple 签名。

## 已知限制

- 暂无云同步、账号、通知、导出/导入；数据只在本机。
- Android APK 未使用 release keystore 签名，不适合直接上架 Google Play。
- iOS 没有 Apple Developer 证书，因此只发布未签名 IPA 与模拟器包。
- iOS 真机安装与运行需要用户自行签名；签名有效期取决于 Apple ID 类型。

## 校验

```bash
sha256sum -c SHA256SUMS.txt
```

或在 Windows PowerShell 中：

```powershell
Get-FileHash .\Rinse-0.1.1-android-debug.apk -Algorithm SHA256
```
