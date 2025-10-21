"""
JSONVectorESGMappingService 초기화 테스트
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')  # UTF-8 출력 강제

from src.ai_assist.esg_mapping.json_vector_service import get_json_vector_esg_mapping_service

try:
    print("[TEST] Initializing JSONVectorESGMappingService...")
    service = get_json_vector_esg_mapping_service()
    print("[OK] Service initialized successfully")
    
    print("[TEST] Getting vectorstore status...")
    status = service.get_vectorstore_status()
    print(f"[OK] Status: {status}")
    
except Exception as e:
    print(f"[ERROR] {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()

