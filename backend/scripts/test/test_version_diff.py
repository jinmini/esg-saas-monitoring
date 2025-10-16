"""
Version Diff API 테스트 스크립트
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

def print_header(text):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")

def print_section(text):
    print(f"\n--- {text} ---")

def print_json(data):
    print(json.dumps(data, indent=2, ensure_ascii=False))

def main():
    print_header("Version Diff API 테스트")
    
    # 1. 기존 문서 ID 사용 (test_version_simple.py에서 생성된 문서)
    document_id = 1
    
    try:
        # 2. 문서 조회
        print_section("1. 문서 조회")
        response = requests.get(f"{BASE_URL}/documents/{document_id}")
        if response.status_code == 200:
            doc = response.json()
            print(f"문서 ID: {doc['id']}")
            print(f"제목: {doc['title']}")
            print(f"섹션 수: {len(doc.get('sections', []))}")
        else:
            print(f"문서 조회 실패: {response.status_code}")
            return
        
        # 3. 버전 목록 조회
        print_section("2. 버전 목록 조회")
        response = requests.get(f"{BASE_URL}/documents/{document_id}/versions")
        if response.status_code == 200:
            versions_data = response.json()
            versions = versions_data.get('versions', [])
            print(f"총 버전 수: {versions_data.get('total', 0)}")
            
            if len(versions) >= 2:
                print("\n최근 2개 버전:")
                for v in versions[:2]:
                    print(f"  - v{v['version_number']}: {v.get('comment', '(설명 없음)')}")
                
                # 4. 두 버전 비교
                print_section("3. 두 버전 비교 (v2 vs v1)")
                diff_request = {
                    "source_version_id": versions[1]['id'],  # 이전 버전
                    "target_version_id": versions[0]['id']   # 최신 버전
                }
                
                response = requests.post(
                    f"{BASE_URL}/documents/{document_id}/versions/diff",
                    json=diff_request
                )
                
                if response.status_code == 200:
                    diff = response.json()
                    print("\nDiff 결과:")
                    print_json(diff)
                    
                    print("\n변경 요약:")
                    print(f"  - 추가된 섹션: {len(diff.get('sections_added', []))}")
                    print(f"  - 삭제된 섹션: {len(diff.get('sections_removed', []))}")
                    print(f"  - 수정된 섹션: {len(diff.get('sections_modified', []))}")
                    print(f"  - 추가된 블록: {diff.get('blocks_added', 0)}")
                    print(f"  - 삭제된 블록: {diff.get('blocks_removed', 0)}")
                    print(f"  - 수정된 블록: {diff.get('blocks_modified', 0)}")
                    print(f"  - 변경된 문자 수: {diff.get('chars_changed', 0)}")
                else:
                    print(f"Diff 실패: {response.status_code}")
                    print(response.text)
                
                # 5. 특정 버전 vs 현재 문서
                print_section("4. 특정 버전 vs 현재 문서")
                diff_request = {
                    "source_version_id": versions[1]['id'],  # 이전 버전
                    "target_version_id": None  # 현재 문서
                }
                
                response = requests.post(
                    f"{BASE_URL}/documents/{document_id}/versions/diff",
                    json=diff_request
                )
                
                if response.status_code == 200:
                    diff = response.json()
                    print("\nDiff 결과 (vs 현재):")
                    print(f"  Source: v{diff.get('source_version')}")
                    print(f"  Target: 현재 문서")
                    print(f"  변경된 섹션: {len(diff.get('sections_modified', []))}")
                    print(f"  변경된 문자 수: {diff.get('chars_changed', 0)}")
                else:
                    print(f"Diff 실패: {response.status_code}")
                    print(response.text)
            else:
                print("버전이 2개 미만입니다. 더 많은 버전을 생성하세요.")
        else:
            print(f"버전 목록 조회 실패: {response.status_code}")
    
    except requests.exceptions.ConnectionError:
        print("백엔드 서버에 연결할 수 없습니다.")
        print("서버가 실행 중인지 확인하세요: uvicorn src.main:app --reload --port 8000")
    except Exception as e:
        print(f"오류 발생: {e}")

if __name__ == "__main__":
    main()

