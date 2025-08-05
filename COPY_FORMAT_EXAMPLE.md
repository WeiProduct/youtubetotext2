# Debug Console 复制格式示例

## 单个日志复制格式：

```
[ERROR] 2025/8/5 20:10:45
Timestamp: 2025-08-05T03:10:45.123Z
Message: Failed to extract transcript
Log ID: log_1234567890

Details:
Stack Trace:
Error: Failed to extract transcript
    at getYouTubeTranscript (youtube-transcript.ts:139:15)
    at async POST (route.ts:53:34)
    at async Server.requestListener (start-server.js:141:13)

{
  "videoId": "_GMtx9EsIKU",
  "attemptedMethods": ["InnerTube API", "youtube-transcript", "external"],
  "error": "No transcript found",
  "timestamp": "2025-08-05T03:10:45.123Z"
}
```

## 多个日志复制格式：

```
[INFO] 2025/8/5 20:10:30
Timestamp: 2025-08-05T03:10:30.100Z
Message: YouTube to Text app loaded successfully
Details:
{
  "timestamp": "2025-08-05T03:10:30.100Z",
  "environment": "production"
}

================================================================================

[ERROR] 2025/8/5 20:10:45
Timestamp: 2025-08-05T03:10:45.123Z
Message: Failed to extract transcript
Details:
Stack Trace:
Error: Failed to extract transcript
    at getYouTubeTranscript (youtube-transcript.ts:139:15)
    at async POST (route.ts:53:34)

{
  "videoId": "_GMtx9EsIKU",
  "attemptedMethods": ["InnerTube API", "youtube-transcript", "external"],
  "error": "No transcript found"
}

================================================================================

[WARNING] 2025/8/5 20:10:50
Timestamp: 2025-08-05T03:10:50.456Z
Message: Falling back to external service
Details:
{
  "service": "downsub.com",
  "reason": "Primary methods failed"
}
```

## 改进内容：

1. **完整时间信息**
   - 本地日期和时间
   - ISO 8601 格式时间戳
   
2. **结构化信息**
   - 日志类型
   - 消息
   - 日志ID（单个日志时）
   
3. **详细信息**
   - 错误堆栈（如果存在）
   - 完整的 JSON 对象
   - 所有属性都被保留

4. **可读性**
   - 使用分隔线分隔多个日志
   - 清晰的标签和缩进
   - 保持原始格式