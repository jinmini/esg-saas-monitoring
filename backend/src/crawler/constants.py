"""
크롤러 설정 및 Two-Track 전략 상수
"""

# Two-Track 전략 토글
TWO_TRACK_ENABLED: bool = True

# 정밀 트랙 가중치(+0.15)
PRECISION_SCORE_BOOST: float = 0.15

# 정밀 트랙 최소 확보량(건)
PRECISION_MIN_RESULTS: int = 30

# 광역 트랙 페이지 상한(페이지)
BROAD_MAX_PAGES: int = 2

# 네이버 API 페이지당 표시 개수
DISPLAY_PER_PAGE: int = 10

# 기본 검색 전략 (회사용 오버라이드 가능)
DEFAULT_SEARCH_STRATEGY: str = "two_track"


