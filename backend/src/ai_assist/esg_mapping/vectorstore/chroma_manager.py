"""
ChromaDB 벡터스토어 관리자
ESG 표준 문서의 임베딩을 저장하고 검색
"""
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime

import chromadb

logger = logging.getLogger(__name__)


class ChromaManager:
    """
    ChromaDB 벡터스토어 매니저 (ChromaDB 1.1.1+ 호환)
    - 임베딩 저장 및 관리
    - 유사도 검색
    - 컬렉션 관리
    """
    
    def __init__(
        self,
        persist_directory: str = "./data/chroma",
        collection_name: str = "esg_standards",
        embedding_function=None
    ):
        """
        Args:
            persist_directory: ChromaDB 영구 저장 경로
            collection_name: 컬렉션 이름
            embedding_function: 커스텀 임베딩 함수 (None이면 기본 사용)
        """
        self.persist_directory = Path(persist_directory)
        self.collection_name = collection_name
        self.embedding_function = embedding_function
        
        # 디렉토리 생성
        self.persist_directory.mkdir(parents=True, exist_ok=True)
        
        # ChromaDB 클라이언트 초기화 (1.1.1+ 새 API)
        logger.info(f"Initializing ChromaDB at: {self.persist_directory}")
        
        # PersistentClient 사용 (Client는 deprecated)
        self.client = chromadb.PersistentClient(
            path=str(self.persist_directory)
        )
        
        # 컬렉션 생성 또는 로드
        self.collection = self._get_or_create_collection()
        
        logger.info(f"✅ ChromaDB initialized: {self.collection.count()} documents")
    
    def _get_or_create_collection(self):
        """컬렉션 가져오기 또는 생성 (ChromaDB 1.1.1+ API)"""
        # get_or_create_collection 사용 (1.1.1+ 권장 방식)
        collection = self.client.get_or_create_collection(
            name=self.collection_name,
            embedding_function=self.embedding_function,
            metadata={
                "created_at": datetime.now().isoformat(),
                "embedding_model": "intfloat/multilingual-e5-base",
                "embedding_dimension": 768,
                "version": "1.0"
            }
        )
        logger.info(f"Collection ready: {self.collection_name}")
        return collection
    
    def add_documents(
        self,
        ids: List[str],
        documents: List[str],
        metadatas: List[Dict[str, Any]],
        embeddings: Optional[List[List[float]]] = None
    ) -> None:
        """
        문서 추가 (배치)
        
        Args:
            ids: 문서 ID 리스트 (unique)
            documents: 문서 텍스트 리스트
            metadatas: 메타데이터 리스트
            embeddings: 미리 계산된 임베딩 (None이면 자동 생성)
        """
        if not ids:
            logger.warning("No documents to add")
            return
        
        logger.info(f"Adding {len(ids)} documents to ChromaDB...")
        
        try:
            if embeddings:
                self.collection.add(
                    ids=ids,
                    documents=documents,
                    metadatas=metadatas,
                    embeddings=embeddings
                )
            else:
                self.collection.add(
                    ids=ids,
                    documents=documents,
                    metadatas=metadatas
                )
            
            logger.info(f"✅ Added {len(ids)} documents (total: {self.collection.count()})")
        except Exception as e:
            logger.error(f"Failed to add documents: {e}")
            raise
    
    def upsert_documents(
        self,
        ids: List[str],
        documents: List[str],
        metadatas: List[Dict[str, Any]],
        embeddings: Optional[List[List[float]]] = None
    ) -> None:
        """
        문서 업데이트 또는 삽입 (배치)
        기존 문서는 업데이트, 없으면 새로 추가
        """
        if not ids:
            logger.warning("No documents to upsert")
            return
        
        logger.info(f"Upserting {len(ids)} documents...")
        
        try:
            if embeddings:
                self.collection.upsert(
                    ids=ids,
                    documents=documents,
                    metadatas=metadatas,
                    embeddings=embeddings
                )
            else:
                self.collection.upsert(
                    ids=ids,
                    documents=documents,
                    metadatas=metadatas
                )
            
            logger.info(f"✅ Upserted {len(ids)} documents")
        except Exception as e:
            logger.error(f"Failed to upsert documents: {e}")
            raise
    
    def search(
        self,
        query_embedding: List[float],
        n_results: int = 5,
        where: Optional[Dict[str, Any]] = None,
        where_document: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        유사도 검색 (벡터 검색)
        
        Args:
            query_embedding: 쿼리 임베딩 벡터
            n_results: 반환할 결과 수
            where: 메타데이터 필터 (예: {"framework": "GRI"})
            where_document: 문서 텍스트 필터
            
        Returns:
            검색 결과 딕셔너리
            {
                "ids": [[id1, id2, ...]],
                "documents": [[doc1, doc2, ...]],
                "metadatas": [[meta1, meta2, ...]],
                "distances": [[dist1, dist2, ...]]
            }
        """
        try:
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                where=where,
                where_document=where_document,
                include=["documents", "metadatas", "distances"]
            )
            
            return results
        except Exception as e:
            logger.error(f"Search failed: {e}")
            raise
    
    def search_by_text(
        self,
        query_text: str,
        n_results: int = 5,
        where: Optional[Dict[str, Any]] = None
    ) -> List[Tuple[str, str, Dict[str, Any], float]]:
        """
        텍스트로 검색 (임베딩 자동 생성)
        
        Args:
            query_text: 검색 쿼리 텍스트
            n_results: 반환할 결과 수
            where: 메타데이터 필터
            
        Returns:
            (id, document, metadata, distance) 튜플 리스트
        """
        try:
            results = self.collection.query(
                query_texts=[query_text],
                n_results=n_results,
                where=where,
                include=["documents", "metadatas", "distances"]
            )
            
            # 결과 파싱 (distance → similarity 변환)
            output = []
            for i in range(len(results["ids"][0])):
                distance = results["distances"][0][i]
                # Cosine distance → similarity (0~1, 높을수록 유사)
                # Chroma는 L2 distance를 반환하므로 1/(1+distance)로 정규화
                similarity = 1.0 / (1.0 + distance)
                
                output.append((
                    results["ids"][0][i],
                    results["documents"][0][i],
                    results["metadatas"][0][i],
                    similarity  # distance 대신 similarity 반환
                ))
            
            return output
        except Exception as e:
            logger.error(f"Text search failed: {e}")
            raise
    
    def get_by_id(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """ID로 문서 조회"""
        try:
            results = self.collection.get(
                ids=[doc_id],
                include=["documents", "metadatas"]
            )
            
            if not results["ids"]:
                return None
            
            return {
                "id": results["ids"][0],
                "document": results["documents"][0],
                "metadata": results["metadatas"][0]
            }
        except Exception as e:
            logger.error(f"Get by ID failed: {e}")
            return None
    
    def delete_documents(self, ids: List[str]) -> None:
        """문서 삭제"""
        if not ids:
            return
        
        try:
            self.collection.delete(ids=ids)
            logger.info(f"Deleted {len(ids)} documents")
        except Exception as e:
            logger.error(f"Delete failed: {e}")
            raise
    
    def count(self) -> int:
        """컬렉션의 문서 수 반환"""
        return self.collection.count()
    
    def reset(self) -> None:
        """컬렉션 초기화 (모든 문서 삭제)"""
        logger.warning(f"Resetting collection: {self.collection_name}")
        
        try:
            self.client.delete_collection(name=self.collection_name)
            self.collection = self._get_or_create_collection()
            logger.info("✅ Collection reset complete")
        except Exception as e:
            logger.error(f"Reset failed: {e}")
            raise
    
    def get_collection_metadata(self) -> Dict[str, Any]:
        """컬렉션 메타데이터 조회"""
        return {
            "name": self.collection_name,
            "count": self.count(),
            "metadata": self.collection.metadata
        }


# 커스텀 임베딩 래퍼 (E5Embeddings와 연동)
class E5EmbeddingFunction:
    """
    ChromaDB용 E5 임베딩 함수 래퍼
    ChromaDB 1.1.1+ EmbeddingFunction 인터페이스 준수
    """
    
    def __init__(self, e5_embeddings):
        """
        Args:
            e5_embeddings: E5Embeddings 인스턴스
        """
        self.e5_embeddings = e5_embeddings
        self._name = "intfloat/multilingual-e5-base"
    
    def __call__(self, input: List[str]) -> List[List[float]]:
        """
        ChromaDB 인터페이스 구현
        
        Args:
            input: 임베딩할 텍스트 리스트
            
        Returns:
            임베딩 벡터 리스트
        """
        return self.e5_embeddings.embed_documents(input)
    
    def name(self) -> str:
        """
        ChromaDB 1.1.1+ 필수 메서드
        임베딩 함수의 고유 이름 반환
        
        Returns:
            임베딩 모델 이름
        """
        return self._name

