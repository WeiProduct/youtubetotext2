# 本地运行指南

## 快速开始

### 方法 1: 使用脚本（推荐）
```bash
./run-local.sh
```

### 方法 2: 手动运行
```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
```

## 访问应用

打开浏览器访问: http://localhost:3000

## 测试视频

以下是一些有字幕的测试视频：

1. **TED Talk**
   - https://www.youtube.com/watch?v=8jPQjjsBbIc

2. **Google 官方视频**
   - https://www.youtube.com/watch?v=nKIu9yen5nc

3. **Khan Academy**
   - https://www.youtube.com/watch?v=gM95HHI4gLk

## 调试功能

1. **查看控制台日志**
   - 按 F12 打开浏览器开发者工具
   - 查看 Console 标签

2. **调试面板**
   - 页面右下角会显示实时状态
   - 显示错误信息和加载状态

## 常见问题

### 端口被占用
```bash
# 杀死占用 3000 端口的进程
lsof -ti:3000 | xargs kill -9
```

### 依赖安装失败
```bash
# 清理缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

### 提取失败
- 确保视频有 CC/字幕功能
- 检查网络连接
- 查看控制台错误信息