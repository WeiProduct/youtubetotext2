# InnerTube API 调试检查点清单

## 1. API端点配置

| 检查项 | 本地值 | 云端值 | 正确值 | 状态 |
|--------|--------|--------|--------|------|
| API URL | `https://www.youtube.com/youtubei/v1/player` | ? | `https://www.youtube.com/youtubei/v1/player` | ⚠️ |
| API Key | `AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8` | ? | 需确认是否被环境变量覆盖 | ⚠️ |
| URL参数 | `?key=${apiKey}` | ? | `?key=${apiKey}&prettyPrint=false` | ⚠️ |

## 2. 请求头 (Headers)

| Header | 本地值 | 云端值 | 必需性 | 检查点 |
|--------|--------|--------|--------|--------|
| Content-Type | `application/json` | ? | ✅ 必需 | □ |
| User-Agent | `Mozilla/5.0...` | ? | ✅ 必需 | □ |
| Origin | `https://www.youtube.com` | ? | ✅ 必需 | □ |
| Referer | `https://www.youtube.com` | ? | ✅ 必需 | □ |
| X-YouTube-Client-Name | `1` (WEB) | ? | ✅ 必需 | □ |
| X-YouTube-Client-Version | `2.20240726.00.00` | ? | ✅ 必需 | □ |
| Accept | `application/json` | ? | ⚠️ 可选 | □ |
| Accept-Language | `en-US,en;q=0.9` | ? | ⚠️ 可选 | □ |
| Accept-Encoding | 未设置 | ? | ❓ 可能需要 | □ |
| X-Goog-Visitor-Id | 未设置 | ? | ❓ 可能需要 | □ |
| X-Youtube-Bootstrap-Logged-In | 未设置 | ? | ❓ 可能需要 | □ |
| X-Youtube-Device | 未设置 | ? | ❓ 可能需要 | □ |
| X-Youtube-Page-CL | 未设置 | ? | ❓ 可能需要 | □ |
| X-Youtube-Page-Label | 未设置 | ? | ❓ 可能需要 | □ |

## 3. 请求体 (Request Body) - Context

| 字段路径 | 本地值 | 云端值 | 必需性 | 检查点 |
|----------|--------|--------|--------|--------|
| context.client.clientName | `WEB` | ? | ✅ | □ |
| context.client.clientVersion | `2.20240726.00.00` | ? | ✅ | □ |
| context.client.clientScreen | `WATCH` | ? | ⚠️ | □ |
| context.client.platform | `DESKTOP` | ? | ⚠️ | □ |
| context.client.hl | `en` | ? | ✅ | □ |
| context.client.gl | `US` | ? | ✅ | □ |
| context.client.timeZone | `UTC` | ? | ❓ | □ |
| context.client.utcOffsetMinutes | `0` | ? | ❓ | □ |
| context.client.browserName | 未设置 | ? | ❓ | □ |
| context.client.browserVersion | 未设置 | ? | ❓ | □ |
| context.client.osName | 未设置 | ? | ❓ | □ |
| context.client.osVersion | 未设置 | ? | ❓ | □ |
| context.client.originalUrl | 未设置 | ? | ❓ | □ |
| context.client.screenDensityFloat | 未设置 | ? | ❓ | □ |
| context.client.screenHeightPoints | 未设置 | ? | ❓ | □ |
| context.client.screenWidthPoints | 未设置 | ? | ❓ | □ |
| context.client.visitorData | 未设置 | ? | ❓ 重要 | □ |
| context.user.lockedSafetyMode | `false` | ? | ⚠️ | □ |
| context.request.useSsl | `true` | ? | ⚠️ | □ |
| context.request.internalExperimentFlags | `[]` | ? | ⚠️ | □ |

## 4. 请求体 (Request Body) - 其他参数

| 字段 | 本地值 | 云端值 | 必需性 | 检查点 |
|------|--------|--------|--------|--------|
| videoId | 动态 | ? | ✅ | □ |
| contentCheckOk | `true` | ? | ⚠️ | □ |
| racyCheckOk | `true` | ? | ⚠️ | □ |
| params | 未设置 | ? | ❓ | □ |
| playbackContext | 有设置 | ? | ❓ | □ |
| playbackContext.contentPlaybackContext.signatureTimestamp | `19950` | ? | ❓ | □ |
| attestation | 未设置 | ? | ❓ | □ |
| captionsRequested | 未设置 | ? | ❓ 重要 | □ |

## 5. 环境差异

| 检查项 | 本地 | 云端 | 影响 | 检查点 |
|--------|------|------|------|--------|
| Node.js版本 | ? | ? | 可能影响TLS | □ |
| Axios版本 | ? | ? | 请求行为差异 | □ |
| 时区 | 本地时区 | UTC | 可能影响 | □ |
| DNS解析 | 本地DNS | Vercel DNS | 可能不同IP | □ |
| TLS版本 | ? | ? | 握手差异 | □ |
| HTTP/2 | ? | ? | 协议差异 | □ |

## 6. 响应处理

| 检查项 | 描述 | 检查点 |
|--------|------|--------|
| 响应状态码 | 是否都是200？ | □ |
| 响应头 | 有无特殊头信息？ | □ |
| 错误响应体 | 具体错误信息？ | □ |
| captions字段路径 | `captions.playerCaptionsTracklistRenderer.captionTracks` | □ |
| playabilityStatus | 检查状态是否为"OK" | □ |

## 7. 调试步骤

```javascript
// 在 youtube-innertube.ts 中添加详细日志
console.log('=== INNERTUBE DEBUG ===')
console.log('Environment:', process.env.NODE_ENV)
console.log('URL:', url)
console.log('Headers:', headers)
console.log('Payload:', JSON.stringify(payload, null, 2))
console.log('Response Status:', response.status)
console.log('Response Headers:', response.headers)
console.log('Response Data:', JSON.stringify(response.data, null, 2))
```

## 8. 可能的关键差异

1. **visitorData** - YouTube用来识别访客的重要参数
2. **signatureTimestamp** - 可能需要动态获取
3. **captionsRequested** - 可能需要明确请求字幕
4. **params** - 某些base64编码的参数
5. **Cookie** - 云端可能缺少必要的cookie
6. **clientScreen** - WATCH vs EMBED vs UNPLAYED
7. **原始请求URL** - context.client.originalUrl

## 9. 测试方案

1. **最小化测试**
   ```javascript
   // 只发送最少必需参数
   const minimalPayload = {
     videoId: videoId,
     context: {
       client: {
         clientName: 'WEB',
         clientVersion: '2.20240726.00.00'
       }
     }
   }
   ```

2. **逐步添加参数**
   - 先测试最小集合
   - 逐个添加可疑参数
   - 找出关键差异

3. **对比其他实现**
   - 检查AI录音笔记的具体请求
   - 使用网络抓包工具
   - 对比请求差异

## 10. 立即可做的检查

- [ ] 在云端添加完整的请求/响应日志
- [ ] 检查 playabilityStatus 的具体值
- [ ] 验证 API key 在云端是否正确
- [ ] 测试不同的 clientScreen 值
- [ ] 添加 visitorData 参数
- [ ] 检查响应中的错误详情