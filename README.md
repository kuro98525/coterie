# COTERIE

一个「高端会员制求职平台」的落地页概念，结构参考 LinkedIn 的经典落点（导航、登录入口、会员目录、职位、内容、企业服务、注册引导），视觉上改成私人俱乐部式的编辑设计。

站点内容为英文，品牌、人物与职位均为虚构，仅用于展示。

## 预览

无需安装或构建，直接打开 `index.html` 即可。

如果希望用本地服务预览：

```bash
npx serve .
# 或
python -m http.server 8080
```

## 重要：替换 Telegram 账号

所有“Contact / Request an invitation / Request an introduction / Log in with Telegram”入口、职位详情和表单提交，都统一指向 Telegram。页面上只保留了一处 Telegram 字样，其余入口用纸飞机图标和简短文案表达。

当前为占位用户名，替换起来只需要改一处：

```js
// assets/app.js 第 14 行
const TELEGRAM_HANDLE = 'your_telegram_username';
```

改成你的 Telegram 用户名（不带 `@`）即可。页面会自动生成带预填文本的链接，例如：

```text
https://t.me/你的用户名?text=Hello%20Coterie...
```

不同入口会预填不同内容：

- 会员入口：请求访问会员账号
- 会员卡片的“Request an introduction”：说明想认识谁
- 职位详情：请求某个职位的完整 brief
- 底部申请表：把姓名、邮箱、来意、公司、简介整理成一条带预填内容的 Telegram 消息
- For teams：说明想委托一次私密招聘

## 页面包含

- **首屏 + 会员登录卡**：单点 Telegram 登录入口，无密码
- **会员目录**：8 位虚构会员（真实人像示例），可按姓名 / 公司 / 领域搜索，并按角色筛选
- **The Ledger 职位板**：6 个私密职位，分类筛选、收藏、职位详情弹窗
- **The Briefing**：3 篇可展开阅读的编辑文章
- **For teams**：带搜索漏斗可视化的企业服务区块
- **会员申请**：前端校验后，把申请表内容预填进 Telegram 对话
- **响应式布局**：390 / 768 / 820 / 1024 / 1440 宽度均无横向溢出
- **无障碍**：语义化标签、可见焦点、弹窗焦点管理、移动菜单 `inert`、对 reduced-motion 的支持

## 技术说明

纯静态页面，无构建工具、无框架、无后端：

```text
coterie/
├── index.html
├── README.md
└── assets/
    ├── app.js
    ├── favicon.svg
    ├── portraits/
    │   └── （8 张示例人像）
    └── styles.css
```

表单不会写入服务器或数据库。点击提交后，浏览器会在新标签页打开 Telegram，并把内容作为待发送消息填好；用户按下发送后，消息才真正发出。

字体通过 Google Fonts 加载（Instrument Serif + Manrope），离线时会回退到系统衬线 / 无衬线字体。


## 图片素材

会员头像来自 [Unsplash](https://unsplash.com/license) 与 [Pexels](https://www.pexels.com/license/) 的免费图库，已下载到 `assets/portraits/` 作为本地演示素材。人物均为图库模特，与页面中的虚构姓名、职位无关。
