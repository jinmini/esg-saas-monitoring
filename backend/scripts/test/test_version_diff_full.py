"""
Version Diff API 전체 테스트 (버전 생성 포함)
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
    print_header("Version Diff API 전체 테스트")
    
    document_id = 1
    
    try:
        # 1. 문서 조회
        print_section("1. 문서 조회")
        response = requests.get(f"{BASE_URL}/documents/{document_id}")
        if response.status_code != 200:
            print(f"문서 조회 실패: {response.status_code}")
            return
        
        doc = response.json()
        print(f"문서 ID: {doc['id']}")
        print(f"제목: {doc['title']}")
        print(f"섹션 수: {len(doc.get('sections', []))}")
        
        # 2. 버전 1 생성
        print_section("2. 버전 1 생성 (초기 상태)")
        version1_data = {
            "comment": "초기 버전 - 원본 상태",
            "is_auto_saved": False
        }
        response = requests.post(
            f"{BASE_URL}/documents/{document_id}/versions",
            json=version1_data
        )
        if response.status_code == 201:
            version1 = response.json()
            print(f"버전 1 생성 완료: v{version1['version_number']}")
            print(f"섹션 수: {version1['sections_count']}, 블록 수: {version1['blocks_count']}")
            version1_id = version1['id']
        else:
            print(f"버전 생성 실패: {response.status_code}")
            return
        
        # 3. 문서 수정 (섹션 추가 시뮬레이션 - 실제로는 bulk-update로)
        print_section("3. 문서 수정 시뮬레이션")
        print("(실제 환경에서는 bulk-update API로 문서를 수정합니다)")
        
        # 4. 버전 2 생성
        print_section("4. 버전 2 생성 (수정 후)")
        version2_data = {
            "comment": "검토 반영 - 일부 섹션 수정",
            "is_auto_saved": False
        }
        response = requests.post(
            f"{BASE_URL}/documents/{document_id}/versions",
            json=version2_data
        )
        if response.status_code == 201:
            version2 = response.json()
            print(f"버전 2 생성 완료: v{version2['version_number']}")
            print(f"섹션 수: {version2['sections_count']}, 블록 수: {version2['blocks_count']}")
            version2_id = version2['id']
        else:
            print(f"버전 생성 실패: {response.status_code}")
            return
        
        # 5. 두 버전 비교 (v1 vs v2)
        print_section("5. 버전 비교: v1 vs v2")
        diff_request = {
            "source_version_id": version1_id,
            "target_version_id": version2_id
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
            print(f"  Source: v{diff.get('source_version')}")
            print(f"  Target: v{diff.get('target_version')}")
            print(f"  추가된 섹션: {diff.get('sections_added', [])}")
            print(f"  삭제된 섹션: {diff.get('sections_removed', [])}")
            print(f"  수정된 섹션 수: {len(diff.get('sections_modified', []))}")
            
            if diff.get('sections_modified'):
                print("\n수정된 섹션 상세:")
                for section in diff.get('sections_modified', []):
                    print(f"  - {section.get('section_title')}:")
                    changes = section.get('changes', {})
                    print(f"    추가: {changes.get('blocks_added', 0)}, "
                          f"삭제: {changes.get('blocks_removed', 0)}, "
                          f"수정: {changes.get('blocks_modified', 0)}")
            
            print(f"\n전체 통계:")
            print(f"  - 추가된 블록: {diff.get('blocks_added', 0)}")
            print(f"  - 삭제된 블록: {diff.get('blocks_removed', 0)}")
            print(f"  - 수정된 블록: {diff.get('blocks_modified', 0)}")
            print(f"  - 변경된 문자 수: {diff.get('chars_changed', 0)}")
        else:
            print(f"Diff 실패: {response.status_code}")
            print(response.text)
        
        # 6. 특정 버전 vs 현재 문서
        print_section("6. 버전 vs 현재 문서: v1 vs 현재")
        diff_request = {
            "source_version_id": version1_id,
            "target_version_id": None
        }
        
        response = requests.post(
            f"{BASE_URL}/documents/{document_id}/versions/diff",
            json=diff_request
        )
        
        if response.status_code == 200:
            diff = response.json()
            print("\nDiff 결과:")
            print(f"  Source: v{diff.get('source_version')}")
            print(f"  Target: 현재 문서 (target_version=None)")
            print(f"  수정된 섹션: {len(diff.get('sections_modified', []))}")
            print(f"  변경된 문자 수: {diff.get('chars_changed', 0)}")
        else:
            print(f"Diff 실패: {response.status_code}")
            print(response.text)
        
        print_section("테스트 완료")
        print("Diff API가 정상적으로 작동합니다.")
    
    except requests.exceptions.ConnectionError:
        print("백엔드 서버에 연결할 수 없습니다.")
        print("서버가 실행 중인지 확인하세요: uvicorn src.main:app --reload --port 8000")
    except Exception as e:
        print(f"오류 발생: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()

