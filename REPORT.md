# Rinse v0.1.6 改版报告

## 1. 结论

本轮按「**design 看布局，Make 看交互**」完成首次进入体验：

- 从 Figma 设计文件读取首屏布局：品牌头部、`Your home, at a glance.` 标题、玻璃卡片、中央创建水泡与底部触控提示；设计中没有 Bubbles / List 切换、底部加号或示例项目。
- 从最新 [Figma Make 原型](https://www.figma.com/make/zpog9lRPWVomLBPYMTKvOp/Rinse-Cleaning-Cycle-Tracker) 读取交互源码，确认首屏使用 `Tap to create your first cleaning bubble`，创建第一颗水泡后切换与底部加号才出现。
- 同时按需求清理 v0.1.5 及更早版本写入的默认示例数据；迁移只删除**未被用户触碰过**的示例，避免误删自定义项目或清洁历史。

v0.1.5 的界面基线是 Make Version 26。本轮最新 Make 只改了两个文件：

| 文件            | 最新 SHA-256                                                       | 相对 v26  |
| --------------- | ------------------------------------------------------------------ | --------- |
| `src/App.tsx`   | `B9CC83575A291CEA759E2EB40CA56F7462808B5D2BDEE26F402DC08096505008` | +38 / −13 |
| `src/index.css` | `C70F27B86B2DADEA081CEAA077A6D8B216CBF824563387FF315D926884561669` | +15 / −1  |

增量集中在首次进入状态与创建水泡，其余界面沿用 v0.1.5。设计稿的布局已同步到 Web、Android 与 iOS 共用的 CSS，而不是只改某一个运行面。

## 2. 设计布局与 Make 交互

### 2.1 设计稿首屏

- 顶部：`rinse` 品牌图标与字标，右侧 Settings / Cleaning history 两个圆形按钮。
- 标题：`Your home, at a glance.`，位于头部下方。
- 主卡片：半透明圆角玻璃卡片，顶部约在 126px（考虑安全区）。
- 中央：一颗深蓝色创建水泡，白色 `+` 与三行文案 `Tap to create` / `your first` / `cleaning bubble`。
- 底部：`Press and hold a bubble when it’s clean` 提示。
- 首屏没有分段切换、没有底部 `+`、没有默认示例项目。

### 2.2 Make 交互

最新 Make `src/App.tsx` 引入 `HAS_CREATED_KEY = 'rinse-has-created-v1'`，并用一个持久化标记决定是否展示创建水泡；示例数组改为空。其关键逻辑：

```ts
const showCreateBubble = !hasCreatedBubble && items.length === 0;
```

本项目没有照搬 `hasCreated` 标记，而是直接用 `items.length === 0` 判断。原因是：如果只依赖一次性标记，用户删除最后一个项目后会得到一个没有创建入口的死屏；以项目数量为准可以让「删空 → 重新创建第一颗」自然闭环。两种实现的首屏与创建后表现一致。

## 3. 本版改动

### 3.1 领域与持久化

- `src/domain/rinse.ts`
  - 新增 `LegacySampleDefinition`、`LEGACY_SAMPLE_ITEMS`、`LEGACY_SAMPLE_BY_ID`、`LEGACY_SAMPLE_DAYS_AGO`，完整保留 v0.1.5 八个示例的 id、名称、间隔与相对日期。
  - `createSampleItems(now)` 保留为迁移测试与旧数据构造工具。
  - `createInitialData()` 改为 `{ items: [], history: [] }`。
  - 新增 `pruneLegacySamples(data)`：仅移除 id、名称、间隔都与旧示例一致，且没有 `cleanedAt`、没有历史记录的条目；自定义项目、改过名称/间隔的示例、清洁过的示例与其历史全部保留。
- `src/features/useRinse.ts`
  - 首次启动加载空库。
  - 已有数据先经过 `pruneLegacySamples`；仅在条目实际减少时写回，避免每次启动重复写存储。

### 3.2 首页与视觉

- `src/features/home/HomeView.tsx`
  - 新增 `Your home, at a glance.` 标题。
  - 移除旧的「Start with one small thing.」空状态。
  - 有项目时才渲染 Bubbles / List 切换与底部加号；空库时始终渲染创建水泡。
- `src/features/home/BubbleField.tsx`
  - 新增 `onCreate` / `showCreate`。
  - 空库时中央渲染 `button.bubble.bubble-position-0.create-bubble`，包含 `+` 与精确文案，`aria-label="Create a cleaning bubble"`。
  - 创建水泡使用 `--x: 50%` / `--y: 50%`，其他项目的位置与颜色索引向后偏移一位。
  - 文案使用显式三行换行，保证 360 × 740、430 × 852 与 Android 1080 × 2400 下都与设计稿一致。
- `src/styles/base.css`
  - 新增 `.home-tagline`、`.create-bubble` 及卡片顶部/提示位置调整，匹配设计稿。
  - 创建水泡在窄屏缩小内边距，避免 `cleaning bubble` 被拆成两行。

### 3.3 测试

- `tests/unit/rinse.test.ts`：新增空库初始化、旧示例清理、自定义项目保留、清洁过的示例与历史保留、无需迁移时对象不重写等 5 项测试。
- `tests/e2e/rinse.spec.ts`：
  - 新增首次进入 → 创建第一颗 → 切换/加号出现 → 刷新持久化 → 删除全部回到创建水泡的完整路径。
  - 新增旧示例与自定义项目混合时的自动清理断言。
  - 原有 8 个示例的 E2E 场景改为显式注入相对日期数据，避免依赖安装时间。
  - 360 × 740 窄屏与跨午夜测试保留。

## 4. 验证

### 4.1 自动化

| 检查      | 命令                   | 结果      |
| --------- | ---------------------- | --------- |
| Lint      | `npm run lint`         | passed    |
| 格式      | `npm run format:check` | passed    |
| 类型      | `npm run typecheck`    | passed    |
| 单元测试  | `npm test`             | 27 passed |
| 移动 E2E  | `npm run test:e2e`     | 16 passed |
| Web build | `npm run build`        | passed    |

### 4.2 Android 实机/模拟器

环境：Android 13 / API 33 x86_64 模拟器，1080 × 2400，`habitica_test_api33`。

- 卸载旧 debug 签名包，安装 v0.1.6 debug APK；`dumpsys` 确认 `versionCode=7`、`versionName=0.1.6`。
- 清除应用数据后启动：只有中央创建水泡；DOM 断言 `bubbles=1`、`tabs=0`、底部加号不存在、创建按钮存在。
- 点中央水泡，填写 `Kitchen counter`、间隔 7 天并保存：创建按钮消失，`tabs=2`，底部加号出现，新项目成为 `.bubble-position-0`。
- 点底部加号添加 `Bathroom`：水泡数 `2`，中心仍是 `Kitchen counter`，切换与加号保持。
- 切到 List：两行项目均可读；强制停止并重新启动应用，项目与顺序仍在。
- 通过 Capacitor Preferences 注入 v0.1.5 的 8 条旧示例后重载：首页自动回到中央创建水泡，原生 `rinse.items.v1` 被写回 `[]`，证明迁移在 Android 原生存储上生效。
- 截图：`docs/screenshots/native-android-first-run.png`、`native-android-home.png`、`native-android-list.png`。

### 4.3 Web

- 430 × 852 首次进入：中央创建水泡、主标题、提示均与设计稿一致；无切换、无加号、无示例。
- 创建第一颗后：主水泡切换为该项目，切换/加号出现；刷新后状态保持。
- 旧示例迁移：注入 8 条旧示例，加载后仅中央创建水泡，localStorage 中 items 变空；混合自定义项目时仅保留自定义项。
- 360 × 740：无横向滚动，创建水泡三行文案不溢出。
- 截图：`docs/screenshots/web-first-run.png`、`web-home.png`。

### 4.4 iOS

- 本地为 Windows，无法运行 Xcode Simulator。
- iOS 构建由 GitHub Actions macOS runner 完成；`ios/App` 版本已同步为 `0.1.6 (7)`，AppIcon / Splash 资源未变。
- 首次进入与迁移逻辑全部位于共享 Web 资源，iOS 与 Android/Web 使用同一实现；真机安装仍需在 Mac 上补充签名验证。

## 5. 版本

- 应用版本：`0.1.6`
- Android：`versionCode 7` / `versionName 0.1.6`
- iOS：`CURRENT_PROJECT_VERSION 7` / `MARKETING_VERSION 0.1.6`
- npm：`package.json` 与 `package-lock.json` 均为 `0.1.6`

## 6. 发布产物

- GitHub Release：[v0.1.6](https://github.com/Phanstal/Rinse/releases/tag/v0.1.6)
- Release workflow：[run 41970656551](https://github.com/Phanstal/Rinse/actions/runs/41970656551)，Android / iOS / Publish 三个 job 全部成功。
- CI：[run 41970458461](https://github.com/Phanstal/Rinse/actions/runs/41970458461)，Web、Android、iOS 三个 job 全部成功。
- 已从 Release 下载全部产物并逐项计算 SHA-256，与 `SHA256SUMS.txt` 完全一致。

| 文件                            | 大小（字节） | SHA-256                                                            |
| ------------------------------- | ------------ | ------------------------------------------------------------------ |
| `Rinse-0.1.6-android-debug.apk` | 6,783,991    | `676118f0ae8b8f8d632ebdbce79a645a01aff6c664837429754aec91af55a4e4` |
| `Rinse-0.1.6-ios-unsigned.ipa`  | 4,631,358    | `d92062b963ff31ed7aabed618cc304bed44e9b43e8eab8ea675ba5eab4d8752c` |
| `Rinse-0.1.6-ios-simulator.zip` | 5,164,791    | `14c7cdd2f9c9e633e47ac46a63e61707d5539f0716df96c76844b0674c0b153b` |

产物校验：

- APK：`aapt` 确认 `com.phanstal.rinse`、versionCode `7`、versionName `0.1.6`；`apksigner` 确认为 Android Debug 证书。
- IPA：解包 `Payload/App.app/App` 为 arm64，Info.plist 为 `0.1.6 (7)`、Bundle ID `com.phanstal.rinse`、MinimumOSVersion `13.0`；未签名，需重签。
- 模拟器 zip：`App.app` 的 Info.plist 同为 `0.1.6 (7)`，可执行文件同时包含 x86_64 与 arm64。

## 7. 已知限制

- 迁移只识别旧版内置的 8 个示例；用户自行改名或改间隔的示例会被视为自定义数据保留。
- 被清洁过的旧示例会保留，以避免删除历史；如果用户希望完全清空，可在设置中「删除全部数据」。
- 水泡视图只有 9 个有机位置；超过 9 个项目会复用位置，列表仍可完整查看。
- Android APK 仍是 debug 签名，不适合直接上架 Google Play；iOS 仍只提供未签名 IPA 与模拟器包。

## 8. 相关文档

- [README](README.md)
- [真机验收清单](docs/ACCEPTANCE.md)
- [发布说明](docs/RELEASE_NOTES.md)
- [v0.1.5 报告](https://github.com/Phanstal/Rinse/blob/v0.1.5/REPORT.md)
- [GitHub Release v0.1.6](https://github.com/Phanstal/Rinse/releases/tag/v0.1.6)
