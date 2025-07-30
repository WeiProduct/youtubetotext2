# 部署到新的Vercel项目

## 方法1：通过Vercel网站（推荐）

1. **访问 Vercel**
   - 打开 https://vercel.com/new

2. **导入Git仓库**
   - 点击 "Import Git Repository"
   - 选择 "Import from GitHub"
   - 找到并选择 `WeiProduct/youtubetotextclaude`

3. **配置项目**
   - Project Name: `youtube-to-text` (或任何您喜欢的名字)
   - Framework Preset: Next.js (应该自动检测)
   - Root Directory: `.` (留空)
   - Build Command: `npm run build` (默认)
   - Output Directory: 留空 (Next.js默认)
   - Install Command: `npm install` (默认)

4. **环境变量**（如果需要）
   - 不需要添加任何环境变量

5. **部署**
   - 点击 "Deploy"
   - 等待部署完成（通常2-3分钟）

## 方法2：使用Vercel CLI

```bash
# 1. 全局安装Vercel CLI
npm i -g vercel

# 2. 登录Vercel
vercel login

# 3. 部署项目
vercel

# 4. 按照提示操作：
# - Set up and deploy: Y
# - Which scope: 选择您的账户
# - Link to existing project?: N
# - Project name: youtube-to-text
# - In which directory: ./
# - Want to modify settings?: N

# 5. 部署到生产环境
vercel --prod
```

## 部署完成后验证

访问以下URL确认部署成功：
- 主页: `https://[your-project-name].vercel.app`
- 健康检查: `https://[your-project-name].vercel.app/api/health`
- 版本文件: `https://[your-project-name].vercel.app/version.txt`

健康检查应该返回：
```json
{
  "status": "ok",
  "version": "1.2.0",
  "features": {
    "proxy": true,
    "robustExtraction": true,
    "debugPanel": true,
    "innerTubeApi": true,
    "externalServices": true,
    "manualInput": true
  }
}
```

## 功能确认

部署成功后，您应该能够：
1. 提取之前有问题的视频字幕
2. 看到右下角的调试面板
3. 使用手动输入字幕URL功能
4. 看到版本号 v1.2.0