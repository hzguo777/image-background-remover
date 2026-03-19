# OAuth 配置指南 - Cloudflare Pages 部署

## 1. 生成 NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

将生成的密钥添加到 `.env.local` 的 `NEXTAUTH_SECRET`

## 2. 配置 Google OAuth

1. 访问 [Google Cloud Console](https://console.cloud.google.com)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 转到 "凭据" → "创建凭据" → "OAuth 客户端 ID"
5. 应用类型选择 "Web 应用"
6. 添加授权重定向 URI：
   - 开发环境：`http://localhost:3000/api/auth/callback/google`
   - 生产环境：`https://your-domain.pages.dev/api/auth/callback/google`
   - 自定义域名：`https://your-custom-domain.com/api/auth/callback/google`
7. 复制客户端 ID 和客户端密钥到 `.env.local`

## 3. 配置 GitHub OAuth

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写信息：
   - Application name: `BG Remover`
   - Homepage URL: `https://your-domain.pages.dev` 或你的自定义域名
   - Authorization callback URL: `https://your-domain.pages.dev/api/auth/callback/github`
4. 创建后，复制 Client ID
5. 生成 Client Secret 并复制
6. 将两者添加到 `.env.local`

## 4. 在 Cloudflare Pages 中配置环境变量

### 配置位置：
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages**
3. 选择你的项目（image-background-remover）
4. 点击 **Settings** 标签页
5. 找到 **Environment variables** 部分
6. 点击 **Add variables**

### 需要添加的环境变量：

**Production 环境：**

| 变量名 | 类型 | 值 |
|--------|------|-----|
| `NEXTAUTH_URL` | Plain text | `https://your-domain.pages.dev` |
| `NEXTAUTH_SECRET` | Encrypt | (你生成的密钥) |
| `GOOGLE_CLIENT_ID` | Plain text | (Google OAuth 客户端 ID) |
| `GOOGLE_CLIENT_SECRET` | Encrypt | (Google OAuth 客户端密钥) |
| `GITHUB_CLIENT_ID` | Plain text | (GitHub OAuth 客户端 ID) |
| `GITHUB_CLIENT_SECRET` | Encrypt | (GitHub OAuth 客户端密钥) |
| `REMOVE_BG_API_KEY` | Encrypt | (你的 remove.bg API 密钥) |

**注意事项：**
- 敏感信息（Secret、密钥）选择 **Encrypt** 类型
- 非敏感信息（URL、ID）可以选择 **Plain text** 类型
- 每个环境变量都可以为 Production、Preview、Development 分别设置不同的值

### Preview 环境（可选）：
如果需要在预览部署中测试，也要为 Preview 环境添加相同的变量，但 `NEXTAUTH_URL` 要改为预览域名。

## 5. 配置自定义域名

### 在 Cloudflare Pages 中配置：

1. 在项目页面点击 **Custom domains** 标签
2. 点击 **Set up a custom domain**
3. 输入你的域名（例如：`bg-remover.example.com`）
4. Cloudflare 会自动配置 DNS（如果域名在 Cloudflare）
5. 如果域名不在 Cloudflare，按照提示添加 CNAME 记录

### 更新环境变量：

配置好自定义域名后，记得更新：
- Cloudflare Pages 中的 `NEXTAUTH_URL` 环境变量
- Google OAuth 应用的回调 URL
- GitHub OAuth 应用的回调 URL

## 6. 部署

### 本地构建测试：
```bash
npm run pages:build  # 使用 @cloudflare/next-on-pages 构建
```

### 部署到 Cloudflare Pages：

**方法一：通过 Wrangler CLI**
```bash
npm run deploy
```

**方法二：通过 Git 集成（推荐）**
1. 将代码推送到 GitHub
2. Cloudflare Pages 会自动检测并部署
3. 每次推送都会触发新的部署

**方法三：通过 Cloudflare Dashboard**
1. 在 Workers & Pages 页面点击 **Create application**
2. 选择 **Pages** → **Connect to Git**
3. 授权并选择你的仓库
4. 配置构建设置：
   - Build command: `npm run pages:build`
   - Build output directory: `.vercel/output/static`
5. 添加环境变量
6. 点击 **Save and Deploy**

## 7. 验证部署

部署完成后：
1. 访问你的 Cloudflare Pages URL
2. 点击 "Sign in" 按钮
3. 测试 Google 和 GitHub 登录
4. 确认登录后能看到用户头像和名称

## 常见问题

### 环境变量不生效
- 添加或修改环境变量后，需要重新部署才能生效
- 在 Deployments 页面点击 **Retry deployment** 或推送新的提交

### OAuth 回调失败
- 检查 `NEXTAUTH_URL` 是否与实际域名完全匹配（包括 https://）
- 确认 OAuth 应用的回调 URL 配置正确
- 检查环境变量是否正确设置（注意 Production/Preview 环境）

### 域名显示错误
- 确保自定义域名已正确配置并激活
- 更新所有环境变量中的域名引用
- 清除浏览器缓存或使用无痕模式测试

### NextAuth 错误
- 确认 `NEXTAUTH_SECRET` 已设置且不为空
- 检查所有 OAuth 凭据是否正确
- 查看 Cloudflare Pages 的 Functions 日志排查问题

## Cloudflare Pages 环境变量配置截图位置

在 Cloudflare Dashboard 中：
```
Workers & Pages 
  → 选择项目
  → Settings 标签页
  → Environment variables 部分
  → 点击 "Add variables" 按钮
```

这里可以添加两种类型的变量：
- **Plain text**: 非敏感信息（如 URL、Client ID）
- **Encrypt**: 敏感信息（如 Secret、API Key）

## 参考链接

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [NextAuth.js 文档](https://next-auth.js.org/)
- [@cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages)
