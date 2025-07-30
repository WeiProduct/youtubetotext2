# Vercel部署指南

## 方法1：通过Vercel网页界面（推荐）

1. 在您的截图中，点击右上角的 **"..."** 按钮
2. 选择 **"Redeploy"**
3. 在弹出的对话框中，确保选择 **"Use current branch"**
4. 点击 **"Redeploy"** 按钮

## 方法2：修复GitHub自动部署

1. 在Vercel项目页面，点击 **"Settings"** 标签
2. 在左侧菜单选择 **"Git"**
3. 检查以下设置：
   - **Connected Git Repository**: WeiProduct/youtubetotext
   - **Production Branch**: main
   - **Deploy Hooks**: 应该显示 "GitHub"

如果没有连接：
1. 点击 **"Connect Git Repository"**
2. 选择 **GitHub**
3. 授权并选择 **WeiProduct/youtubetotext** 仓库

## 方法3：使用Vercel CLI

```bash
# 1. 安装Vercel CLI（如果还没有安装）
npm i -g vercel

# 2. 登录
vercel login

# 3. 链接项目
vercel link

# 4. 部署到生产环境
vercel --prod
```

## 验证部署

部署完成后，访问以下URL验证：
- 主页: https://youtubetotextclaude.vercel.app
- 健康检查: https://youtubetotextclaude.vercel.app/api/health
- 应该显示版本 1.2.0

## 最新功能包括：
- ✅ 多种字幕提取方法
- ✅ InnerTube API支持
- ✅ 外部服务集成
- ✅ CORS代理
- ✅ 手动字幕输入
- ✅ Hydration错误修复