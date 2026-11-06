# Rinse v0.1.7 改版报告

## 1. 结论

本轮继续按「**design 看布局，Make 看交互**」修正首页细节与移动端输入体验：

- 从 [Figma 设计稿](https://www.figma.com/design/7q0bEgPhRQg1B4k9LHF5xy/Untitled) 确认长按提示位于玻璃卡片顶部，而不是底部。
- 从最新 [Figma Make 原型](https://www.figma.com/make/zpog9lRPWVomLBPYMTKvOp/Rinse-Cleaning-Cycle-Tracker) 读取交互源码，确认排序改为字面剩余天数、提示加入 3.2 秒呼吸、表单字号提升到 16px。
- 同时处理 iOS Safari 输入聚焦自动放大与键盘收起后比例异常：所有表单控件不低于 16px，并在根元素声明 `-webkit-text-size-adjust: 100%`。
- 水泡颜色仍由排序位置决定：排在最前的逾期项目最深，越往后越浅；剩余天数相同时由最近清洁时间维持稳定顺序。

## 2. 设计与交互对齐

### 2.1 设计稿布局

- 长按提示 `Press and hold a bubble when it’s clean` 位于卡片顶部，居中、蓝灰色、加粗。
- 水泡区域从提示下方开始，中央创建水泡/主水泡保持原有尺寸与位置。
- 底部仍是 Bubbles / List 双视图切换；有项目时才有切换与底部加号。

实现上将 `.hold-hint` 从 `bottom: 62px` 改为 `top: 18px`，并把水泡区域 `inset` 顶部从 14px 增加到 48px，确保提示与第一行水泡不重叠。列表视图不再显示长按提示，因为该手势只作用于水泡。

### 2.2 Make 交互

最新 Make 的关键变化：

| 变化          | Make 行为                                               | 本项目实现                                          |
| ------------- | ------------------------------------------------------- | --------------------------------------------------- |
| 排序          | `remainingDays(a) - remainingDays(b)`，再按 `cleanedAt` | `sortItems` 改为相同比较逻辑                        |
| 颜色          | 继续用排序下标映射七档色板                              | 保持 `cycleColor(index, total)`                     |
| 提示位置      | 卡片顶部                                                | `.home-card .hold-hint { top: 18px }`               |
| 提示动画      | 3.2s 循环透明度变化                                     | `hint-breathe` 3.2s，0.8–1.0                        |
| 表单字号      | 16px                                                    | 编辑三个输入框 + 备份 textarea 均为 16px            |
| 页面缩放保护  | `-webkit-text-size-adjust: 100%`                        | 根元素同时设置标准与 `-webkit-` 版本                |
| Reduce Motion | 缩短所有动画                                            | 呼吸动画完全停止，保持 0.9 静态透明度，其余动画缩短 |

## 3. 本版改动

### 3.1 排序与颜色

- `src/domain/rinse.ts`
  - 新增 `remainingDays(item, now)`，统一「剩余天数」口径，`remainingCopy` 复用它。
  - `sortItems` 从 `urgency`（清洁进度比例）改为剩余天数升序。
  - 剩余天数相同时继续按 `cleanedAt` 升序；没有清洁时间时保持原数组顺序（现代 JS 稳定排序）。
- `src/features/home/HomeView.tsx`、`BubbleField.tsx`
  - 列表与气泡都消费同一份 `sortItems` / `visibleItems`。
  - 颜色继续按排序下标映射：第 0 颗最深，最后一颗最浅。因此「剩余天数最少的最深、最多的最浅」由排序保证，逾期项目优先占据中心与深色。
- `src/styles/base.css`
  - 提示移到顶部并提升对比度（`#54758a`，11px/600）。
  - 新增 `hint-breathe` 关键帧：0% / 100% 透明度 0.8，50% 为 1，周期 3.2 秒，`ease-in-out`。
  - Reduce Motion 下 `animation: none; opacity: 0.9`，避免无限动画被压成 0.01ms 后产生异常闪烁。

### 3.2 移动端输入与页面比例

- `src/styles/base.css`
  - `html` 增加 `-webkit-text-size-adjust: 100%` 与 `text-size-adjust: 100%`。
  - `.editor input, .editor select` 字号从 14px 提升到 16px。
- `src/styles/app.css`
  - `.restore-panel textarea` 从 11px 提升到 16px；备份 JSON 文本框同样会触发 iOS 聚焦缩放，不能遗漏。
- 不通过 `maximum-scale=1` 禁用缩放：保留用户双指缩放能力，只消除 Safari 因控件字号不足产生的自动放大。

### 3.3 测试

- `tests/unit/rinse.test.ts`
  - 排序用例改为按剩余天数断言，覆盖 `[-2, -1, 1, 4, 4, 5, 6, 29]`。
  - 新增「100 天周期剩 5 天」与「10 天周期剩 1 天」的对比：旧比例排序会把前者排前，新逻辑必须把后者排前。
  - 保留同剩余天数按 `cleanedAt` 稳定排序的用例。
- `tests/e2e/rinse.spec.ts`
  - 新增顶部提示位置/字号/字重/3.2s 动画断言，并确认提示在首颗水泡上方、列表视图消失。
  - 新增 Reduce Motion 下 `animationName: none`、`opacity: 0.9` 断言。
  - 新增编辑面板三个输入框均为 16px、备份 textarea 为 16px、根元素 `-webkit-text-size-adjust: 100%` 断言。
  - 原有 16 项 E2E 全部保留。

## 4. 验证

### 4.1 自动化

| 检查      | 命令                   | 结果      |
| --------- | ---------------------- | --------- |
| Lint      | `npm run lint`         | passed    |
| 格式      | `npm run format:check` | passed    |
| 类型      | `npm run typecheck`    | passed    |
| 单元测试  | `npm test`             | 27 passed |
| 移动 E2E  | `npm run test:e2e`     | 18 passed |
| Web build | `npm run build`        | passed    |

### 4.2 Android 实机/模拟器

环境：Android 13 / API 33 x86_64 模拟器，1080 × 2400，`habitica_test_api33`。

- 安装 v0.1.7 debug APK；`dumpsys` 确认 `versionCode=8`、`versionName=0.1.7`。
- 清除数据后首次进入：顶部提示、中央创建水泡、无切换/加号。
- 创建 8 个相对日期项目后：水泡与列表均按 `2d overdue → 1d overdue → 1 day left → 4 → 4 → 5 → 6 → 29 days left` 排列。
- 编辑面板弹出软键盘后通过 WebView DevTools 读取：`visualViewport.scale = 1`、`visualViewport.width = innerWidth = 412`、`scrollWidth = 412`、`inputFont = 16px`、`-webkit-text-size-adjust = 100%`，未发生页面放大或横向溢出。
- 截图：`docs/screenshots/native-android-first-run.png`、`native-android-home.png`、`native-android-list.png`、`native-android-editor.png`、`native-android-settings.png`、`native-android-backup.png`、`native-android-history.png`。

### 4.3 Web

- 430 × 932 首屏：顶部提示、中央创建水泡与设计稿一致。
- 8 个项目：气泡与列表顺序一致，中心为 `2d overdue` 的 Kitchen counter，最外圈为 `29 days left` 的 Fridge。
- 编辑/备份：所有输入框计算字号 16px；根元素 `-webkit-text-size-adjust: 100%`。
- 360 × 740：无横向滚动；E2E 18 项通过。
- 截图：`docs/screenshots/web-first-run.png`、`web-home.png`、`web-list.png`、`web-editor.png`。

### 4.4 iOS

- 本地为 Windows，无法运行 Xcode Simulator。
- iOS 构建由 GitHub Actions macOS runner 完成；`ios/App` 版本已同步为 `0.1.7 (8)`。
- 输入缩放保护使用标准 CSS，与 Web/Android 共享同一份资源；CI 在 iPhone 16 Pro 模拟器安装、启动并截图。
- 真机安装仍需在 Mac 上使用自己的签名完成。

## 5. 版本

- 应用版本：`0.1.7`
- Android：`versionCode 8` / `versionName 0.1.7`
- iOS：`CURRENT_PROJECT_VERSION 8` / `MARKETING_VERSION 0.1.7`
- npm：`package.json` 与 `package-lock.json` 均为 `0.1.7`

## 6. 发布产物

- GitHub Release：[v0.1.7](https://github.com/Phanstal/Rinse/releases/tag/v0.1.7)
- Release workflow：[run 42164562139](https://github.com/Phanstal/Rinse/actions/runs/42164562139)，Android / iOS / Publish 三个 job 全部成功。
- CI：[run 42163584403](https://github.com/Phanstal/Rinse/actions/runs/42163584403)，Web、Android、iOS 三个 job 全部成功；iOS 截图来自同一提交的 [run 42162492788](https://github.com/Phanstal/Rinse/actions/runs/42162492788)。
- 已从 Release 下载全部产物并逐项计算 SHA-256，与 `SHA256SUMS.txt` 完全一致。

| 文件                            | 大小（字节） | SHA-256                                                            |
| ------------------------------- | ------------ | ------------------------------------------------------------------ |
| `Rinse-0.1.7-android-debug.apk` | 6,784,084    | `eb94e52702e89ae99c86211cd33660c64ccd2a4c863b83332aff5e0bf819e826` |
| `Rinse-0.1.7-ios-unsigned.ipa`  | 4,637,360    | `4762fcceb04586c38821e48d676d51bb8fe4730a409067ef4ef0ce69feebcb49` |
| `Rinse-0.1.7-ios-simulator.zip` | 5,165,936    | `f8b57150bf5b2550974ca44ccfb383c78d08a1dd02a607edf9537418aae4d65a` |

产物校验：

- APK：`aapt` 确认 `com.phanstal.rinse`、versionCode `8`、versionName `0.1.7`；`apksigner` 确认为 Android Debug 证书；在 API 33 模拟器卸载本地 debug 包后全新安装 Release APK，启动显示 v0.1.7 首次进入界面。
- IPA：解包 `Payload/App.app/App` 为 arm64，Info.plist 为 `0.1.7 (8)`、Bundle ID `com.phanstal.rinse`、MinimumOSVersion `13.0`；未签名，需重签。
- 模拟器 zip：`App.app` 的 Info.plist 同为 `0.1.7 (8)`，可执行文件同时包含 x86_64 与 arm64。

## 7. 已知限制

- 排序使用设备本地日历日；跨时区旅行时，剩余天数会按新时区重新计算。
- 水泡视图只有 9 个有机位置；超过 9 个项目会复用位置，列表仍可完整查看。
- Android APK 仍是 debug 签名，不适合直接上架 Google Play；iOS 仍只提供未签名 IPA 与模拟器包。

## 8. 相关文档

- [README](README.md)
- [真机验收清单](docs/ACCEPTANCE.md)
- [发布说明](docs/RELEASE_NOTES.md)
- [v0.1.6 报告](https://github.com/Phanstal/Rinse/blob/v0.1.6/REPORT.md)
- [GitHub Release v0.1.7](https://github.com/Phanstal/Rinse/releases/tag/v0.1.7)
