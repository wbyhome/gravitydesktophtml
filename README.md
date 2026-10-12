# Gravity Desktop — 官方首页

单页静态官网，面向 **Gravity Desktop**（免费 Windows 桌面整理工具）。

核心叙事：**不是让桌面「看起来整齐」，而是让位置稳定、可被记住（空间记忆）。**
视觉隐喻：**引力**——文件被核心抓住，由细线连住，停稳之后不再漂走。

- 商店链接：https://apps.microsoft.com/store/detail/9P4Q9JK2DV8R
- 技术栈：纯静态 HTML + CSS + 原生 JS，**零依赖、无构建步骤**
- 默认语言：**英文**（利于 SEO，且与 HTML 源码一致所以不会闪）；可一键切换简体中文（切换后由 localStorage 记住）

---

## 1. 文件结构

```
gravity-desktop/
├── index.html              # 页面结构、全部中英文案、内联 SVG 图标与引力示意图、结构化数据
├── style.css               # 样式（设计变量 + 响应式）
├── main.js                 # 中英切换、主题切换、顶栏状态、示意图自适应、演示舞台缩放、滚动进场
├── robots.txt              # 爬虫规则（**域名是占位，上线前必改**）
├── sitemap.xml             # 站点地图（**域名是占位，上线前必改**）
├── README.md
└── assets/
    ├── demo/
    │   └── gravity-demo.html    # 交互演示（1280×768 固定画布，纯原生、零依赖）
    ├── img/
    │   ├── desktop-real.webp    # 真实 Windows 桌面截图 1920×1042（136KB）
    │   ├── desktop-real-960.webp# 上面那张的 960 宽变体（43KB，窄屏用）
    │   ├── desktop-demo-poster.webp # 操作录屏的封面帧 1600×900（96KB）
    │   ├── og-cover.jpg         # 社交分享封面 1200×630（纯代码绘制）
    │   └── promo-poster.jpg     # 早前推广视频的封面帧（页面当前未引用）
    └── video/
        ├── desktop-demo.mp4     # 操作录屏 1600×900 / 1分36秒 / 无音轨（约 3.0MB）
        └── promo.webm           # 早前推广视频 1280×720 / 12.22s（约 4.2MB）· 页面当前未引用
```

> `assets/img/` 里可能还留着早前版本的 `hero-cores.*` / `cores-overview.*` 截图。
> **当前页面不引用它们**（新版改为纯示意图），只保留 `og-cover.jpg` 供社交分享使用。
> 若确定不用，可以安全删除，不影响页面。

---

## 2. 本地预览

**方式一：直接打开** — 双击 `index.html`。
> `file://` 下部分浏览器会禁用 `localStorage`，语言切换不会记忆（切换本身正常）。建议用方式二。

**方式二：起本地静态服务（推荐）**

```bash
cd gravity-desktop
python -m http.server 8080     # 或：npx serve .
```

访问 <http://localhost:8080>。

---

## 3. 部署

### GitHub Pages
1. 把 `gravity-desktop/` 推到仓库（例如 `main` 分支的 `/docs` 目录，或 `gh-pages` 分支）
2. Settings → Pages → 选择分支与目录 → 保存
3. 等待一两分钟，访问给出的地址

### Vercel / Netlify
把 `gravity-desktop/` 作为项目根目录导入即可。无构建命令，Output 目录填 `.`（Vercel 选 "Other" 框架预设）。

### Cloudflare Workers（静态资源）

本项目零依赖、无构建，站点根就是项目根，用 **Workers Static Assets** 直接上传即可。

> ⚠️ **不要用 `npm create cloudflare@latest`。** 那套脚手架会生成 `src/index.ts`、
> `tsconfig.json`、构建链和一堆样板文件，还得把站点文件手动搬进去——对本项目是纯负担。
> 直接在现有目录里 `wrangler deploy` 就行。

```bash
npx wrangler login    # 首次：浏览器里点一下授权
npx wrangler deploy   # 部署，得到 https://gravity-desktop.<账号子域>.workers.dev
npx wrangler dev      # 本地预览（不需要登录）
```

- 配置在 `wrangler.jsonc`：`assets.directory = "."`、`not_found_handling = "none"`
  （不存在的路径正常返回 404，而不是回落到 index.html——避免 SEO 上被判成重复内容）
- `.assetsignore` 排除 `.git` / `README.md` / `wrangler.jsonc` 等非站点内容，只把真正的站点文件发上线
- 无自定义域名时用 `*.workers.dev` 子域名；绑自定义域名在 Cloudflare 面板里加即可
- **上线后记得把 `robots.txt` / `sitemap.xml` / `canonical` 里的占位域名换成真实地址**（见下）

### 部署前记得改
- **域名占位**：`https://gravitydesktop.app/` 是占位值，上线前必须换成真实域名。共 **8 处**：
  - `index.html` 4 处（`<link rel="canonical">`、`og:url`、`twitter:url`、`SoftwareApplication` JSON-LD 的 `url`）
  - `robots.txt` 2 处（注释 + `Sitemap:` 行）
  - `sitemap.xml` 2 处（`<loc>`）
- `og:image` / `twitter:image` 改成部署后的绝对地址（现在是 `assets/img/og-cover.jpg` 相对路径）
- `sitemap.xml` 的 `<lastmod>` 建议改成实际发布日期
- 上线后到 [Google Search Console](https://search.google.com/search-console) 与
  [Bing Webmaster Tools](https://www.bing.com/webmasters) 提交 `sitemap.xml`（这步只能人工做）

---

## 4. 页面结构（从上到下）

| 区块 | 类名 / 锚点 | 内容 |
|---|---|---|
| 顶栏 | `.top` | 品牌 + **主题切换**（浅色 / 深色 分段控件）+ **语言切换**（EN / 中文）+ 下载按钮。滚动时吸顶并加一条描边 |
| 1. 痛点 | `.hero` | **页面第一屏**。小标签、疑问式主标题（一行写完）、两段解说（第一段痛点、第二段引出方案）、主按钮、辅助说明 |
| 2 + 3. 窗口 | `.panel` / `.showcase` `#demo` + `.orbit` `#orbit` | 一个 **1280px 宽的居中面板**（`.wrap.wide` 定宽）：上半段是内嵌的交互演示（`assets/demo/gravity-demo.html`，1280×768），下半段是引力示意图 + 图例。**底色跟随主题**：浅色版是白面板，深色版是纯黑面板 |
| 4. 真实素材 | `.real` | 真实 Windows 桌面截图（`.shot`）+ 下方一段**操作录屏**（`.clip`，`desktop-demo.mp4`，1 分 36 秒，原生播放条）。都走 `.wrap.wide`，宽度和上面的窗口**完全一致** |
| 5. 解决方案 | `.section` | 「整齐，并不等于好找。」+ 两段正文（窄栏） |
| 6. 功能 | `.section` | 「它具体做了什么」+ 四行编号列表（`01`–`04`） |
| 7. 对比 | `.section` / `.cmp` | 「和传统桌面分区工具的区别」+ 一张三列 × 五行的对比表（`.cmp`），窄屏（≤620px）自动堆叠成卡片 |
| 8. 适合谁 | `.section` | 两段正文（含一句反向筛选） |
| 9. 支持语言 | `.section` | 六种界面语言 + 一行说明 |
| 10. 常见问题 | `.section` / `.faq` | 六条 FAQ，用**原生 `<details>/<summary>`**（内容始终在 DOM 里，可被爬虫抓到），与 `FAQPage` 结构化数据一一对应 |
| 11. 下载 | `.cta` | 居中大标题 + 商店按钮 |
| 页脚 | `.foot` | 品牌 + Microsoft Store 链接 + 一行小字（在 `<main>` 之外） |

页面顺序是「**先提问 → 再演示 → 再给真图 → 最后看真人怎么用**」——主标题用一句疑问把痛点抛出来
（`图标一直在动，不容易找？`），紧接着的交互演示用动画把原理演一遍，
窗口下半段的静态示意图给出抽象结构，窗口之后先给一张真实截图落到「长什么样」，
再给一段完整操作录屏落到「用起来是什么感觉」。

再往后是「**对比 → 适合谁 → 支持语言 → 常见问题 → 下载**」：第 7 节的对比表和第 10 节的 FAQ
是给**搜索意图**准备的（用户会直接搜「Gravity Desktop 和 Fences 有什么区别」「会不会动我的文件」），
所以放在功能说明之后、行动号召之前——先讲完产品是什么，再回答犹豫，最后才请人下载。

### 窗口（`.panel`，1280px 宽）

演示区（`.showcase`）和示意图区（`.orbit`）**合起来是一个 1280px 宽的居中面板**，
和下面的真实桌面截图**同宽、同左边缘**。要点：

- 结构上，两块 `<section>` 被一个 `<div class="panel">` 包住，外面再套 `.wrap.wide`。
  **底色 / 圆角 / 描边都只铺在 `.panel` 这一个元素上**，两块内容之间没有接缝。
- 描边用 `box-shadow: inset 0 0 0 1px var(--panel-line)` 而不是 `border`——
  `border` 会让盒子宽 2px，三块大素材就不再等宽了。
- 宽度 = `.wrap.wide` 的内容宽 = **1280px**（`padding-inline: 28px` 是面板内侧留白），
  所以外框和 `.shot-img`、`.clip-video` 严格等宽。**要改宽度只改 `.wrap.wide` 一处**，三块会一起动。
- 演示的舞台**没有底色、没有圆角、没有阴影**——它和所在的面板融为一体，
  看起来就是几个文件浮在底色上。演示文件里的 `.screen` 底色也跟着主题走。
- ⚠️ **顶栏没有「落在深色上转深」**：面板不是通栏，反白样式会让顶栏两侧的页面底色上
  出现浅色文字、读不出来。`.top.on-dark` 那套规则和 `main.js` 里对 `.dark-band` 的遍历
  已一并删除，顶栏的颜色由主题决定。

#### ⚠️ 三块大素材必须同宽（同一个容器）

窗口（`.panel`）、真实截图、操作录屏**三块都走 `.wrap.wide`**，共用同一条宽度规则。
实测 5 档视口严格对齐（浅色 / 深色两套主题下都量过，数字一致）：

| 视口 | 窗口 | 截图 | 录屏 |
|---|---|---|---|
| 1872 | 296..1576 (1280) | 296..1576 (1280) | 296..1576 (1280) |
| 1392 | 56..1336 (1280) | 56..1336 (1280) | 56..1336 (1280) |
| 1232 | 28..1204 (1176) | 28..1204 (1176) | 28..1204 (1176) |
| 720 | 28..692 (664) | 28..692 (664) | 28..692 (664) |
| 476 | 20..456 (436) | 20..456 (436) | 20..456 (436) |

> 高度天然不同：截图 1280×**696**（1920×1042，约 1.84:1）、录屏 1280×**720**（16:9）。
> 差 24px 是素材画幅本身决定的，**宽度才是要对齐的那个量**。

**踩过的两个坑**：
1. 舞台一度写成 `width: 100%` 直接铺满整条深色带，而截图被 `.wrap.wide` 各收 28px——
   视口窄于 `1336px` 时两者差 56px。而且因为舞台是**透明的**，把它改窄了肉眼根本看不出来：
   你看到的「黑窗口」其实是 section 的通栏背景，所以只改舞台等于没改。
2. 深色区一度是**通栏满屏**的，于是「黑窗口」比截图宽 136px（1416 视口下左右各 68px），
   看起来就是「两个窗口大小不一样」。改成 1280 居中后两者才真正重合。

> 给 `.panel` 加描边时也要小心：`border` 会撑大盒子，得用 `box-shadow: inset` 或
> `outline`。**每次动这三块的尺寸，都用探针量一遍再收工。**

> ⚠️ **`#orbit` 的静态 SVG 示意图和上面的交互演示讲的是同一件事**（核心 + 文件 + 细线）。
> 目前两者都在，属于有意保留（静态图适合快速扫读、也承担 SEO 的文字说明）。
> 若嫌重复，删掉 `#orbit` 整段 + `style.css` 第 8 节 + `main.js` 的 `fitOrbit()` 即可。

### 真实桌面截图 + 操作录屏（`.real`）

窗口**下面**是一节「真实素材」：先一张真实 Windows 桌面截图，紧接一段操作录屏。
两者都走 `.wrap.wide`，**和上面的窗口严格同宽**，读起来是同一组素材里的三块。

#### 截图（`.shot`）

- **源图**：`C:\Users\GravityTest\Pictures\Screenshots\屏幕截图 2026-10-05 114703.png`（2559×1389，3.45MB）
- **处理**：LANCZOS 缩到 1920 宽 → WebP q82 = **136KB**；另出一张 960 宽变体（43KB）
- **`srcset` + `sizes`**：窄屏取 960，宽屏取 1920，避免手机上下载一张 1920 的图
- `loading="lazy"` + `decoding="async"`，且带 `width/height`（防加载前高度塌陷）
- 圆角 `12px` + `1px` 描边 + 一层很淡的投影，让它读起来是「一张截图」而不是贴图

#### 操作录屏（`.clip`）

- **源片**：`F:\FFOutput\屏幕录像\格式工厂 屏幕录像20261005_114212.mp4`
  —— 2560×1440 / 24fps / **95.6 秒** / H.264 + AAC / **23.7MB**
- **处理**（用格式工厂自带的 ffmpeg，见下方「本机可用的 ffmpeg」）：
  ```bash
  ffmpeg -i 源.mp4 -vf "scale=1600:900:flags=lanczos" \
         -c:v libx264 -preset slow -crf 26 -profile:v high -level 4.0 \
         -pix_fmt yuv420p -an -movflags +faststart \
         assets/video/desktop-demo.mp4
  ```
  **23.7MB → 3.0MB**（约 1/8）。要点：
  - 缩到 **1600×900**：显示宽度是 1280，留 1.25× 余量给高分屏；再大性价比就低了
  - `-crf 26` + `-preset slow`：屏幕录制内容（大面积静态）压缩率很高，画质够用
  - `-an`：**丢掉音轨**——原音轨只有 4 kb/s（实测是静音），留着白占体积
  - `-movflags +faststart`：把 moov 挪到文件头，边下边播
- **封面**：`-ss 75` 抽一帧（此时桌面布局已稳定、核心和文件都在）→ 1600×900 WebP q80 = **96KB**
- **嵌入方式**：原生 `<video controls preload="metadata" playsinline poster="…">`
  - `preload="metadata"` 而不是 `none`：只拉几百 KB 就能拿到时长，进度条直接显示 `1:35`
  - **不自动播放**——1 分 36 秒的操作录屏适合用户主动点开，不适合当背景动画
  - `<video>` 里留了下载兜底链接（`<source>` 都不支持时显示）
  - 竖屏手机上加 `playsinline`，避免被系统强制全屏
- **样式**：`.clip-video` 复用 `.shot-img` 的圆角 / 描边 / 投影，并加 `background:#000`
  （封面还没解码出来时是黑的，不闪白）；`width:100%; aspect-ratio:16/9` 由 `width/height` 属性兜底
- ⚠️ 视频是 **16:9（1280×720）**，截图是 1920×1042（约 1.84:1，1280×696）——
  **两者宽度严格相等，高度差 24px**。这是素材本身的画幅差异，不是 bug。

> **本机可用的 ffmpeg**：系统没装 ffmpeg，但格式工厂自带了一个（7.1，带 libx264 / libvpx / libwebp）：
> `"D:\Program Files (x86)\FormatFactory\ffmpeg.exe"`
> 另外用 Python 解析 MP4 盒子（`moov/mvhd` 拿时长、`stsd/avc1` 拿分辨率）可以在不装 ffmpeg 的情况下读元数据。

---

## 4.1 主题（浅色 / 深色）

全站两套配色，顶栏右侧一个小分段控件切换，默认**浅色**。

| | 浅色（默认） | 深色 |
|---|---|---|
| 页面底色 | `#ffffff` | `#0b0d12` |
| 窗口（`.panel`） | 白面板 + 1px 浅灰内描边 | 纯黑 `#000000` + 1px 白色 8% 内描边 |
| 窗口内文字 | 近黑 | 白 / 半透明白 |
| 演示动画（iframe 内） | 白底、深色文字 | 黑底、白色文字 |
| 按钮 | 深底白字 | 白底深字 |

**实现方式：全部走 CSS 变量。** `style.css` 第 1 节是浅色令牌，第 1.1 节是深色覆盖，
两边令牌一一对应——**改主题只改这两块，不用碰任何具体规则**。
开关是 `<html data-theme="light|dark">` 这一个属性。

### 三个必须记住的点

1. **主题初值必须在首次绘制前设好**，否则刷新时会先闪一下浅色再变深。
   `index.html` 的 `<head>` 里有一段内联脚本，优先级 **URL `?theme=` > `localStorage` > 默认 `light`**。
   `main.js` 只负责点击切换和记住选择，不再决定初值。
2. **`color-scheme` 要跟着主题走**（见 `style.css` 的 `html` 与 `html[data-theme="dark"]`）。
   否则深色模式下滚动条和 `<video>` 的原生控制条还是浅色的，很割裂。
3. **演示 iframe 要单独通知**。跨文档 CSS 不会继承，所以 `main.js` 通过
   `postMessage({ type: 'gd-theme' })` 告诉演示文件换皮肤（见第 6 节）。
   切换时**只发消息、不改 `src`**，所以不会有 iframe 重载的闪动。

### 直接打开某一版

- 浅色：`index.html`
- 深色：`index.html?theme=dark`

`?theme=` 只影响本次访问、不写 `localStorage`；用顶栏控件点的才会被记住。

---

## 5. 设计说明

**极简原则**：一条灰线、一个强调色，不堆卡片、不堆阴影、不用渐变装饰。
留白靠 `section` 的 `clamp(72px, 9vw, 124px)` 撑起来，而不是靠边框分割。

**设计变量**（`style.css` 第 1 节 = 浅色，第 1.1 节 = 深色；下表「值」列是浅色的）

| 变量 | 值 | 用途 |
|---|---|---|
| `--bg` | `#ffffff` | 页面底色（深色版 `#0b0d12`） |
| `--ink` | `#0a0b10` | 标题（深色版 `#f1f2f6`） |
| `--body` | `#5c6272` | 正文（深色版 `#a7adba`） |
| `--muted` | `#9ba1af` | 辅助文字、编号（深色版 `#868d9c`） |
| `--line` | `#ebecf0` | 唯一的分割线颜色（深色版 `#1d2129`） |
| `--accent` | `#e8483c` | 核心红。**只出现在**：品牌标记、`#orbit` 的小标签、示意图与演示里的核心、选中高亮 |
| `--panel` | `#ffffff` | **窗口**底色（深色版纯黑 `#000000`），配 `--panel-line` 做内描边 |
| `--panel-ink` / `--panel-body` / `--panel-muted` | 同 `--ink` / `--body` / `--muted` | 窗口内的三级文字 |
| `--panel-link` | `rgba(232,72,60,.42)` | 示意图里的细连线（深色版 `rgba(255,148,138,.6)`） |
| `--panel-doc` / `--panel-doc-line` | `#eef0f5` / `#a8b0be` | 示意图里「白纸文档」图标（白底上要压深才看得见） |
| `--btn-bg` / `--btn-fg` | `#0a0b10` / `#ffffff` | 按钮（深色版反过来：白底深字） |

> 加新颜色时**两套主题都要加**，别只写一个。所有颜色都应该在这里出现，
> 具体规则里不要再出现裸色值——这是「改主题不用碰规则」的前提。

**排版**：三档容器宽度

| 容器 | max-width | 用途 |
|---|---|---|
| `.wrap` | `1080px` | 默认内容栏（痛点、演示说明、页脚） |
| `.wrap.narrow` | `680px + 56px` | 正文段落（解决方案、功能、适合谁、支持语言、下载） |
| `.wrap.wide` | `1280px + 56px` | **大窗口**：深色窗口（演示 + 示意图）、真实截图、操作录屏共用这一档，三块因此严格同宽 |

**中文排版修正**（`style.css` 的 2.1 节）：英文那套「负字距 + 1.06 行高」是按拉丁字形调的，
直接套到中文上会出问题——中文方块字本身没有字形侧边留白，负字距会让笔画贴在一起，
行高过低会让上下两行几乎顶住；`.16em` 的字间距也只适合全大写拉丁词，套到中文上会散架。
所以切到中文时（`html[lang="zh-CN"]`，由 `main.js` 写入）统一修正：

| 修正项 | 英文 | 中文 |
|---|---|---|
| 标题字距 | `-.028em` ~ `-.036em` | `-.012em` |
| 标题行高 | `1.06` ~ `1.16` | `1.2` |
| 小标签 / 小标题字距 | `.16em` | `.1em` |
| 正文字行高 | `1.76` ~ `1.78` | `1.86` |

**标题断行**：`.hero-title` **不写 `<br>`、也不设 `max-width`**，让它自然一行写完
（中文 12 字 × 60px ≈ 720px，英文 ≈ 920px，都在 1024px 的内容宽度内）。
曾经用过 `max-width: 15ch` 想把标题控制在两行内，结果中文被挤成
「图标一直在动，你 / 就一直在找。」——`ch` 是「0」的宽度，中文只占半个字宽，这个限制对中文不成立。
字号下限设为 `30px`，保证 320px 窄屏（内容宽 280px）时最长的一行也不溢出。

**断点**：`940px`（编号列表收窄、语言网格转 2 列）、`700px`（示意图只留中心两环，见下；同时演示进入紧凑态、收起自己的控制条）、`620px`（品牌名隐藏、按钮全宽、编号列表转上下堆叠、顶栏三组控件收紧）、`400px`（语言与主题分段控件进一步收窄）。

---

## 6. 交互演示（1280×768 舞台）

页面**第一屏痛点文案的下面**是一个 1280×768 的交互演示，源文件 `assets/demo/gravity-demo.html`，
放在深色窗口的上半段（和下半段的 `#orbit` 连成一块，见第 4 节「深色窗口」）。
内容是 30 个「打底文件」在左半边每 2 秒随机重排，5 个目标文件（两个文件夹 / Word / Excel / 文档）
飞入右侧红色核心并连上细线——正是「图标一直在动 → 被引力抓住」这件事的动画版。

### 它怎么嵌进来的

演示本身是**绝对像素坐标写死**的（核心固定在 `(920, 384)`，网格步长 90px），不能改成响应式，
否则坐标全废。所以做法是：

```html
<div class="stage" id="stage">          <!-- aspect-ratio: 1280/768 + overflow: hidden -->
  <iframe class="stage-frame" id="stageFrame"
          src="assets/demo/gravity-demo.html?lang=en&amp;autoplay=1&amp;theme=light"></iframe>
</div>
```

```css
.stage       { width: 100%; max-width: 1280px; margin-inline: auto; aspect-ratio: 1280 / 768; }
.stage-frame { width: 1280px; height: 768px; transform-origin: 0 0; }
```

```js
stageFrame.style.transform = 'scale(' + (stage.clientWidth / 1280) + ')';
```

关键点：**`transform: scale()` 不改变 iframe 的布局视口**，iframe 内部永远是 1280×768，
所以绝对坐标、`setInterval`、按钮交互全部原样保留，只有外面套了一层缩放。
缩放由 `main.js` 用 `ResizeObserver` 监听 `.stage` 宽度实时算（回退到 `window.resize`）。

> **`max-width: 1280px` 是有意的**：`transform: scale()` 把 iframe **放大**会让内容发虚
> （浏览器按原尺寸栅格化再拉伸），所以只允许缩小、不允许放大。视口 ≥1280px 时舞台锁在 1:1。

实测：视口 1440 → 舞台 1280×768 → `scale(1)`；窄屏 390 → 335×201 → `scale(0.26)`。

### 为什么用 iframe 而不是内联

演示的 CSS 里有 `* { user-select: none }`、`body { display:flex; overflow:hidden }` 这种全局选择器，
还有 `.btn` 这种会和官网撞名的类。内联进来必须把每一处都加前缀改写，既容易漏、也让演示文件以后没法独立更新。
用 iframe 则**完全隔离**，演示文件可以原样独立打开、独立修改。

### 演示 ↔ 官网 的四条通信（`postMessage`）

演示文件底部有一段「嵌入桥」，只做这几件事，单独打开时行为与原始 demo 完全一致
（中文、深色、手动点击）：

| 消息 / 参数 | 作用 |
|---|---|
| `?lang=` 或 `postMessage({type:'gd-lang'})` | 切换演示内部文案：两个按钮 + `文件核心 6` + `<title>`。官网切语言时同步下发 |
| `?theme=` 或 `postMessage({type:'gd-theme'})` | 换皮肤：`light` 时给 `<html>` 挂 `data-theme="light"`，演示变成白底深字；`dark`（默认）就是原始外观。见第 4.1 节 |
| `?compact=1` 或 `postMessage({type:'gd-compact'})` | 窄屏（`≤700px`）下给 `<body>` 加 `.compact`，**收起演示自己的控制条**——26% 缩放下按钮已经点不中了，留着只是噪音 |
| `?autoplay=1` | 加载后 1.2 秒自动播放「飞入连接」。官网默认开启，但在 `prefers-reduced-motion: reduce` 下会传 `0` |

> 语言 / 主题同步有个小坑：`postMessage` 是异步的，iframe 刚加载时监听器可能还没就位。
> 所以 `main.js` 里除了 `load` 事件后补发一次，还在设置 `src` 时就把 `lang` 和 `theme`
> 写进查询参数——只有当前值不等于 HTML 里的默认值时才重新赋值 `src`，命中默认值则一次都不重载。
>
> ⚠️ **切主题时只发 `postMessage`，绝不改 `src`**，否则 iframe 会重载、演示动画会从头开始。

### 窄屏

演示按宽度等比缩放到容器宽度，**不裁剪、不横滚**。390px 手机上只有 335×201，
里面的字确实小到看不清——但演示的动作（左边乱 → 右边聚）在这个尺寸下仍然读得出来，
控制条也已收起，所以它退化成一个**自动播放的动图**。这是 1280 固定画布的必然结果，
如果要手机上也有交互，需要另做一个竖版演示。

### 底色与官网一致（改过的地方）

演示原本是**蓝色渐变**的 `.screen`，和官网的深色窗口放在一起就是「上下两个窗口颜色不一样」。
现在演示文件里这几处改成了和 `#orbit` 一致：

| 位置 | 原值 | 现值 |
|---|---|---|
| `body` | `#111` | `#000`（浅色皮肤下 `#fff`） |
| `.screen` | `linear-gradient(#1a5f9a, #0b345d)` + 外阴影 | `#000`（无阴影；浅色皮肤下 `#fff`） |
| `.core-center` 外环 | `0 0 0 8px rgba(138,43,38,.4)` | `0 0 0 8px rgba(232,72,60,.38)`（对齐 `#orbit` 的 `.core-ring`） |

`.copper-line` 的 `#9e5950` **深色下不用改**——它和 `#orbit` 连线用的 `rgba(255,148,138,.6)`
叠在黑底上算出来的实际颜色几乎一样（都是 `rgb(15x, 89, 8x)`）。浅色皮肤下改成
`rgba(232,72,60,.5)`，白底上才看得见。

**浅色皮肤**（`html[data-theme="light"]`）只覆盖颜色、不动任何布局与动画参数，
见演示文件 `<style>` 末尾那段注释。两个要点：

1. 白底上必须把 `rgba(255,255,255,…)` 那套描边整体换成 `rgba(10,11,16,…)`，
   否则打底文件完全隐形。
2. ⚠️ **打底文件（`.generic-file`）的对比度要单独调足**。第一版只给了
   `rgba(10,11,16,.13)` 的描边 + `.03` 的填充，在白底上糊成一片、根本看不清
   （用户截图反馈过）。现在的值：

   | 属性 | 值 | 说明 |
   |---|---|---|
   | `background` | `#f4f5f8` | 明确的浅灰底，不再靠透明度叠白 |
   | `border-color` | `rgba(10,11,16,.22)` | ≈ `#c9cacd`，看得见的一条边 |
   | `box-shadow` | `0 1px 2px rgba(10,11,16,.07)` | 极淡投影，让它「立」起来 |
   | `::before/::after` | `rgba(10,11,16,.30)` | 内部两条横线 |

   调完之后仍然比 5 个彩色目标文件弱，主次关系没丢。
   同理，`#orbit` 示意图里的「白纸文档」图标也把 `--panel-doc` 压到 `#eaedf3`、
   `--panel-doc-line` 压到 `#9aa2b1`，两处观感才对得上。

### 要改演示

直接编辑 `assets/demo/gravity-demo.html`，官网不用动（`postMessage` 那几个钩子保留即可）。

- 核心位置：`.core-center` 的 `left: 920px; top: 384px`，同时改 JS 里 `flyToCore()` 的 `coreCX/coreCY`
- 五个目标文件的位置/类型：`targetFilesData` 数组
- 打底文件数量：`for (let i = 0; i < 30; i++)`
- 配色：`.screen` 的底色、`.flat-icon` 的品牌色、`.copper-line` 的 `stroke`——
  **改了深色值记得同步浅色皮肤那一段**

---

## 6.1 备选：推广视频（**未采用**）

> 📌 **注意区分**：这里说的「未采用」指的是**首屏那段 12 秒自动播放的循环宣传片**。
> 页面**确实用了一段视频**——第 4 节的**操作录屏**（`.clip`），但它的定位完全不同：
> 放在页面下半段、用户主动点播、不自动播放、不循环。见第 4 节「操作录屏」。

在演示之前，页面最上面放过一段 12 秒的循环录屏（`assets/video/promo.webm` + 封面 `assets/img/promo-poster.jpg`，
两个文件仍在磁盘上，页面不引用）。后来用户改用上面这个交互演示，视频方案作废。
下面几条是当时踩过的坑，若以后还要用视频，直接照抄。

### 首屏不取流

`<video>` 用 `preload="none"`，而且**不写 `src`**——真实地址放在 `data-src` 上。
`main.js` 用 `IntersectionObserver`（`rootMargin: 300px`）在它快进入视口时才
`setAttribute('src')` → `load()` → `play()`。所以首屏只会请求那张一百来 KB 的封面图，
4.2MB 的视频不参与首屏加载。

### 踩坑：录屏产出的 WebM 没有时长

这段视频是浏览器 `MediaRecorder` 录出来的，**文件里没有 duration 元数据**，`video.duration` 读出来是 `Infinity`。
后果有两个：`loop` 属性不生效（播完停在最后一帧），`ended` 事件也不触发。

网上常见的修法是 `video.currentTime = 1e101` 把 duration「骗」出来，但**实测会把播放彻底卡死**
（`currentTime` 变成 `Infinity`、`paused` 永远是 `true`，视频再也不播）。所以改用最直白的办法：

```html
<video ... data-end="12.2">
```

```js
promo.addEventListener('timeupdate', function () {
  if (promoEnd && promo.currentTime >= promoEnd) { promo.currentTime = 0; playPromo(); }
});
```

用已知的真实时长判断结尾，到了就 `currentTime = 0` 继续播（视频本身没被暂停，所以是连续的）。
**换视频时记得同步改 `data-end`。**

> 容器用 `aspect-ratio: 16 / 9` 占位，避免视频加载前高度塌陷。
> headless 下验证视频要加 `--autoplay-policy=no-user-gesture-required --mute-audio`，
> 且 virtual time 会加速 media clock，`currentTime` 的绝对值不可信，只能看「是否增长 / 是否被重置」。


---

## 7. 引力示意图（`#orbit`）

**一个核心 + 五个文件 + 五条细线**，照真实产品截图的比例和视觉语言画的，不堆装饰。

整张图是**一个 SVG**（`viewBox="334 183 540 320"`），全部围绕中心点 `(600, 380)`：

| 层 | 类名 | 说明 |
|---|---|---|
| 连线 | `.links line` | 从核心中心连到每个文件中心。画在**图标下层**，所以两端被核心圆和文件图标自然盖住，看起来是「从核心边缘连到文件边缘」 |
| 五个文件 | `.files` | 上（文件夹）、右上（Excel）、右下（文档）、左下（文件夹）、左上（Word）。**完全静止** |
| 核心 | `.core` | 红色实心圆 `r=20` + 同色外环 `r=27` + 圆内白色窗口符号 + **右上角深色计数胶囊 `6/15`** + **下方名称标签** |

**和真实产品一致的地方**：核心是「小圆 + 外环 + 右上角计数徽章 + 下方名称」这个组合；
文件用真实桌面图标的简化画法（金色文件夹是两层矩形、Office 用品牌色圆角方块 + 白字母、文档是白纸 + 灰线）；
连线的颜色跟随核心色，且刻意压得很淡。

**刻意的克制**：没有轨道环、没有光晕渐变、没有多余文件。面板底色**不加任何径向渐变**
（浅色版纯白 `--panel: #ffffff`，深色版纯黑 `#000000`）。
（上一版有 15 个文件 + 3 条同心轨道 + 光晕 + 散落文件虚线，被判定为「太多了、太夸张」，已全部删掉。）

### 要改示意图

- **文件位置**：改 `.files` 里每个 `<g transform="translate(x,y)">` 的 `x/y`（= 图标左上角），
  同时把 `.links` 里对应 `<line>` 的 `x2/y2` 改成新的**文件中心**（`translate` 值 + 图标宽高的一半）。
- **核心**：圆心固定在 `(600,380)`。`.core-ring` / `.core-dot` 的 `r`、`.core-mark` 的 `x/y/width/height`、
  `.core-badge` 里 `<rect>` 与 `<text>` 的位置、`.core-name` 的 `y` 都写死在 `index.html` 里。
- **颜色/线宽**：全部在 `style.css` 的「7. 示意图」段落里，用类名控制，不用改 SVG 内联属性。
- **图标配色**：文件夹 `#f5c24a` / `#e0a82e`，Excel `#1e7145`，Word `#2b579a`，文档 `#f4f5f7`。

### 窄屏

`main.js` 的 `fitOrbit()` 在 `≤700px` 时把 `viewBox` 收窄为 `"438 186 344 314"`——
内容本来就集中在中间，收窄后核心和五个文件会放大到几乎占满宽度，不会缩成一团。

> **断点必须和 JS 保持一致**：`main.js` 的 `fitOrbit()` 用的是 `window.innerWidth <= 700`，
> 改阈值时记得同步 `style.css` 里相关的 `@media` 断点。

---

## 8. 中英双语机制

- **英文写在 HTML 里作默认内容**（利于 SEO 与首屏），中文挂在同一个元素的 `data-zh` 上。
- `main.js` 启动时把所有 `[data-zh]` 元素缓存下来，切换时整体替换 `innerHTML`。
- 同时切换 `<title>`、`meta description`、`og:title/description`、`twitter:title/description`、`<html lang>`（`META` 对象）。
- 语言来源优先级：`localStorage['gravity-lang']` → **英文**。
  ⚠️ **不再自动识别浏览器语言**（原先的 `navigator.language` 检测已移除）。
  这样做的好处：HTML 源码本身就是英文，默认英文可以做到**零闪烁**；
  而中文访客手动点一下「中文」即可，切换后会被 `localStorage` 记住。
- 顶栏的 `EN / 中文` 是两个 `<button>`，靠 `aria-pressed` 表示当前选中状态。

### 要加第三种语言
1. 每个元素再加一个 `data-xx` 属性
2. `main.js` 里 `textNodes` 的收集与 `applyLang()` 的替换逻辑改成按属性名取
3. `META` 加一份
4. 顶栏 `.lang-seg` 加一个按钮

---

## 9. 支持语言（数据来源）

页面「支持你的语言」区块列的 **6 种界面语言**来自微软商店的商品信息，不是猜的：

```bash
curl -s "https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds=9P4Q9JK2DV8R&market=US&languages=en-us" \
  -H "User-Agent: Mozilla/5.0"
```

返回里读 **`DisplaySkuAvailabilities[0].Sku.MarketProperties[0].SupportedLanguages`**
（注意：顶层 `Properties` 里**没有**这个字段，必须下钻到 SKU 的 `MarketProperties`）。

实测结果：`["en-us", "de-de", "fr", "ja", "zh", "es-tg"]` → **英 / 德 / 法 / 日 / 中 / 西**。
`index.html` 的 JSON-LD `inLanguage` 也同步为 `["en","zh","ja","de","fr","es"]`。

> ⚠️ 别混淆两个概念：**App 界面语言 6 种**（商店数据）≠ **本官网语言 2 种**（英 / 简中）。
> 页面里已明确区分，文案不要写混。

---

## 10. 文案红线

- 不说「自动整理」「一键归类」——产品不做自动整理，强调的是**位置稳定**与**空间记忆**。
- 不说「清理桌面」「释放空间」——它不删文件、不搬文件。
- 任何地方都不能暗示会移动真实文件；功能第 03 条就是专门讲这个的。
- 「适合谁」里那句反向筛选（如果你只想要自动塞格子，传统工具更合适）**要留着**，它让文案可信。

---

## 11. 无障碍与性能

- 顶栏、按钮均有可聚焦状态（`:focus-visible` 红色描边）
- 主题切换与语言切换都是 `role="group"` + `aria-pressed` 的分段控件（不是单按钮 toggle），
  两个图标按钮另有 `aria-label="Light theme"` / `"Dark theme"`；
  `<meta name="theme-color">` 随主题更新，`color-scheme` 跟着走（原生滚动条 / 播放条配色正确）
- 示意图是 `role="img"` + `<title>/<desc>`，中英双语可切换
- 演示的 iframe 带 `title` 属性（读屏会播报「Gravity Desktop interactive demo」）
- 全部动效（呼吸、虚线流动、浮动、滚动进场）在 `prefers-reduced-motion: reduce` 下自动降级；
  演示的自动播放同样受这条控制（此时 `main.js` 给 iframe 传 `autoplay=0`，改成手动点按钮）
- 无任何第三方 JS / CSS / 字体依赖，首屏不请求任何外部资源（演示是同源文件，不算外部请求）
- 真实桌面截图 `loading="lazy"` + `decoding="async"`，且带 `width/height`，
  既不进首屏请求也不造成布局抖动；窄屏经 `srcset` 只取 960 宽变体（43KB）
- 操作录屏 `preload="metadata"`（**不是 `none`**）——只拉几百 KB 就能拿到时长，进度条显示 `1:35`；
  3.0MB 的正文在用户点播放前不会下载，**不进首屏**。`playsinline` 避免手机上被强制全屏。
  视频元素带 `aria-label`，`<source>` 不支持时有下载兜底链接
- 全站唯一的外部请求是商店链接的点击跳转

---

## 11.1 SEO

站内可做的部分已经补齐。**站外部分（提交 Search Console、社区发帖、争取外链）只能人工执行。**

### 已达标项

| 项 | 状态 |
|---|---|
| 真实 HTML 文案（不靠 JS 渲染正文） | ✅ 全部内容写死在 `index.html` |
| 标题层级 | ✅ 1 个 `<h1>` → 8 个 `<h2>` → 4 个 `<h3>`，无跳级 |
| `canonical` | ✅ 指向 `https://gravitydesktop.app/`（占位，上线前改） |
| `title` / `description` | ✅ 英文默认；`main.js` 的 `META` 按语言改写 |
| `meta robots` | ✅ `index, follow, max-image-preview:large` |
| Open Graph / Twitter 卡 | ✅ 含 `og:image:type`、`og:image:alt`、`twitter:image:alt` |
| 结构化数据 | ✅ ① `SoftwareApplication` ② `FAQPage`（6 条问答，与页面 FAQ 一一对应） |
| `viewport` | ✅ 移动端适配 |
| 图片 | ✅ `srcset` + `sizes` + `loading="lazy"` + `width/height`（不抖动） |
| 语义化标签 | ✅ `<header>/<main>/<section>/<footer>/<nav>`、`<table>` 带 `scope` 属性 |
| 可抓取的折叠内容 | ✅ FAQ 用原生 `<details>`，答案始终在 DOM 中 |
| 性能信号 | ✅ 零第三方依赖、首屏不请求外部资源 |
| `robots.txt` | ✅ 新增 |
| `sitemap.xml` | ✅ 新增 |
| 内容加厚（对比 + FAQ） | ✅ 新增第 7 节对比表与第 10 节 FAQ |

### 为什么 FAQ 用原生 `<details>` 而不是 JS 折叠

`<details>` 的答案文本**始终在 DOM 里**（浏览器只是视觉上收起），爬虫能读到；
JS 折叠如果靠 `innerHTML` 动态注入，正文就不在初始 HTML 里，等于白写。

### 数 `<details>` 时别用 `grep -c`

HTML 注释里如果写了「用原生 `<details>`」这句话，`grep -c "<details"` 会把注释也算进去。
用 Python 正则 `<(details)[\s>]` 才准。

### 还没做 / 做不了的

- **外链**（权重的主要来源）：需要真人去社区、论坛、Reddit、Product Hunt 等地方自然提及
- **Search Console / Bing Webmaster 提交**：必须用真实域名在浏览器里操作
- **`hreflang`**：目前是单页内切换语言（`data-zh` + JS），不是两个独立 URL。
  如果以后把中文版拆成 `/zh/` 独立页面，那时才需要加 `hreflang`

---

## 12. 改动记录

- **v17（当前）**：**默认语言改为英文**。原先 `main.js` 会读 `navigator.language`，中文浏览器自动切中文。
  现改为 `var initial = saved || 'en'` —— **首次访问一律英文**（与 HTML 源码一致，所以零闪烁），
  只有主动点过「中文」的访客才被 `localStorage` 记住并保持中文。
  好处：源码给英文对 SEO 更友好、爬虫与首屏都拿到英文、也不会出现语言闪烁。
  README 第 8 节与首部说明已同步。
- **v16**：**补齐站内 SEO**（见第 11.1 节）。改动：
  - 新增 `robots.txt` + `sitemap.xml`（域名是占位，上线前必改）
  - `description` 改为含 `Windows 10/11` 的自然句；`meta robots` 加 `max-image-preview:large`；
    og / twitter 补 `og:image:type`、`og:image:alt`、`twitter:image:alt`
  - 新增 **`FAQPage` 结构化数据**（6 条问答，与页面 FAQ 一一对应）
  - 新增**第 7 节「和传统桌面分区工具的区别」**：三列 × 五行对比表（`.cmp`）。
    桌面端是标准表格（左上角单元格用 `.sr-only` 留空，给屏幕阅读器一个「对比项」列名）；
    ≤620px 隐藏 `thead`、把每行折成卡片，`.cmp-lbl` 从隐藏变为显示，充当卡片内的小列名
  - 新增**第 10 节「常见问题」**：6 个原生 `<details class="faq-item">`，
    标题右侧 `+` / `−` 指示器（`summary::after`），默认全部收起
  - `main.js` 的 `META` 描述同步更新
  - 验证：无头 Edge 在 1440 / 1256 / 744 / 500 四档视口 × 浅色深色两套主题下实测，
    三块大素材（`.panel` / `.shot-img` / `.clip-video`）逐像素同宽同左边缘、无横向溢出；
    对比表在 620px 断点正确切换为卡片式；英文串（更长）不撑破单元格
- **v15**：**提高浅色版打底文件的对比度**。用户在截图里指出演示左半边那 30 个
  浅灰文件「总是看不清楚」。原来只有 `rgba(10,11,16,.13)` 的描边 + `.03` 的填充，
  白底上糊成一片。改成：填充 `#f4f5f8` + 描边 `rgba(10,11,16,.22)` +
  极淡投影 `0 1px 2px rgba(10,11,16,.07)` + 内部线条 `rgba(10,11,16,.30)`。
  `#orbit` 示意图里的「白纸文档」图标同步压深（`--panel-doc: #eaedf3`、
  `--panel-doc-line: #9aa2b1`），两处观感一致。深色皮肤未动。
- **v14**：**新增「浅色 / 深色」两套主题**，顶栏加一个太阳 / 月亮分段控件，
  支持 `?theme=dark` 直接打开深色版（见第 4.1 节）。做法：
  - 把页面里所有裸色值收进 `style.css` 第 1 节（浅色）+ 第 1.1 节（深色）两套令牌，
    开关是 `<html data-theme>`
  - 深色窗口的底色 / 圆角 / 描边抽到新的 `.panel` 包裹层上，浅色版是白面板、深色版是纯黑面板；
    描边用 `box-shadow: inset` 而不是 `border`，以免三块大素材不等宽
  - 主题初值放在 `index.html` 的 `<head>` 内联脚本里（首次绘制前设好，避免刷新闪一下），
    优先级 `?theme=` > `localStorage` > `light`
  - 演示文件加了一套浅色皮肤（`html[data-theme="light"]` 覆盖 10 处颜色），
    由 `main.js` 通过 `postMessage({type:'gd-theme'})` 通知，**切换时不改 `src`、不重载**
  - 示意图的文案 / 改为「**被核心抓住的文件，不会再漂走。**」
    （英文 `Files held by a core never drift back.`），颜色全部令牌化
  - 实测浅色 / 深色下三块大素材在 1872 / 1392 / 1232 / 720 / 476 五档视口全部等宽；
    390px 与 320px 下顶栏三组控件不溢出、不重叠
- v13：截图**下方新增操作录屏**（`.clip`，`assets/video/desktop-demo.mp4`）。
  源片 2560×1440 / 95.6 秒 / 23.7MB，用格式工厂自带的 ffmpeg 转成 1600×900 CRF26 无音轨
  → **3.0MB**（约 1/8），封面帧单独抽成 1600×900 WebP（96KB）。
  原生 `<video controls preload="metadata" playsinline poster>`，**不自动播放**。
  样式复用 `.shot-img` 的圆角/描边/投影，走 `.wrap.wide`，与黑窗口、截图**严格同宽**
  （实测 1896 / 1416 / 1232 / 720 / 476 三块全部一致）。
- v12：**深色区不再通栏，收成 1280px 宽的居中黑窗口**，与真实截图严格同宽同位置。
  做法：用一个 `<div class="wrap wide">` 包住 `.showcase` + `.orbit`，黑底铺在两个 section
  自己的 border box 上（宽度 = wrap 的内容宽 = 1280），`padding-inline: 28px` 当内侧黑边；
  上圆角给 `.showcase`、下圆角给 `.orbit`（各 12px，和截图一致）。
  连带删掉 `.top.on-dark` 那套顶栏反白样式和 `main.js` 里对 `.dark-band` 的遍历
  （窗口不通栏后，反白文字会落在两侧白底上读不出来）。
  实测 1896 / 1416 / 1256 / 744 / 476 五档视口，黑窗口与截图**逐像素重合**。
  > 上一版（v11）只改了透明舞台的宽度，肉眼完全看不出效果——因为「黑窗口」其实是
  > section 的通栏背景，这才是真正的元凶。
- v11：**两块大图统一宽度**——把演示舞台 `.stage` 和它的说明文字 `.stage-cap`
  一起放进 `.wrap.wide`，与真实截图 `.shot-img` 共用同一条宽度规则，任何视口下严格等宽、
  左边缘对齐。修掉「舞台铺满通栏、截图被 `.wrap.wide` 各收 28px」在视口 < 1336px 时相差 56px 的问题。
- v10：深色带下面新增**真实桌面截图**区块（`.real`）。
  源图 2559×1389 PNG 处理成 1920 宽 WebP（136KB）+ 960 宽变体（43KB），配 `srcset` / `sizes` / `loading="lazy"`。
  容器用新的 `.wrap.wide`（1280px，和演示舞台上限对齐）。
- v9：**统一上下两块深色区域**——演示区改成和 `#orbit` 一样的通栏深色带
  （同宽、同 `--dark` 纯黑、中间不留白），舞台去掉圆角/阴影/底色、上限锁 `1280px`；
  演示文件自身的 `.screen` 从蓝色渐变改为纯黑，核心外环颜色对齐 `#orbit`。
  主标题去掉 `<br>` 改回一行写完；第一段文案重写为
  `每天随着新文件增加，文件就变化位置，让人难以第一时间找到它。`
- v8：**痛点区块提到页面第一屏**（原来在演示下面），主标题改成疑问句
  `图标一直在动，不容易找？` / `Icons keep moving. Hard to find?`。
  新增「中文排版修正」：切到中文时收窄标题字距、提高标题与正文行高、收窄小标签字距
  （原先把英文的负字距和 1.06 行高直接套在中文上，字挤在一起、两行几乎顶住）。
- v7：页面最上面改为**交互演示**（`assets/demo/gravity-demo.html`，1280×768 固定画布，
  iframe + `transform: scale()` 等比缩放）。含语言 / 紧凑态 / 自动播放三条 `postMessage` 桥。
  推广视频方案作废（文件保留，见 6.1）。
- v6：**移除**页面最上面的推广视频（页面回到「顶栏 → 痛点文字 → 示意图」）。
- v5：页面最上面加**推广演示视频**（12 秒循环，16:9，自动播放、点按可暂停）。
  视频首屏不取流，进入视口才加载；并解决了录屏 WebM 无时长导致的 loop 失效问题。
- v4：示意图**照真实产品截图重画**，砍掉多余装饰——只留「一个核心 + 五个文件 + 五条细线」，
  背景改**纯黑**。删掉 v3 里的三条同心轨道、径向光晕、15 个文件、外围散落文件与虚线轨迹。
- v3：整体重做为极简风格。删除真实截图与「展开/折叠」对比图，改为**单一引力示意图**；
  顶栏语言切换改为 EN / 中文 分段控件；页面顺序调整为 痛点 → 示意图 → 其余。
- v2：新增 `#chaos`（左右对比）与 `#languages`；修正 JSON-LD 语言数（7 → 6）。
- v1：首版单页，Hero 左文右图 + 四功能卡 + 真实截图。
