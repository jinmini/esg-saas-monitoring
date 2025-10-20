# 모니터링 환경 변수 설정

`.env.dev` 파일에 다음 설정을 추가하세요:

```env
# ============================================
# AI Assist 모니터링 설정
# ============================================

# Logging
AI_ASSIST_LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR, CRITICAL
AI_ASSIST_LOG_FORMAT=json  # json, console
AI_ASSIST_LOG_FILE=./data/logs/ai_assist.log

# Metrics
AI_ASSIST_METRICS_ENABLED=true

# Alerting (Slack)
AI_ASSIST_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Alert Thresholds
AI_ASSIST_ALERT_ERROR_RATE_THRESHOLD=0.05  # 5%
AI_ASSIST_ALERT_LATENCY_THRESHOLD=45.0  # 45 seconds
AI_ASSIST_ALERT_TOKEN_USAGE_THRESHOLD=0.8  # 80%
```

## Slack Webhook URL 설정 방법

1. Slack Workspace에서 App 생성
   - https://api.slack.com/apps → Create New App
   - From scratch 선택
   - App Name: "AI Assist Alerts"
   - Workspace 선택

2. Incoming Webhooks 활성화
   - Features → Incoming Webhooks
   - Activate Incoming Webhooks → On
   - Add New Webhook to Workspace
   - 알림받을 채널 선택 (예: #ai-assist-alerts)

3. Webhook URL 복사
   - 생성된 URL을 복사 (예: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX)
   - `.env.dev`의 `AI_ASSIST_SLACK_WEBHOOK_URL`에 붙여넣기

4. 테스트
   ```bash
   curl -X POST -H 'Content-type: application/json' \
   --data '{"text":"Hello from AI Assist!"}' \
   YOUR_WEBHOOK_URL
   ```

