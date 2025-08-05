# 如何在本地运行 YouTube to Text

## 前置要求
- Node.js 18+ 已安装
- npm 或 yarn 包管理器

## 运行步骤

### 1. 打开终端，进入项目目录
```bash
cd /Users/weifu/Desktop/youtube转文字/Youtubetotext
```

### 2. 安装依赖（首次运行时）
```bash
npm install
```

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 打开浏览器
服务器启动后，打开浏览器访问：
```
http://localhost:3000
```

## 使用方法

1. **复制YouTube视频链接**
   - 支持格式：
     - https://www.youtube.com/watch?v=VIDEO_ID
     - https://youtu.be/VIDEO_ID

2. **粘贴到输入框**
   - 将链接粘贴到页面上的输入框中

3. **点击"Extract Text"按钮**
   - 等待几秒钟，字幕会自动提取

4. **查看和下载结果**
   - 字幕文本会显示在页面下方
   - 可以复制文本或下载为TXT文件

## 测试视频
- 英文视频：https://www.youtube.com/watch?v=_GMtx9EsIKU
- 短视频：https://www.youtube.com/watch?v=nKIu9yen5nc

## 常见问题

**Q: 提取失败怎么办？**
- 确保视频有字幕（CC）功能
- 检查视频是否为公开视频
- 某些地区限制的视频可能无法提取

**Q: 如何停止服务器？**
- 在终端中按 `Ctrl + C`

**Q: 如何查看调试信息？**
- 在页面上按 `Ctrl/Cmd + D` 打开调试面板

## 其他命令

- 构建生产版本：`npm run build`
- 运行生产版本：`npm start`
- 代码检查：`npm run lint`