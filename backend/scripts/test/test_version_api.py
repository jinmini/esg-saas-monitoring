"""
Version API 테스트 스크립트
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

def print_response(title, response):
    """응답 출력"""
    print(f"\n{'='*60}")
    print(f"[TEST] {title}")
    print(f"{'='*60}")
    print(f"Status: {response.status_code}")
    if response.status_code == 204:
        print("Response: No Content (204)")
    else:
        try:
            print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        except:
            print(response.text)
    print()


def test_version_api():
    """Version API 테스트"""
    
    # 0. Health Check
    print("[START] Version API Tests...")
    health = requests.get(f"{BASE_URL.replace('/api/v1', '')}/health")
    print_response("Health Check", health)
    
    # 1. 문서 목록 조회 (테스트용 문서 ID 찾기)
    print("\n[STEP 1] Get Documents")
    docs_response = requests.get(f"{BASE_URL}/documents")
    print_response("GET /documents", docs_response)
    
    if docs_response.status_code != 200 or not docs_response.json():
        print("❌ No documents found. Please create a document first.")
        return
    
    # 첫 번째 문서 ID 사용
    document_id = docs_response.json()[0]["id"]
    print(f"✅ Using document ID: {document_id}")
    
    # 2. 버전 생성 (수동 저장)
    print("\n📋 Step 2: Create Version (Manual)")
    version_data = {
        "comment": "Test version - manual save",
        "is_auto_saved": False
    }
    create_response = requests.post(
        f"{BASE_URL}/documents/{document_id}/versions",
        json=version_data
    )
    print_response(f"POST /documents/{document_id}/versions", create_response)
    
    if create_response.status_code != 201:
        print("❌ Failed to create version")
        return
    
    version_id = create_response.json()["id"]
    version_number = create_response.json()["version_number"]
    print(f"✅ Created version: ID={version_id}, Number=v{version_number}")
    
    # 3. 버전 생성 (자동 저장)
    print("\n📋 Step 3: Create Version (Auto)")
    auto_version_data = {
        "comment": None,
        "is_auto_saved": True
    }
    auto_response = requests.post(
        f"{BASE_URL}/documents/{document_id}/versions",
        json=auto_version_data
    )
    print_response(f"POST /documents/{document_id}/versions (auto)", auto_response)
    
    # 4. 버전 목록 조회
    print("\n📋 Step 4: List Versions")
    list_response = requests.get(
        f"{BASE_URL}/documents/{document_id}/versions",
        params={"limit": 10, "include_auto_saved": True}
    )
    print_response(f"GET /documents/{document_id}/versions", list_response)
    
    # 5. 버전 목록 조회 (수동 저장만)
    print("\n📋 Step 5: List Versions (Manual only)")
    list_manual_response = requests.get(
        f"{BASE_URL}/documents/{document_id}/versions",
        params={"limit": 10, "include_auto_saved": False}
    )
    print_response(f"GET /documents/{document_id}/versions (manual only)", list_manual_response)
    
    # 6. 특정 버전 조회
    print("\n📋 Step 6: Get Version Detail")
    version_detail_response = requests.get(f"{BASE_URL}/versions/{version_id}")
    print_response(f"GET /versions/{version_id}", version_detail_response)
    
    # 7. 버전 복원
    print("\n📋 Step 7: Restore Version")
    restore_response = requests.post(
        f"{BASE_URL}/documents/{document_id}/versions/{version_id}/restore"
    )
    print_response(f"POST /documents/{document_id}/versions/{version_id}/restore", restore_response)
    
    if restore_response.status_code == 200:
        result = restore_response.json()
        print(f"✅ Restored to version {result['restored_version_number']}")
        print(f"✅ Backup created: version {result['backup_version_number']}")
    
    # 8. 버전 삭제 (최신 버전이 아닌 것 삭제 시도)
    print("\n📋 Step 8: Delete Version")
    if list_response.status_code == 200:
        versions = list_response.json()["versions"]
        if len(versions) > 1:
            # 두 번째 버전 삭제 시도 (최신 버전 아님)
            delete_version_id = versions[1]["id"]
            delete_response = requests.delete(f"{BASE_URL}/versions/{delete_version_id}")
            print_response(f"DELETE /versions/{delete_version_id}", delete_response)
        else:
            print("⚠️ Only one version exists, skipping delete test")
    
    # 9. Diff API 테스트 (501 예상)
    print("\n📋 Step 9: Compare Versions (Phase 1.4 - Not Implemented)")
    diff_data = {
        "source_version_id": version_id,
        "target_version_id": None
    }
    diff_response = requests.post(
        f"{BASE_URL}/documents/{document_id}/versions/diff",
        json=diff_data
    )
    print_response(f"POST /documents/{document_id}/versions/diff", diff_response)
    
    print("\n" + "="*60)
    print("✅ All tests completed!")
    print("="*60)


if __name__ == "__main__":
    try:
        test_version_api()
    except requests.exceptions.ConnectionError:
        print("❌ Failed to connect to backend server.")
        print("💡 Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

