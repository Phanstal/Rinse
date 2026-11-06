# Rinse v0.1.7 发布说明

本地优先清洁周期追踪器，提供 Android、iOS 与 Web 版本。

这一版继续按「Figma 设计看布局、Figma Make 看交互」对齐首页：长按提示移到水泡区域顶部并加入轻微呼吸，水泡改为严格按剩余天数排序，同时统一放大表单字号并阻止 iOS Safari 聚焦输入框时放大页面。

## 本版更新

- **顶部呼吸提示**：`Press and hold a bubble when it’s clean` 从卡片底部移到水泡区域顶部，字号 11px、字重 600，使用更深的蓝灰色提升对比度；以 3.2 秒循环在 0.8–1.0 透明度之间缓慢呼吸，不使用缩放或位移。
- **Reduce Motion**：系统开启「减少动态效果」时停止呼吸动画，保持 0.9 不透明度的清晰静态提示；其余进入/回弹动画也按系统偏好缩短。
- **按剩余天数排序**：水泡与列表不再按「已过时间 / 周期」的比例排序，而是按字面剩余天数升序排列。逾期最多的最前，剩余 1 天的长周期会排在剩余 5 天的短周期之前。
- **同天稳定顺序**：剩余天数相同时，按最近一次清洁时间保持稳定顺序，避免同一份数据在刷新后跳动。
- **颜色层级**：颜色继续随排序位置由深到浅，因此剩余天数越少越深、越多越浅；逾期水泡保持深蓝，最远的项目退到接近白色的浅色。
- **输入框 16px**：新增/编辑周期的名称、间隔、日期输入框，以及备份恢复的 JSON 文本框，统一提升到 16px。
- **防止页面放大**：增加 `-webkit-text-size-adjust: 100%`，并让所有表单控件不低于 16px，避免 iOS Safari 在输入框聚焦或键盘收起时自动放大页面，导致文字与布局比例异常。
- **版本同步**：Android versionCode 8 / versionName 0.1.7，iOS build 8 / version 0.1.7。

## 功能

- 水泡 / 列表两种首页视图，严格按剩余天数排序并共享同一套颜色层级。
- 按住 0.4 秒完成清洁；轻点打开详情。
- 详情面板：下次周期、上次清洁、重复频率、Mark as cleaned、Edit、Delete。
- 新增/编辑周期：名称、1–365 天间隔、预设 1/7/30/60 天、上次清洁日期。
- 历史日志：记录每次清洁，可 Undo 恢复上一次日期。
- 本地持久化：Android SharedPreferences、iOS UserDefaults、Web localStorage。
- 备份：设置中复制或下载 JSON；恢复时可预览条目数，再替换本机数据。
- 原生细节：Android 返回键分层返回、触感/气泡音效、状态栏与安全区适配、竖屏锁定、跨午夜自动刷新。

## 下载文件

- `Rinse-0.1.7-android-debug.apk` — Android debug 签名 APK，可直接侧载。
- `Rinse-0.1.7-ios-unsigned.ipa` — iOS 未签名 IPA，需要自行用 Apple ID 重签。
- `Rinse-0.1.7-ios-simulator.zip` — iOS 模拟器 App，需要 macOS + Xcode。
- `SHA256SUMS.txt` — 校验和。

## 验证情况

- Web：lint、格式、类型检查、27 项单元测试、18 项移动端 E2E 全部通过。
- 排序：单元测试覆盖「100 天周期剩 5 天」排在「10 天周期剩 1 天」之后，以及同剩余天数按清洁时间稳定排序；E2E 覆盖列表顺序与双视图排序一致。
- 提示：E2E 断言提示位于首颗水泡上方、字号 11px、字重 600、3.2 秒 `hint-breathe` 动画，并在 Reduce Motion 下变为静态 0.9 透明度；列表视图不显示长按提示。
- 输入：E2E 断言编辑面板三个输入框与备份 JSON 文本框均为 16px，根元素 `-webkit-text-size-adjust` 为 `100%`。
- Android：API 33 x86_64 模拟器（1080 × 2400）安装 v0.1.7 APK，验证 8 个水泡按剩余天数排序、顶部提示、列表切换；编辑面板弹出软键盘后 `visualViewport.scale = 1`、页面宽度不变、无横向滚动，输入框计算字号为 16px。
- iOS：GitHub Actions macOS runner 构建未签名 IPA 与模拟器 App；共享 Web 资源与 Android/Web 一致，iOS 键盘缩放保护通过同一套 CSS 生效。

## 已知限制

- 暂无云同步、账号或通知；数据只在本机，跨设备迁移需手动复制备份。
- 旧示例迁移只移除未被触碰过的内置示例；改名、改间隔或清洁过的示例按用户数据处理并保留。
- 水泡视图只有 9 个有机位置；超过 9 个项目会复用位置，列表仍可完整查看。
- Android APK 未使用 release keystore 签名，不适合直接上架 Google Play。
- iOS 没有 Apple Developer 证书，因此只发布未签名 IPA 与模拟器包；真机安装与运行需要用户自行签名。

## 校验

```bash
sha256sum -c SHA256SUMS.txt
```

或在 Windows PowerShell 中：

```powershell
Get-FileHash .\Rinse-0.1.7-android-debug.apk -Algorithm SHA256
```
