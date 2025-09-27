import json
import requests
import time

# 테스트 데이터 로드
with open('test_data.json', 'r', encoding='utf-8') as f:
    events = json.load(f)

# API 엔드포인트
api_url = "http://localhost:8000/api/v1/events/"

print("🚀 테스트 데이터 삽입을 시작합니다...")

success_count = 0
for i, event in enumerate(events, 1):
    try:
        response = requests.post(api_url, json=event, timeout=10)
        if response.status_code == 201:
            print(f"✅ [{i}/{len(events)}] {event['title']} - 생성 성공")
            success_count += 1
        else:
            print(f"❌ [{i}/{len(events)}] {event['title']} - 실패: {response.status_code}")
            print(f"   응답: {response.text}")
    except Exception as e:
        print(f"❌ [{i}/{len(events)}] {event['title']} - 에러: {str(e)}")
    
    time.sleep(0.5)  # API 호출 간격 조절

print(f"\n🎉 총 {success_count}/{len(events)}개 이벤트가 생성되었습니다!")
print("✅ 테스트 데이터 삽입 완료!")
