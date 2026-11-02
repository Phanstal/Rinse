# Rinse v0.1.4 改版报告

## 1. 结论

v0.1.4 按 [Figma Make 原型（Version 26）](https://www.figma.com/make/zpog9lRPWVomLBPYMTKvOp/Rinse-Cleaning-Cycle-Tracker) 重新同步了整套移动端界面。v0.1.3 虽然换了玻璃卡片，但仍保留旧版大标题、摘要、三视图切换，以及只在历史页里的备份入口，所以视觉上仍像上一版。这一版直接以 Make 源文件为准，替换为：

- 紧凑品牌头部：`rinse` 图标 + 字标，右侧设置与历史两个圆形按钮。
- 首页只保留 **Bubbles / List 双视图**，切换条落回卡片内部底部。
- 新增完整设置页：通知开关、隐私说明、备份与恢复、长按删除数据。
- 清洁历史页改为 Make 的 `ACTIVITY / Cleaning log` 结构，备份入口移到设置。
- 长按清洁时间由 650ms 改为 Make 的 **400ms**。

## 2. 原型依据与 Figma MCP

设计基准是 Make 链接中的 Version 26。本轮先修复了 Figma MCP 连接，再直接读取 Make 的源文件与资源，而不是依赖旧截图或本地猜测：

- 远程 MCP 端点：`https://mcp.figma.com/mcp`，OAuth 作用域 `mcp:connect`。
- Figma Make 文件不支持 `create_session` / 设计节点工具，因此通过 MCP **resources** 读取 `file://figma/make/source/...` 与图片资源。
- 已取得并逐行对照 `App.tsx`（785 行）与 `index.css`（527 行），确认头部、卡片、双视图、设置页、历史页、空状态与 400ms 按压常量。
- 因本机 DCR/OAuth 注册被 Figma 拒绝，MCP 以 `mcp-remote` 本地 stdio 代理接入，凭据只保存在受 ACL 限制的本地文件中，不写入仓库。

这一步也解释了 v0.1.3 的偏差：上一版依据的是预览代码的局部提取，保留了旧头部和三视图，实际并没有完整对齐 Version 26。

## 3. 与 v0.1.3 的主要差异

| 维度       | v0.1.3                             | v0.1.4                                            |
| ---------- | ---------------------------------- | ------------------------------------------------- |
| 头部       | 大标题 + 摘要 + 历史入口           | 紧凑品牌字标 + 设置 / 历史图标按钮                |
| 视图       | 水泡 / 网格 / 列表三视图           | 水泡 / 列表双视图，切换条位于卡片内底部           |
| 设置       | 无独立设置页                       | 通知、隐私、备份与恢复、删除全部数据              |
| 历史       | 历史页内放备份按钮                 | 历史页只保留记录与撤销，备份移到设置              |
| 备份入口   | 清洁历史右上角                     | 设置 → Backup & restore                           |
| 长按       | 650ms                              | 400ms                                             |
| 空状态     | 旧版首页摘要式空状态               | Make 的 `Start with one small thing.` 首项引导    |
| 旧 WebView | 网格依赖 `color-mix()`，文字不可读 | 水泡底色改为纯色变量 + 白色叠层，WebView 109 正常 |

## 4. 实现结构

- `src/features/home/HomeView.tsx`：品牌头部、设置 / 历史按钮、双视图分段切换、提示与新增按钮。
- `src/features/home/BubbleField.tsx`：保留有机水泡布局与统一按压逻辑。
- `src/features/home/useCleanPress.ts`：400ms 长按、点按阈值、回弹、触感与音效。
- `src/features/settings/SettingsPage.tsx`：通知开关、隐私展开、备份入口、两步长按删除。
- `src/features/history/HistoryPage.tsx`：Make 的 `ACTIVITY / Cleaning log` 头部、记录胶囊行、空状态与撤销。
- `src/app/App.tsx`：`home / history / settings` 视图状态、通知偏好持久化、原生返回层级、删除全部数据。
- `src/styles/base.css`：Make v26 样式主体；`src/styles/app.css` 只保留启动、存储错误、表单错误与备份面板等运行时补充样式。
- `public/rinse-icon.png`：Make 品牌图标，128×128。

数据层保持不变：8 条示例数据、本地持久化、历史撤销、备份恢复、跨午夜刷新、Android 分层返回。

## 5. 交互与原生适配

- 按住水泡 400ms 完成清洁；长按完成后不会再次触发点击。
- 轻点水泡打开详情；列表行只负责打开详情，避免滚动误触。
- 设置页的删除动作需要再次长按 1200ms，未完成时松手只取消，不会误删。
- Android 返回键顺序：编辑面板 → 备份面板 → 详情 → 历史 / 设置 → 退到后台。
- Android WebView 109 不支持 `color-mix()`，水泡改为 `var(--bubble-color)` 纯色 + 白色半透明叠层；在模拟器上确认中心水泡与外围水泡均有正常底色和可读文字。
- 所有 UI 文案为英文；README、验收清单与本报告为中文。

## 6. 验证

### 6.1 自动化

| 检查     | 命令                   | 结果      |
| -------- | ---------------------- | --------- |
| Lint     | `npm run lint`         | passed    |
| 格式     | `npm run format:check` | passed    |
| 类型     | `npm run typecheck`    | passed    |
| 单元测试 | `npm test`             | 22 passed |
| 移动 E2E | `npm run test:e2e`     | 15 passed |

E2E 覆盖：品牌头部与种子数据、双视图切换、设置页与通知开关、隐私展开、长按删除保护、详情打开/关闭、新增/编辑/删除、400ms 长按清洁、历史撤销、重载持久化、备份复制/下载/恢复、空状态、跨午夜刷新、360 × 740 无横向滚动。

### 6.2 Android

- 环境：Android 13 / API 33 x86_64 模拟器，1080 × 2400，WebView 109。
- 安装：卸载旧 debug 签名包后全新安装 `app-debug.apk`，`dumpsys` 确认 versionCode `5`、versionName `0.1.4`。
- 核对：首页、列表、设置、详情、编辑、备份、历史与删除确认均通过 WebView CDP 实际点击并截图。
- 兼容：`color-mix()` 移除后，中心 Kitchen counter 与外围 Bedsheets / Floors / Bathroom / Fridge 的水泡底色均正常，没有出现白字白底。

### 6.3 iOS

- release workflow 在 macOS 15 runner 上构建未签名 IPA 与模拟器 zip，并启动 iOS 模拟器截图。
- 本地无 macOS，真机安装仍需用户自己的 Apple 签名；具体步骤见 `docs/ACCEPTANCE.md`。

### 6.4 视觉证据

- Web 首页、列表、设置、详情、编辑、历史、备份：`docs/screenshots/web-*.png`
- Android 首页、列表、设置、详情、编辑、历史、备份、删除确认：`docs/screenshots/native-android-*.png`

## 7. 版本与产物

- 应用版本：0.1.4
- Android：versionCode 5 / versionName 0.1.4
- iOS：build 5 / version 0.1.4
- GitHub Release：`v0.1.4`
- 文件：
  - `Rinse-0.1.4-android-debug.apk`
  - `Rinse-0.1.4-ios-unsigned.ipa`
  - `Rinse-0.1.4-ios-simulator.zip`
  - `SHA256SUMS.txt`

校验方式：`sha256sum -c SHA256SUMS.txt`。发布产物的实际大小与 SHA-256 以 Release 与 `docs/ACCEPTANCE.md` 的发布记录为准。

## 8. 已知限制

- 无账号、云同步、通知；数据只在本机，跨设备迁移依赖 JSON 备份。
- Android APK 为 debug 签名，不适合直接上架 Google Play。
- iOS 只提供未签名 IPA 与模拟器包，真机安装需要自己的 Apple 签名。
- 水泡视图只有 9 个有机位置；项目超过 9 个时会复用位置，可能出现重叠，列表可完整查看全部项目。
- Android WebView 109 上原生面板禁用滑入动画，这是规避渲染残影的兼容取舍。

## 9. 相关文档

- [README](README.md)
- [真机验收清单](docs/ACCEPTANCE.md)
- [发布说明](docs/RELEASE_NOTES.md)
- [GitHub Release v0.1.4](https://github.com/Phanstal/Rinse/releases/tag/v0.1.4)

