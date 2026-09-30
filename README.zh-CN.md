[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg)](https://github.com/hacs/integration)

# Ultra Card

## 面向 Home Assistant 的可视化仪表盘构建器

**无需编写 YAML，即可搭建 Home Assistant 仪表盘。** Ultra Card 是一个模块化卡片构建器，内置拖拽式布局引擎、丰富的模块库以及完整的可视化编辑器。你只需在界面中设计，其余交给卡片处理。

https://github.com/user-attachments/assets/e9f28eee-e587-4bc0-ad0b-cea53a3fa5a6

**[ultracard.io](https://ultracard.io)** · **[模块](https://ultracard.io/modules/)** · **[模板模式](https://ultracard.io/template-mode/)** · **[预设画廊](https://ultracard.io/presets/)** · **[Discord](https://discord.gg/6xVgHxzzBV)**

---

## 为什么选择 Ultra Card？

**可视化编辑器** — 所有设置都在界面里完成，无需编写 YAML。

**Ultra Dashboard** — 一键从你的区域生成完整仪表盘（设置 → 仪表盘 → 添加仪表盘 → 社区仪表盘）。选一个风格，接管控制权，每张卡片都能在可视化编辑器中打开。[了解更多](docs/ultra-dashboard.md)。

**FreeSpace** — 自由布局的仪表盘视图（任意卡片均可拖拽、缩放、旋转、分层）。安装 Ultra Card Connect 后自动可用。[了解更多](docs/freespace.md)。

**96 个模块** — 涵盖布局、仪表、图表、控件、媒体等。支持嵌套的列式拖拽布局，让你自由搭建想要的界面。

**模板模式** — 用 Jinja2 模板让模块外观随实体状态变化。对所有用户免费。

**预设画廊** — 浏览社区布局，一键安装，也可以分享你自己的作品。

**Pro 云同步与备份** — 云同步、每日自动备份（保留 30 天）以及手动快照，让你的成果在多设备间安全留存。

---

## 在 ultracard.io 上体验

网站运行的是真实的卡片，而不是示例截图。想在安装前先探索一番，或者需要比本 README 更深入的参考时，都可以用它。

- **[模块](https://ultracard.io/modules/)** — 所有免费与 PRO 模块的实时预览（66 个免费，30 个 PRO）
- **[模板模式](https://ultracard.io/template-mode/)** — 交互式演练场、属性参考与字段说明
- **[预设画廊](https://ultracard.io/presets/)** — 可浏览并安装社区布局
- **[常见问题](https://ultracard.io/faqs/)** — 常见问题与故障排查

图文教程还收录在 [GitHub wiki](https://github.com/WJDDesigns/Ultra-Card/wiki) 中，也可以在 Home Assistant 内通过 Ultra Card Hub → 文档打开。

---

<img width="1862" height="1009" alt="uc-screener" src="https://github.com/user-attachments/assets/a99a768e-3db2-4366-8193-712c30d31ec1" />

## 快速开始

### 安装

**HACS（推荐）**

[![打开你的 Home Assistant 实例，在 Home Assistant 社区商店中打开一个仓库。](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=WJDDesigns&repository=Ultra-Card&category=plugin)

或者在 HACS 中把 `https://github.com/WJDDesigns/Ultra-Card` 添加为自定义 Lovelace 仓库，安装 Ultra Card 后重启 Home Assistant。

**手动安装**

1. 在[最新版本](https://github.com/WJDDesigns/Ultra-Card/releases)页面下载该版本的**全部**发布文件，而不只是 `ultra-card.js`。卡片被拆分为多个 JavaScript 文件（例如 `ultra-card.js`、`ultra-card-panel.js` 以及所有 `uc-*.js` 分片）。它们必须放在**同一个文件夹**内，浏览器才能正确加载。
2. 将整个文件夹中的内容复制到 `config/www`（例如 `config/www/ultra-card/`），保持各文件的相对位置与文件名不变。
3. 添加**一条** Lovelace 资源：_设置_ → _仪表盘_ → _资源_ → 添加资源 → URL 只指向**主**包，例如 `/local/ultra-card/ultra-card.js`（如果文件直接放在 `www` 下，则为 `/local/ultra-card.js`），类型选择 **JavaScript 模块**。

如果你使用 Ultra Card 仪表盘面板或 Hub 功能，请确保 `ultra-card-panel.js` 也在同一目录中（HACS 会自动安装全部文件）。

### Ultra Card Connect（使用 Hub 与 Pro 时推荐安装）

如果需要以下功能，请安装独立的 **[Ultra Card Connect](https://github.com/WJDDesigns/ultra-card-connect)** Home Assistant 集成（HACS → 集成）：

- **Ultra Card Hub** 侧边栏（预设、账户、文档）
- 跨设备保持登录的共享 Pro 账号（凭据保存在 HA 内）
- 收藏颜色同步、通过 Connect 使用 Smart Cards、通过集成上传媒体文件

即使不安装 Connect，也可以正常搭建仪表盘；但要通过 HA 完成 Hub 侧边栏认证与 Pro 解锁，则必须安装 Connect。

（该集成的 HA 域名仍为 `ultra_card_pro_cloud`，因此已有的实体 ID 不会改变。）

### 创建第一张卡片

1. 编辑仪表盘 → **添加卡片** → **自定义：Ultra Card**。
2. 使用**布局构建器（Layout Builder）**标签页添加并排列模块。
3. 使用每个模块上的**四标签页编辑器**（常规、动作、逻辑、设计）配置内容、点击行为、显示条件与样式。

**按用户可见** — 在逻辑标签页（模块、行、列）、卡片设置以及图标模块中的每个图标上，都可以针对指定的 Home Assistant 用户显示或隐藏内容，思路与 Lovelace 卡片的**可见性 → 用户**标签页相同，但这是 Ultra Card 内置的能力。如果你更习惯用 Lovelace 卡片级的用户条件来隐藏整张卡片，它也同样适用。

### 可选：Pro

访问 **[ultracard.io](https://ultracard.io)** 获取 PRO 模块、云同步与备份。安装 Ultra Card Connect 集成后，通过 Hub → 账户登录即可。

---

## 模块

Ultra Card 内置 **94 个模块**，覆盖内容、数据、控件、布局、媒体与 PRO 等领域，包括仪表盘、图表、温控与扫地机控制、家电卡片、UniFi 网络监控、Living Canvas 动态背景等等。

**[浏览全部模块并查看实时预览 →](https://ultracard.io/modules/)**

你还可以在 Ultra Card 的布局系统中嵌入原生 Home Assistant 卡片与第三方卡片（Bubble Card、Mushroom、ApexCharts 等），数量不限。该功能对所有用户免费。

---

## 模板模式

模板模式让一小段 Jinja2 模板决定模块的外观，并随实体状态实时变化：图标、颜色、标签、行的可见性等等。它随 Ultra Card 一同免费提供。

可在 **[ultracard.io/template-mode](https://ultracard.io/template-mode/)** 体验实时演练场与属性参考。同样的速查表在每个模块编辑器中都能一键打开。

---

## 免费版 vs Pro

| 功能 | 免费版 | Pro |
|------|--------|-----|
| 核心模块与可视化编辑器 | 支持 | 支持 |
| 预设画廊 | 支持 | 支持 |
| 条件逻辑与模板模式 | 支持 | 支持 |
| 原生 HA 卡片 | 不限 | 不限 |
| 第三方卡片 | 不限 | 不限 |
| 云端配置同步 | - | 支持 |
| 每日自动备份（30 天） | - | 支持 |
| 手动快照（最多 30 个） | - | 支持 |
| 28 个 PRO 模块 | - | 支持 |
| 优先支持 | - | 支持 |

**[前往 ultracard.io 获取 Pro](https://ultracard.io)**

---

## 预设画廊

可以在编辑器内浏览并安装社区预设（**预设**标签页 → **浏览市场**），也可以在网页端访问 **[ultracard.io/presets](https://ultracard.io/presets/)**。支持一键安装、分类筛选、预览与收藏，你也可以提交自己的布局供他人使用。

---

## 翻译

支持的语言：加泰罗尼亚语、捷克语、丹麦语、德语、英语、英式英语、西班牙语、法语、意大利语、荷兰语、挪威语、挪威博克莫尔语、挪威尼诺斯克语、波兰语、瑞典语、简体中文。

UI 语言跟随 Home Assistant 的语言设置（简体中文对应 `zh-Hans`）。如需贡献翻译，请参阅 [CONTRIBUTING_TRANSLATIONS.md](CONTRIBUTING_TRANSLATIONS.md)。你可以直接在 GitHub 上编辑 `src/translations/` 中的文件并提交 Pull Request。

---

## 社区与支持

- **[ultracard.io](https://ultracard.io)** — 官网、模块、模板模式、预设、Pro 与账户
- **[Discord](https://discord.gg/6xVgHxzzBV)** — 求助、分享、交流
- **[GitHub Issues](https://github.com/WJDDesigns/Ultra-Card/issues)** — 缺陷反馈与功能建议
- **[常见问题](https://ultracard.io/faqs/)** — 常见问题

Pro 订阅用户享有优先支持。你也可以通过[赞助开发](https://www.paypal.com/ncp/payment/NLHALFSPA7PUS)进行一次性打赏。

---

## 贡献

欢迎各种形式的贡献：翻译、预设、代码与文档。翻译相关请查看 [CONTRIBUTING_TRANSLATIONS.md](CONTRIBUTING_TRANSLATIONS.md)，本地开发请查看 [DEVELOPMENT.md](DEVELOPMENT.md)（其中包含 **`npm run release:check`**，即 CI 与打标签发布所使用的同一套流水线）。提交 Pull Request 时请写清楚说明。

---

## 技术细节

- **环境要求：** Home Assistant 2024.1.0 及以上，现代浏览器（ES2015+）。推荐使用 HACS。
- **技术栈：** TypeScript、智能缓存、响应式布局。
- **隐私：** 不做任何追踪；免费版完全本地运行；Pro 同步使用加密连接。代码在 GitHub 上开源。

---

## 许可证

MIT — 详见 [license](license) 文件。

---

**由 [WJD Designs](https://wjddesigns.com) 创建。** 感谢 Discord 社区，以及所有贡献预设、翻译与反馈的朋友。

_为 Home Assistant 而生_
