# 云端字幕提取失败调试计划

## 当前问题总结
- 视频ID: _GMtx9EsIKU
- 本地环境: ✅ 能成功提取字幕
- 云端环境: ❌ 所有方法都失败

## 失败的5个方法
1. **InnerTube API**: "No transcript found"
2. **youtube-transcript库**: 未明确说明错误
3. **Alternative method**: "No transcript found"  
4. **Direct URL**: 尝试了但失败
5. **External services**: "No external service could retrieve the transcript"

## 需要检查的关键环节

### 1. InnerTube API响应检查
需要在云端环境查看：
- playabilityStatus的具体值
- 是否返回了captions对象
- 具体的错误信息

### 2. 增强调试日志
```javascript
// 在 youtube-innertube.ts 中添加
console.log('=== INNERTUBE DEBUG ===')
console.log('Video ID:', videoId)
console.log('Client:', client.clientName)
console.log('Response status:', response.status)
console.log('Playability:', videoInfo?.playabilityStatus)
console.log('Has captions:', !!videoInfo?.captions)
console.log('Caption tracks:', videoInfo?.captions?.playerCaptionsTracklistRenderer?.captionTracks?.length || 0)
```

### 3. 测试不同的客户端配置
- WEB_EMBEDDED_PLAYER (当前默认)
- ANDROID
- WEB
- MWEB (移动网页)
- TV_EMBEDDED

### 4. 检查网络层面
- 添加请求超时处理
- 记录DNS解析结果
- 检查TLS握手

### 5. 使用专门的调试视频
测试这些已知有字幕的视频：
- `dQw4w9WgXcQ` - Never Gonna Give You Up
- `jNQXAC9IVRw` - Me at the zoo (第一个YouTube视频)
- `9bZkp7q19f0` - Gangnam Style

## 立即行动计划

### Step 1: 创建云端调试端点
增强 `/api/debug-innertube` 返回更多信息：
- 完整的InnerTube响应
- 环境变量
- 请求头信息
- IP地址信息

### Step 2: 测试多个客户端
创建测试端点尝试所有客户端类型：
```javascript
const clients = ['WEB_EMBEDDED_PLAYER', 'ANDROID', 'WEB', 'IOS', 'MWEB']
for (const clientType of clients) {
  // 测试每个客户端
}
```

### Step 3: 比较请求差异
使用 curl 或 Postman：
1. 从本地发送相同请求
2. 从云端发送相同请求
3. 比较响应差异

### Step 4: 检查特定视频
视频 `_GMtx9EsIKU` 可能：
- 没有字幕
- 地区限制
- 需要登录才能查看字幕

## 可能的解决方案

1. **使用代理服务**
   - 通过住宅IP代理发送请求
   - 避免数据中心IP限制

2. **模拟浏览器行为**
   - 添加更多浏览器相关的请求头
   - 模拟真实的用户会话

3. **使用YouTube Data API v3**
   - 官方API可能更稳定
   - 但需要API配额

4. **缓存机制**
   - 本地成功后缓存结果
   - 云端直接返回缓存

## 下一步测试命令

```bash
# 1. 测试调试端点
curl -X POST https://youtubetotext2.vercel.app/api/debug-innertube \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

# 2. 测试已知有字幕的视频
curl -X POST https://youtubetotext2.vercel.app/api/youtube-transcript \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```