"""
JSON Vector Store vs ChromaDB 성능 비교 테스트
"""
import sys
import time
from pathlib import Path
import io

# UTF-8 출력 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Add backend src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from ai_assist.esg_mapping.vectorstore.json_vector_store import get_json_vector_store
from ai_assist.core.embeddings import get_embeddings

def test_json_vector_store():
    """JSON Vector Store 성능 테스트"""
    print("=" * 80)
    print("JSON Vector Store Performance Test")
    print("=" * 80)
    
    # 1. 초기화
    json_path = Path(__file__).parent.parent.parent / "frontend" / "public" / "data" / "esg_vectors.json"
    
    init_start = time.time()
    vector_store = get_json_vector_store(str(json_path))
    init_time = time.time() - init_start
    print(f"✓ Initialization: {init_time:.3f}s")
    
    # 2. 첫 로드 (파일 읽기 + NumPy 변환)
    load_start = time.time()
    vector_store._load_data()
    load_time = time.time() - load_start
    print(f"✓ First Load: {load_time:.3f}s")
    
    # 3. 통계
    stats = vector_store.get_stats()
    print(f"\n📊 Stats:")
    print(f"  - Documents: {stats['total_documents']}")
    print(f"  - Embedding Dim: {stats['embedding_dim']}")
    print(f"  - Memory Size: {stats['memory_size_mb']:.2f} MB")
    print(f"  - File Size: {stats['file_size_mb']:.2f} MB")
    
    # 4. 임베딩 모델 로드
    print(f"\n🤖 Loading embedding model...")
    embed_start = time.time()
    embeddings = get_embeddings()
    embed_time = time.time() - embed_start
    print(f"✓ Embedding Model Loaded: {embed_time:.3f}s")
    
    # 5. 검색 테스트
    test_query = "임직원 1인당 평균 연 40시간의 교육을 제공하며"
    
    print(f"\n🔍 Search Test (query: '{test_query[:30]}...')")
    
    # 임베딩 생성
    query_embed_start = time.time()
    query_embedding = embeddings.embed_query(test_query)
    query_embed_time = time.time() - query_embed_start
    print(f"  - Query Embedding: {query_embed_time:.3f}s")
    
    # 벡터 검색 (5회 평균)
    search_times = []
    for i in range(5):
        search_start = time.time()
        results = vector_store.search(
            query_embedding=query_embedding,
            top_k=5,
            min_similarity=0.0
        )
        search_time = time.time() - search_start
        search_times.append(search_time)
    
    avg_search_time = sum(search_times) / len(search_times)
    print(f"  - Vector Search (avg of 5): {avg_search_time * 1000:.2f}ms")
    print(f"  - Results: {len(results)}")
    
    # 6. 총 응답 시간 (임베딩 + 검색)
    total_time = query_embed_time + avg_search_time
    print(f"\n⚡ Total Response Time: {total_time * 1000:.2f}ms")
    
    # 7. Top 결과 출력
    print(f"\n📋 Top 3 Results:")
    for i, result in enumerate(results[:3], 1):
        print(f"  {i}. {result.id} ({result.framework})")
        print(f"     Similarity: {result.similarity:.4f}")
        print(f"     Title: {result.title[:60]}...")
    
    print("=" * 80)
    
    return {
        "init_time": init_time,
        "load_time": load_time,
        "embed_model_time": embed_time,
        "query_embed_time": query_embed_time,
        "avg_search_time": avg_search_time,
        "total_response_time": total_time,
        "stats": stats
    }


if __name__ == "__main__":
    try:
        results = test_json_vector_store()
        print("\n✅ Performance test completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

