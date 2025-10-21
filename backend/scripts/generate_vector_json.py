"""
ESG 표준 데이터를 JSON Vector Store로 변환
JSONL → Embedding → JSON 파일 생성

Usage:
    python backend/scripts/generate_vector_json.py
"""
import json
import logging
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime
import sys
import time

# Add backend src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from ai_assist.esg_mapping.loaders.jsonl_loader import MultiFileJSONLLoader
from ai_assist.core.embeddings_factory import get_embedding_service

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_embedding_text(doc: Dict[str, Any]) -> str:
    """
    문서에서 임베딩용 텍스트 생성
    
    우선순위:
    1. description (영문)
    2. title + keywords
    """
    parts = []
    
    # Title
    if doc.get("title"):
        parts.append(f"Title: {doc['title']}")
    
    # Description (Primary)
    if doc.get("description"):
        parts.append(f"Description: {doc['description']}")
    
    # Keywords
    if doc.get("keywords") and isinstance(doc["keywords"], list):
        parts.append(f"Keywords: {', '.join(doc['keywords'])}")
    
    # Category & Topic
    if doc.get("category"):
        parts.append(f"Category: {doc['category']}")
    if doc.get("topic"):
        parts.append(f"Topic: {doc['topic']}")
    
    return "\n".join(parts)


def generate_vector_json(
    data_dir: Path,
    output_path: Path,
    batch_size: int = 32
) -> Dict[str, Any]:
    """
    JSONL 파일에서 임베딩을 생성하고 JSON으로 저장
    
    Args:
        data_dir: JSONL 파일이 있는 디렉토리
        output_path: 출력 JSON 파일 경로
        batch_size: 배치 크기
    
    Returns:
        생성 통계
    """
    logger.info("=" * 80)
    logger.info("ESG Vector JSON Generator")
    logger.info("=" * 80)
    
    start_time = datetime.now()
    
    # 1. JSONL 파일 로드
    logger.info(f"📂 Loading JSONL files from: {data_dir}")
    loader = MultiFileJSONLLoader(data_dir)
    documents = list(loader.load_all_frameworks())
    
    logger.info(f"✅ Loaded {len(documents)} documents")
    
    # 2. 임베딩 모델 초기화
    logger.info("🤖 Initializing embedding model...")
    embeddings_model = get_embedding_service()
    
    # 모델 정보 로깅
    if hasattr(embeddings_model, 'model_name'):
        model_name = embeddings_model.model_name
    elif hasattr(embeddings_model, '_model_name'):
        model_name = embeddings_model._model_name
    else:
        model_name = "unknown"
    logger.info(f"   Using embedding model: {model_name}")
    
    # 3. 임베딩 생성
    logger.info("🚀 Generating embeddings...")
    
    vector_documents = []
    failed_docs = []
    
    # 빈 텍스트 문서 사전 필터링
    valid_documents = []
    for idx, doc in enumerate(documents):
        # DEBUG: 첫 문서 구조 확인
        if idx == 0:
            logger.info(f"  [DEBUG] Document type: {type(doc)}")
            logger.info(f"  [DEBUG] Document attributes: {dir(doc)}")
            if hasattr(doc, 'metadata'):
                logger.info(f"  [DEBUG] Metadata keys: {list(doc.metadata.keys())[:5]}")
                logger.info(f"  [DEBUG] Metadata sample: {dict(list(doc.metadata.items())[:3])}")
        
        # Document 객체를 딕셔너리로 변환
        doc_dict = doc.to_dict() if hasattr(doc, 'to_dict') else {
            'id': getattr(doc, 'id', None),
            'title': getattr(doc, 'title', None),
            'description': getattr(doc, 'description', None),
            'keywords': getattr(doc, 'keywords', []),
            'category': getattr(doc, 'category', None),
            'topic': getattr(doc, 'topic', None),
        }
        text = create_embedding_text(doc_dict)
        if text and text.strip():
            valid_documents.append(doc)
        else:
            logger.warning(f"  ⚠ Skipping empty document: {doc.metadata.get('id', 'unknown')}")
    
    logger.info(f"  → Valid documents: {len(valid_documents)}/{len(documents)}")
    
    for i in range(0, len(valid_documents), batch_size):
        batch = valid_documents[i:i + batch_size]
        batch_texts = [
            create_embedding_text(
                doc.to_dict() if hasattr(doc, 'to_dict') else {
                    'id': getattr(doc, 'id', None),
                    'title': getattr(doc, 'title', None),
                    'description': getattr(doc, 'description', None),
                    'keywords': getattr(doc, 'keywords', []),
                    'category': getattr(doc, 'category', None),
                    'topic': getattr(doc, 'topic', None),
                }
            ) 
            for doc in batch
        ]
        
        try:
            # 배치 임베딩 생성
            batch_embeddings = embeddings_model.embed_documents(batch_texts, batch_size=batch_size)
            
            # 결과 저장
            for doc, embedding in zip(batch, batch_embeddings):
                vector_doc = {
                    "id": getattr(doc, 'id', f"doc-{i}"),
                    "framework": getattr(doc, 'framework', ""),
                    "category": getattr(doc, 'category', ""),
                    "topic": getattr(doc, 'topic', ""),
                    "title": getattr(doc, 'title', ""),
                    "title_ko": getattr(doc, 'title_ko', ""),
                    "description": getattr(doc, 'description', ""),
                    "description_ko": getattr(doc, 'description_ko', ""),
                    "keywords": getattr(doc, 'keywords', []),
                    "embedding": embedding,  # Already a list
                    "metadata": {
                        "standard_type": getattr(doc, 'standard_type', ""),
                        "document_version": getattr(doc, 'document_version', ""),
                    }
                }
                vector_documents.append(vector_doc)
            
            logger.info(f"  ✓ Batch {i // batch_size + 1}/{(len(valid_documents) + batch_size - 1) // batch_size} completed ({len(batch_embeddings)} embeddings)")
            
            # Gemini API Rate Limit 방지 (Free Tier: 분당 최대 60 RPM)
            # 32 embeddings/batch × 6 batches = 192 embeddings
            # 안전하게 분산: 배치당 15초 대기 (60초 / 4배치 = 15초)
            if model_name == "gemini-embedding-001" and i + batch_size < len(valid_documents):
                logger.info(f"  ⏳ Waiting 15 seconds before next batch to respect rate limits...")
                time.sleep(15)  # 배치당 15초 대기 (1분당 4배치 = 안전)
            
        except Exception as e:
            logger.error(f"  ✗ Batch {i // batch_size + 1} failed: {e}")
            
            # Rate Limit 에러 시 재시도
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                logger.warning("  ⏳ Rate limit detected, waiting 60 seconds and retrying...")
                time.sleep(60)
                
                try:
                    # 재시도
                    logger.info(f"  🔄 Retrying batch {i // batch_size + 1}...")
                    batch_embeddings = embeddings_model.embed_documents(batch_texts, batch_size=batch_size)
                    
                    # 결과 저장
                    for doc, embedding in zip(batch, batch_embeddings):
                        vector_doc = {
                            "id": getattr(doc, 'id', f"doc-{i}"),
                            "framework": getattr(doc, 'framework', ""),
                            "category": getattr(doc, 'category', ""),
                            "topic": getattr(doc, 'topic', ""),
                            "title": getattr(doc, 'title', ""),
                            "title_ko": getattr(doc, 'title_ko', ""),
                            "description": getattr(doc, 'description', ""),
                            "description_ko": getattr(doc, 'description_ko', ""),
                            "keywords": getattr(doc, 'keywords', []),
                            "embedding": embedding,
                            "metadata": {
                                "standard_type": getattr(doc, 'standard_type', ""),
                                "document_version": getattr(doc, 'document_version', ""),
                            }
                        }
                        vector_documents.append(vector_doc)
                    
                    logger.info(f"  ✓ Batch {i // batch_size + 1} completed after retry ({len(batch_embeddings)} embeddings)")
                    
                except Exception as retry_error:
                    logger.error(f"  ✗ Batch {i // batch_size + 1} failed again after retry: {retry_error}")
                    failed_docs.extend(batch)
            else:
                failed_docs.extend(batch)
    
    # 4. JSON 파일 생성
    logger.info(f"💾 Saving to: {output_path}")
    
    output_data = {
        "metadata": {
            "total_documents": len(vector_documents),
            "embedding_model": model_name,  # 실제 사용된 모델 이름
            "embedding_dim": len(vector_documents[0]["embedding"]) if vector_documents else 0,
            "generated_at": datetime.now().isoformat(),
            "source_files": [f.name for f in data_dir.glob("*.jsonl")],
        },
        "documents": vector_documents
    }
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    # 5. 통계 출력
    duration = (datetime.now() - start_time).total_seconds()
    
    logger.info("=" * 80)
    logger.info("📊 Generation Statistics")
    logger.info("=" * 80)
    logger.info(f"Total Documents:  {len(documents)}")
    logger.info(f"Successful:       {len(vector_documents)}")
    logger.info(f"Failed:           {len(failed_docs)}")
    logger.info(f"Duration:         {duration:.2f}s")
    logger.info(f"Avg per doc:      {duration / len(documents):.4f}s")
    logger.info(f"Output file size: {output_path.stat().st_size / 1024 / 1024:.2f} MB")
    logger.info("=" * 80)
    
    return {
        "total": len(documents),
        "successful": len(vector_documents),
        "failed": len(failed_docs),
        "duration_seconds": duration,
        "output_path": str(output_path)
    }


if __name__ == "__main__":
    # 경로 설정
    project_root = Path(__file__).parent.parent
    data_dir = project_root / "src" / "ai_assist" / "esg_mapping" / "data"
    output_path = project_root.parent / "frontend" / "public" / "data" / "esg_vectors.json"
    
    # 실행
    try:
        stats = generate_vector_json(
            data_dir=data_dir,
            output_path=output_path,
            batch_size=32
        )
        
        logger.info("✅ Vector JSON generation completed successfully!")
        logger.info(f"📁 Output: {stats['output_path']}")
        
    except Exception as e:
        logger.error(f"❌ Generation failed: {e}", exc_info=True)
        sys.exit(1)

