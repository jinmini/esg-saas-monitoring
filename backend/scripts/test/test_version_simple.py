"""
Version API 간단 테스트
"""

import requests
import json

BASE_URL = "http://localhost:8000/api/v1"
DOCUMENT_ID = 3  # 테스트용 문서 ID (수동 입력)

def test_create_version():
    """버전 생성 테스트"""
    print("\n[TEST 1] Create Version")
    print("="*60)
    
    version_data = {
        "comment": "Test version from API test",
        "is_auto_saved": False
    }
    
    response = requests.post(
        f"{BASE_URL}/documents/{DOCUMENT_ID}/versions",
        json=version_data
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print(f"[SUCCESS] Created version {data['version_number']}")
        print(json.dumps(data, indent=2, ensure_ascii=False))
        return data['id']
    else:
        print(f"[FAIL] {response.text}")
        return None


def test_list_versions():
    """버전 목록 조회 테스트"""
    print("\n[TEST 2] List Versions")
    print("="*60)
    
    response = requests.get(
        f"{BASE_URL}/documents/{DOCUMENT_ID}/versions",
        params={"limit": 10}
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"[SUCCESS] Found {data['total']} versions")
        for v in data['versions']:
            print(f"  - v{v['version_number']}: {v['comment'] or '(auto-saved)'}")
        return data['versions'][0]['id'] if data['versions'] else None
    else:
        print(f"[FAIL] {response.text}")
        return None


def test_get_version(version_id):
    """특정 버전 조회 테스트"""
    print("\n[TEST 3] Get Version Detail")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/versions/{version_id}")
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"[SUCCESS] Version {data['version_number']}")
        print(f"  Sections: {data['sections_count']}")
        print(f"  Blocks: {data['blocks_count']}")
        print(f"  Chars: {data['chars_count']}")
        print(f"  Comment: {data['comment']}")
    else:
        print(f"[FAIL] {response.text}")


def test_restore_version(version_id):
    """버전 복원 테스트"""
    print("\n[TEST 4] Restore Version")
    print("="*60)
    
    response = requests.post(
        f"{BASE_URL}/documents/{DOCUMENT_ID}/versions/{version_id}/restore"
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"[SUCCESS] {data['message']}")
        print(f"  Restored: v{data['restored_version_number']}")
        print(f"  Backup: v{data['backup_version_number']}")
    else:
        print(f"[FAIL] {response.text}")


if __name__ == "__main__":
    print("="*60)
    print("Version API Tests")
    print("="*60)
    print(f"Target Document ID: {DOCUMENT_ID}")
    
    try:
        # 1. 버전 생성
        version_id = test_create_version()
        
        # 2. 버전 목록 조회
        latest_version_id = test_list_versions()
        
        # 3. 특정 버전 조회
        if latest_version_id:
            test_get_version(latest_version_id)
        
        # 4. 버전 복원
        if version_id:
            test_restore_version(version_id)
        
        print("\n" + "="*60)
        print("[DONE] All tests completed")
        print("="*60)
        
    except requests.exceptions.ConnectionError:
        print("\n[ERROR] Cannot connect to backend server")
        print("Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()

