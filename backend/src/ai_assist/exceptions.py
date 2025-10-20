class AIAssistException(Exception):
    """AI Assist 서비스 관련 커스텀 예외 클래스"""
    def __init__(self, detail: str, status_code: int = 500):
        self.detail = detail
        self.status_code = status_code
        super().__init__(detail)