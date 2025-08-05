# YouTube字幕提取完整环节检查清单

## 1. API路由层 (`/api/youtube-transcript/route.ts`)
- [ ] 接收POST请求
- [ ] 解析请求体中的URL
- [ ] 提取视频ID
- [ ] 调用 `getYouTubeTranscript` 函数
- [ ] 返回响应（成功或错误）

## 2. 主协调函数 (`youtube-transcript.ts`)
- [ ] 按优先级尝试多种方法
- [ ] 记录每次尝试的结果
- [ ] 收集所有错误信息
- [ ] 生成详细错误报告

## 3. InnerTube API (`youtube-innertube.ts`) - 优先级1
### 请求阶段
- [ ] 构建请求URL: `https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8`
- [ ] 设置请求头
  - Content-Type: application/json
  - User-Agent
  - Origin: https://www.youtube.com
  - X-YouTube-Client-Name: 56 (WEB_EMBEDDED_PLAYER)
  - X-YouTube-Client-Version: 2.20240726.00.00
- [ ] 构建请求体
  - videoId
  - context.client (WEB_EMBEDDED_PLAYER配置)
  - playbackContext
  - contentCheckOk: true
  - racyCheckOk: true

### 响应处理
- [ ] 检查响应状态码 (200?)
- [ ] 检查 playabilityStatus (OK?)
- [ ] 获取 captions.playerCaptionsTracklistRenderer.captionTracks
- [ ] 找到合适的语言轨道
- [ ] 获取 baseUrl

### 字幕下载
- [ ] 使用baseUrl下载XML格式字幕
- [ ] 解析XML提取文本内容

## 4. youtube-transcript库 - 优先级2
- [ ] 直接调用 `YoutubeTranscript.fetchTranscript(videoId)`
- [ ] 尝试指定语言 `{lang: 'en'}`
- [ ] 尝试获取任意可用语言

## 5. Alternative Method (`youtube-api.ts`) - 优先级3
- [ ] 调用 `getVideoInfo` 获取视频信息
- [ ] 调用 `extractCaptionTracks` 提取字幕轨道
- [ ] 选择合适的语言轨道
- [ ] 调用 `fetchCaptionContent` 获取字幕内容

## 6. Direct URL Method (`youtube-direct.ts`) - 优先级4
- [ ] 调用 `detectVideoLanguage` 检测语言
- [ ] 构建URL: `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&fmt=srv1`
- [ ] 尝试多种语言变体
- [ ] 解析响应内容

## 7. External Services (`youtube-external.ts`) - 优先级5
- [ ] 调用外部API服务
- [ ] 处理响应

## 云端失败的可能原因

### 环境差异
1. **IP地址限制**
   - [ ] 本地IP vs Vercel服务器IP
   - [ ] YouTube可能对数据中心IP有限制

2. **请求头差异**
   - [ ] User-Agent
   - [ ] Referer
   - [ ] Cookie（云端没有）

3. **TLS/SSL差异**
   - [ ] TLS版本
   - [ ] 证书验证

4. **网络配置**
   - [ ] DNS解析
   - [ ] 代理设置
   - [ ] 防火墙规则

### API响应差异
1. **playabilityStatus**
   - [ ] 本地: "OK"
   - [ ] 云端: "ERROR" 或 "UNPLAYABLE"

2. **错误类型**
   - [ ] 地区限制
   - [ ] 需要登录
   - [ ] 视频不可用

## 调试建议

1. **添加详细日志**
```javascript
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  VERCEL: process.env.VERCEL,
  IP: request.headers.get('x-forwarded-for')
})
```

2. **测试特定视频**
   - 使用已知有字幕的视频ID测试
   - 例如: dQw4w9WgXcQ (Rick Astley - Never Gonna Give You Up)

3. **比较请求/响应**
   - 记录完整的请求头和响应
   - 对比本地和云端的差异

4. **使用调试端点**
   - `/api/debug-innertube` 已创建
   - 可以看到详细的请求/响应信息