# Rinse v0.1.3 改版报告

## 1. 结论

v0.1.3 已按 [Figma Make 原型（Version 26）](https://www.figma.com/make/zpog9lRPWVomLBPYMTKvOp/Rinse-Cleaning-Cycle-Tracker) 重做首页，上一版的水泡首页布局已被整体替换，不是局部换色。

本版交付：

- 玻璃卡片式首页：渐变背景、半透明圆角卡片、悬浮底部控件。
- 水泡、网格、列表三视图，共用紧急度排序与色彩层级。
- 兼容 Android WebView 109 的 CSS 回退，修复旧版 WebView 上网格空白/文字不可读的问题。
- Android 原生面板透底残影修复、iOS 安全区与短标签换行修复。
- Android APK、iOS 未签名 IPA、iOS 模拟器包与自动化验收记录。

## 2. 原型依据

设计基准为 Figma Make 链接中的当前版本（Version 26）。本版逐项核对了以下结构：

- 首页标题、摘要、历史入口的位置与字号。
- 卡片的圆角 32px、顶部起始位置、底部与安全区的关系。
- 水泡的有机错落布局：最急项目居中放大，其余按紧急度向外分布。
- 网格的两列圆角方块、前两个项目的深色底。
- 列表的胶囊行、周期文案、右侧剩余天数。
- 底部 Bubbles / Grid / List 分段切换、触控提示、渐变 `+` 按钮。

由于当前环境无法直连 Figma MCP，设计核对使用 Figma Make 公开预览的代码视图提取的 `App.tsx` 与 `index.css`，逐项对照尺寸、层级和交互状态。该来源与原型预览一致，未用上一版界面或自行发挥的布局替代。

## 3. 与上一版的主要差异

| 维度     | v0.1.2                              | v0.1.3                                           |
| -------- | ----------------------------------- | ------------------------------------------------ |
| 首页容器 | 普通白色卡片                        | 半透明玻璃卡片 + 渐变背景                        |
| 视图     | 水泡 / 列表两个入口                 | 水泡 / 网格 / 列表三个入口，分段切换             |
| 水泡布局 | 规则散布                            | 中心放大、四周有机错落，按紧急度排布             |
| 网格     | 无                                  | 两列圆角方块，前两个最急项目深色底               |
| 列表     | 行内容与底部切换分离                | 胶囊行、右侧剩余天数，列表区域截止在触控提示上方 |
| 底部操作 | 圆形按钮与视图切换分置              | 卡片内分段切换 + 卡片外渐变 `+`                  |
| 小屏     | 列表末行可能压住提示与切换          | 压缩水泡与行高，列表滚动区避开提示和切换         |
| 兼容性   | 依赖 `color-mix()`，旧 WebView 异常 | 白色叠加 + 主题色回退，WebView 109 正常渲染      |

## 4. 实现结构

- `src/features/home/HomeView.tsx`：首页头部、玻璃卡片、三视图切换、提示与新增按钮。
- `src/features/home/BubbleField.tsx`：有机水泡布局，复用统一的按压逻辑。
- `src/features/home/GridView.tsx`：两列网格、深色首行、长按/点按。
- `src/features/home/useCleanPress.ts`：650ms 长按清洁、190ms 点按打开、回弹/音效/触感。
- `src/styles/app.css`：Figma v26 首页样式、三视图布局、小屏与 WebView 回退。
- `src/domain/rinse.ts`：紧急度排序、剩余天数文案、水泡色阶与有机位置。

数据层保持不变：8 条示例数据、本地持久化、历史撤销、备份恢复、跨午夜刷新、Android 分层返回。

## 5. 交互与原生适配

- 长按 650ms 完成清洁；轻点打开详情。长按完成后不会再次触发点击。
- 水泡和网格共享同一套按压 hook，避免两套手势状态不一致。
- 列表只负责展示与打开详情，不承载长按，避免滚动时误触。
- Android 返回键顺序保持：编辑面板 → 备份面板 → 详情 → 历史 → 退到后台。
- iOS 卡片顶部使用 `max(150px, safe-area-inset-top + 122px)`，避免玻璃卡片压住副标题。
- 原生详情/备份面板在 Android WebView 109 上禁用滑入动画并使用不透明白底，消除背景残影。
- 所有 UI 文案为英文；README、验收清单与本报告为中文。

## 6. 验证

### 6.1 自动化

| 检查     | 命令                   | 结果      |
| -------- | ---------------------- | --------- |
| Lint     | `npm run lint`         | passed    |
| 格式     | `npm run format:check` | passed    |
| 类型     | `npm run typecheck`    | passed    |
| 单元测试 | `npm test`             | 22 passed |
| 移动 E2E | `npm run test:e2e`     | 14 passed |

E2E 覆盖：首页种子数据、三视图切换、详情打开/关闭、新增/编辑/删除、长按清洁、历史撤销、重载持久化、备份复制/下载/恢复、空状态、跨午夜刷新、360 × 740 无横向滚动。

### 6.2 Android

- 环境：Android 13 / API 33 x86_64 模拟器，1080 × 2400，WebView 109。
- 安装：卸载旧 debug 签名包后全新安装 `app-debug.apk`，启动生成 8 条示例数据。
- 核对：首页、网格、列表、详情、历史、备份面板均实际截图；列表最后一行位于提示与切换上方，不再透出。
- 兼容：网格不再依赖 `color-mix()`，旧 WebView 下首行颜色和文字正常。

### 6.3 iOS

- CI：[run 41327984411](https://github.com/Phanstal/Rinse/actions/runs/41327984411)，macOS 15 runner。
- 在 iPhone 16 Pro 模拟器完成构建、安装、启动与截图，首页布局、安全区、短标签单行均正常。
- 设备未签名 IPA 由 release workflow 构建；本地无 macOS，真机安装仍需用户签名。

### 6.4 视觉证据

- Web 首页、网格、列表、详情、编辑、历史、备份：`docs/screenshots/web-*.png`
- Android 首页、网格、列表、详情、历史、备份：`docs/screenshots/native-android-*.png`
- iOS 模拟器首页：`docs/screenshots/ios-simulator-home.png`

## 7. 版本与产物

- 应用版本：0.1.3
- Android：versionCode 4 / versionName 0.1.3
- iOS：build 4 / version 0.1.3
- GitHub Release：`v0.1.3`
- 文件：
  - `Rinse-0.1.3-android-debug.apk`
  - `Rinse-0.1.3-ios-unsigned.ipa`
  - `Rinse-0.1.3-ios-simulator.zip`
  - `SHA256SUMS.txt`

校验方式：`sha256sum -c SHA256SUMS.txt`。发布产物的实际大小与 SHA-256 以 Release 与 `docs/ACCEPTANCE.md` 的发布记录为准。

## 8. 已知限制

- 无账号、云同步、通知；数据只在本机，跨设备迁移依赖 JSON 备份。
- Android APK 为 debug 签名，不适合直接上架 Google Play。
- iOS 只提供未签名 IPA 与模拟器包，真机安装需要自己的 Apple 签名。
- 水泡视图只有 9 个有机位置；项目超过 9 个时会复用位置，可能出现重叠，列表与网格可完整查看全部项目。
- Android WebView 109 上原生面板禁用滑入动画，这是规避渲染残影的兼容取舍。

## 9. 相关文档

- [README](README.md)
- [真机验收清单](docs/ACCEPTANCE.md)
- [发布说明](docs/RELEASE_NOTES.md)
- [GitHub Release v0.1.3](https://github.com/Phanstal/Rinse/releases/tag/v0.1.3)
