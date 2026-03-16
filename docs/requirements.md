# Image Background Remover — MVP 需求文档

> 版本：v1.0
> 状态：草稿
> 更新日期：2026-03-16
> 飞书原文：https://feishu.cn/docx/FtSHdyihooNRcbx6ZyicWz6QnLd

---

## 一、产品概述

### 1.1 产品定位

一款面向全球用户的在线图片背景去除工具，用户上传图片后，系统自动调用 AI 接口完成抠图，并返回透明背景的 PNG 图片。无需注册，即开即用。

### 1.2 目标用户

- 电商卖家：需要快速处理商品主图
- 设计师 / 自媒体：日常抠图需求
- 普通用户：证件照、头像处理

### 1.3 核心价值

- 快：上传即处理，秒级返回
- 简：无需安装软件，无需注册账号
- 准：基于 remove.bg API，抠图质量有保障

---

## 二、技术架构

### 2.1 技术栈

| 层级 | 技术选型 | 说明 |
|---|---|---|
| 前端 | Next.js 14 (App Router) | SSR + SEO 友好 |
| 运行时 | Cloudflare Pages + Workers | Edge Runtime，全球低延迟 |
| AI 接口 | remove.bg API | 专业抠图，效果稳定 |
| 存储 | 无 | 图片全程内存处理，不落盘 |
| 域名/CDN | Cloudflare | 自带 CDN 加速 |

### 2.2 数据流

```
用户上传图片
    ↓
Cloudflare Pages 前端（Next.js）
    ↓
Cloudflare Workers Edge API（/api/remove-bg）
    ↓
remove.bg API（外部调用）
    ↓
返回透明 PNG（内存流式传输，不存储）
    ↓
前端展示 + 提供下载
```

### 2.3 关键约束

- 图片大小限制：≤ 5MB（remove.bg 免费版限制）
- 支持格式：JPG、PNG、WebP
- Workers CPU 时间：付费版 30s（需开启 $5/月 Workers Paid）
- 无用户数据持久化，隐私友好

---

## 三、功能需求

### 3.1 核心功能（Must Have）

**F1 - 图片上传**
- 支持点击上传和拖拽上传
- 支持格式：JPG、PNG、WebP
- 文件大小限制：≤ 5MB，超出给出明确提示
- 上传后立即触发处理，无需额外点击

**F2 - 背景去除处理**
- 调用 remove.bg API 处理图片
- 处理过程展示 Loading 状态（进度动画）
- 处理失败给出友好错误提示（如 API 额度不足、网络超时）

**F3 - 结果展示**
- 处理完成后展示原图 vs 结果图对比（左右滑块对比）
- 结果图背景用棋盘格纹理表示透明区域
- 支持放大预览

**F4 - 下载**
- 一键下载透明背景 PNG
- 文件名格式：`removed-bg-[原文件名].png`

**F5 - 重新上传**
- 下载后或处理完成后，提供"处理新图片"按钮，重置页面状态

### 3.2 增强功能（Nice to Have，MVP 后迭代）

- 批量上传处理（多图）
- 自定义替换背景色 / 背景图
- 高清下载（remove.bg 付费功能）
- 历史记录（本地 localStorage）
- API 接口对外开放

---

## 四、页面设计

### 4.1 页面结构（单页应用）

```
Header
  └── Logo + 产品名 + 简短 slogan

Hero Section
  └── 标题：Remove Image Background Free Online
  └── 副标题：100% Automatic & Instant
  └── 上传区域（拖拽 / 点击）

Processing Section（上传后显示）
  └── Loading 动画
  └── 进度提示文案

Result Section（处理完成后显示）
  └── 对比滑块（原图 / 结果图）
  └── 下载按钮
  └── 重新上传按钮

How It Works Section
  └── 3步说明：上传 → AI处理 → 下载

Footer
  └── 版权信息 + 隐私政策链接
```

### 4.2 设计规范

- 风格：简洁、现代，参考 remove.bg / unscreen.com
- 主色：白色背景 + 深色文字 + 品牌强调色（建议蓝紫渐变）
- 响应式：优先 PC，兼容移动端
- 语言：英文优先（面向全球流量）

---

## 五、SEO 需求

### 5.1 页面 Meta

| 字段 | 内容 |
|---|---|
| Title | Remove Image Background Free Online - [品牌名] |
| Description | Remove background from images instantly with AI. Free online tool, no signup required. Supports JPG, PNG, WebP. |
| Keywords | image background remover, remove bg, background eraser, transparent background |
| OG Image | 产品截图或 Demo 效果图 |

### 5.2 技术 SEO

- 使用 Next.js SSR，确保页面内容可被爬虫抓取
- 页面加载速度目标：LCP < 2.5s
- 添加 Schema.org 结构化数据（WebApplication 类型）
- 生成 sitemap.xml 和 robots.txt
- 图片添加 alt 属性

### 5.3 目标关键词

- 主词：image background remover（月搜索量 ~1M+）
- 长尾词：remove background from image free、background eraser online、transparent background maker

---

## 六、API 设计

### 6.1 POST /api/remove-bg

**请求**

```
Content-Type: multipart/form-data
Body: image（File）
```

**响应（成功）**

```
Content-Type: image/png
Content-Disposition: attachment; filename="removed.png"
Body: PNG 二进制流
```

**响应（失败）**

```json
{
  "error": "错误描述",
  "code": "INVALID_FILE | FILE_TOO_LARGE | API_ERROR | TIMEOUT"
}
```

**错误码说明**

| Code | 含义 | HTTP Status |
|---|---|---|
| INVALID_FILE | 不支持的文件格式 | 400 |
| FILE_TOO_LARGE | 文件超过 5MB | 400 |
| API_ERROR | remove.bg 接口异常 | 502 |
| TIMEOUT | 处理超时 | 504 |

---

## 七、环境变量

| 变量名 | 说明 | 必填 |
|---|---|---|
| REMOVE_BG_API_KEY | remove.bg API Key | 是 |

---

## 八、MVP 里程碑

| 阶段 | 内容 | 目标完成时间 |
|---|---|---|
| M1 - 基础搭建 | Next.js 项目初始化，Cloudflare Pages 配置，CI/CD 打通 | D+2 |
| M2 - 核心功能 | 上传组件、API 路由、结果展示、下载功能 | D+5 |
| M3 - UI 打磨 | 响应式布局、Loading 状态、错误处理、对比滑块 | D+7 |
| M4 - SEO 优化 | Meta 标签、sitemap、Schema.org、性能优化 | D+9 |
| M5 - 上线 | 域名绑定、环境变量配置、生产环境验证 | D+10 |

---

## 九、风险与注意事项

- **remove.bg API 费用**：免费版每月 50 次，超出需付费（约 $0.2/次），MVP 阶段建议设置调用量告警
- **Cloudflare Workers 付费**：Edge Runtime 处理图片需要 Workers Paid（$5/月），否则 CPU 时间不够
- **隐私合规**：页面需明确说明图片不被存储，建议添加隐私政策页面
- **滥用防护**：MVP 阶段可通过 Cloudflare Rate Limiting 限制单 IP 请求频率

---

## 十、参考资料

- remove.bg API 文档：https://www.remove.bg/api
- Cloudflare Pages + Next.js：https://developers.cloudflare.com/pages/framework-guides/nextjs/
- @cloudflare/next-on-pages：https://github.com/cloudflare/next-on-pages
