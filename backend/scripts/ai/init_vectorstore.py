"""
벡터스토어 초기화 스크립트
ESG 표준 데이터를 임베딩하여 ChromaDB에 저장
"""
import sys
from pathlib import Path

# 프로젝트 루트를 Python path에 추가
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from src.ai_assist.esg_mapping.vectorstore import embed_esg_standards
import logging

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def main():
    """벡터스토어 초기화 메인 함수"""
    logger.info("="*60)
    logger.info("ESG Vectorstore Initialization")
    logger.info("="*60)
    
    data_dir = project_root / "src" / "ai_assist" / "esg_mapping" / "data"
    
    if not data_dir.exists():
        logger.error(f"Data directory not found: {data_dir}")
        return
    
    logger.info(f"Data directory: {data_dir}")
    
    # 전체 ESG 표준 임베딩
    try:
        embed_esg_standards(
            data_dir=str(data_dir),
            reset=True  # 기존 데이터 삭제 후 재구축
        )
        
        logger.info("="*60)
        logger.info("✅ Vectorstore initialization complete!")
        logger.info("="*60)
        
    except Exception as e:
        logger.error(f"❌ Initialization failed: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()

