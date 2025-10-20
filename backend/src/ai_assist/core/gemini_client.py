"""
Google Gemini API 클라이언트
ESG AI Assist에서 LLM 호출 담당
"""
import logging
import json
import time
import random
from typing import Optional, Dict, Any
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)


class GeminiClient:
    """
    Google Gemini API 래퍼 (google-genai >= 1.0.0)
    - gemini-2.5-flash 모델 사용 (최신 안정 버전)
    - 안전 설정 및 에러 핸들링
    - JSON 응답 파싱
    """
    
    def __init__(
        self,
        api_key: str,
        model_name: str = "gemini-2.5-flash",
        temperature: float = 0.3,
        max_output_tokens: int = 4096
    ):
        """
        Args:
            api_key: Gemini API 키
            model_name: 모델 이름
            temperature: 생성 다양성 (0.0 ~ 1.0)
            max_output_tokens: 최대 출력 토큰 수
        """
        self.api_key = api_key
        self.model_name = model_name
        self.temperature = temperature
        self.max_output_tokens = max_output_tokens
        
        # Gemini 클라이언트 초기화 (새 SDK 방식)
        self.client = genai.Client(api_key=api_key)
        
        # 생성 설정
        self.generation_config = types.GenerateContentConfig(
            temperature=temperature,
            max_output_tokens=max_output_tokens,
            top_p=0.95,
            top_k=40,
            response_mime_type="application/json",  # JSON 응답 강제 (파싱 안정성 향상)
        )
        
        # 안전 설정 (ESG 보고서는 비즈니스 콘텐츠이므로 완화)
        self.safety_settings = [
            types.SafetySetting(
                category="HARM_CATEGORY_HARASSMENT",
                threshold="BLOCK_NONE"
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_HATE_SPEECH",
                threshold="BLOCK_NONE"
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold="BLOCK_NONE"
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold="BLOCK_NONE"
            ),
        ]
        
        logger.info(f"✅ Gemini client initialized: {model_name}")
    
    def generate(
        self,
        prompt: str,
        parse_json: bool = False,
        retry_count: int = 3
    ) -> str:
        """
        텍스트 생성
        
        Args:
            prompt: 입력 프롬프트
            parse_json: True면 JSON 파싱 시도
            retry_count: 실패 시 재시도 횟수
            
        Returns:
            생성된 텍스트 (또는 JSON 문자열)
        """
        for attempt in range(retry_count + 1):
            try:
                # 새 SDK 방식으로 콘텐츠 생성
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=self.temperature,
                        max_output_tokens=self.max_output_tokens,
                        top_p=0.95,
                        top_k=40,
                        response_mime_type="application/json" if parse_json else "text/plain",
                        safety_settings=self.safety_settings,
                    )
                )
                
                # 응답 디버깅 및 finish_reason 체크
                finish_reason = None
                if hasattr(response, 'candidates') and response.candidates:
                    finish_reason = response.candidates[0].finish_reason
                    logger.debug(f"Finish reason: {finish_reason}")
                    
                    # SAFETY로 차단된 경우
                    if 'SAFETY' in str(finish_reason):
                        logger.error("Response blocked by safety filters")
                        logger.error(f"Finish reason: {finish_reason}")
                        if hasattr(response.candidates[0], 'safety_ratings'):
                            logger.error(f"Safety ratings: {response.candidates[0].safety_ratings}")
                        raise ValueError(f"Content blocked by safety filters: {finish_reason}")
                
                # 응답 텍스트 추출 (여러 방법 시도)
                text = None
                
                # 방법 1: response.text (일반적)
                if hasattr(response, 'text') and response.text:
                    text = response.text.strip()
                    logger.debug(f"Extracted text via response.text: {len(text)} chars")
                
                # 방법 2: response.candidates[0].content.parts[0].text
                # (MAX_TOKENS로 중단된 경우 response.text는 None일 수 있음)
                elif hasattr(response, 'candidates') and response.candidates:
                    if hasattr(response.candidates[0], 'content'):
                        content = response.candidates[0].content
                        if hasattr(content, 'parts') and content.parts:
                            if hasattr(content.parts[0], 'text'):
                                text = content.parts[0].text
                                if text:  # None 체크
                                    text = text.strip()
                                    logger.debug(f"Extracted text via candidates: {len(text)} chars")
                
                # MAX_TOKENS로 중단된 경우 경고
                if finish_reason and 'MAX_TOKENS' in str(finish_reason):
                    if text:
                        logger.warning(f"Response truncated due to MAX_TOKENS limit ({self.max_output_tokens})")
                        logger.warning("Consider increasing max_output_tokens for complete responses")
                    else:
                        logger.error(f"Response truncated and empty due to MAX_TOKENS limit")
                        raise ValueError(f"Response truncated by MAX_TOKENS ({self.max_output_tokens})")
                
                if not text:
                    logger.error("Empty response from Gemini API")
                    logger.error(f"Response structure: {response}")
                    raise ValueError("Empty response from API")
                
                # JSON 파싱 시도
                if parse_json:
                    text = self._extract_json(text)
                
                return text
                
            except Exception as e:
                logger.warning(f"Generation attempt {attempt + 1} failed: {e}")
                
                if attempt < retry_count:
                    # 지수 백오프 + Jitter로 재시도
                    backoff = 0.5 * (2 ** attempt) + random.random() * 0.2
                    logger.info(f"Retrying in {backoff:.2f} seconds...")
                    time.sleep(backoff)
                else:
                    logger.error(f"Generation failed after {retry_count + 1} attempts")
                    raise
        
        raise RuntimeError("Generation failed")
    
    def generate_json(self, prompt: str) -> Dict[str, Any]:
        """
        JSON 응답 생성 및 파싱
        
        Args:
            prompt: JSON 형식 요청 프롬프트
            
        Returns:
            파싱된 JSON 딕셔너리
        """
        text = self.generate(prompt, parse_json=True)
        
        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing failed: {e}\nText: {text[:500]}")
            raise ValueError(f"Failed to parse JSON response: {e}")
    
    def _extract_json(self, text: str) -> str:
        """
        텍스트에서 JSON 부분 추출 및 미완성 JSON 보정
        모델이 ```json ... ``` 형식으로 반환할 경우 처리
        MAX_TOKENS로 잘린 경우 자동 보정 시도
        
        Args:
            text: 원본 텍스트
            
        Returns:
            JSON 문자열
        """
        text = text.strip()
        
        # ```json ... ``` 형식 처리
        if "```json" in text:
            start = text.find("```json") + 7
            end = text.find("```", start)
            if end != -1:
                text = text[start:end].strip()
        elif "```" in text:
            # 일반 코드 블록
            start = text.find("```") + 3
            end = text.find("```", start)
            if end != -1:
                text = text[start:end].strip()
        
        # 불필요한 텍스트 제거
        if not text.startswith("{") and not text.startswith("["):
            # JSON 시작 위치 찾기
            json_start = text.find("{")
            if json_start == -1:
                json_start = text.find("[")
            if json_start != -1:
                text = text[json_start:]
        
        # 미완성 JSON 보정 (MAX_TOKENS truncation 대응)
        # 열린 괄호/중괄호가 닫히지 않은 경우 자동 닫기
        open_braces = text.count("{") - text.count("}")
        open_brackets = text.count("[") - text.count("]")
        
        if open_braces > 0 or open_brackets > 0:
            logger.warning(f"Detected incomplete JSON - attempting to fix (braces: {open_braces}, brackets: {open_brackets})")
            
            # 미완성 문자열 제거 (마지막 완전한 항목까지만 유지)
            # "key": "value 형태로 잘린 경우 제거
            if text.count('"') % 2 != 0:
                # 홀수 개의 쌍따옴표 = 미완성 문자열
                last_quote = text.rfind('"')
                # 마지막 쌍따옴표 이전의 완전한 항목까지만 유지
                text = text[:last_quote].rstrip(',').rstrip()
                logger.debug(f"Removed incomplete string at position {last_quote}")
            
            # 괄호 닫기
            if open_brackets > 0:
                text += "]" * open_brackets
            if open_braces > 0:
                text += "}" * open_braces
            
            logger.debug(f"Fixed JSON: {text[:200]}...")
        
        return text
    
    def count_tokens(self, text: str) -> int:
        """
        토큰 수 추정
        
        Args:
            text: 입력 텍스트
            
        Returns:
            대략적인 토큰 수
        """
        try:
            # 새 SDK 방식으로 토큰 카운트
            result = self.client.models.count_tokens(
                model=self.model_name,
                contents=text
            )
            return result.total_tokens
        except Exception as e:
            logger.warning(f"Token counting failed: {e}")
            # Fallback: 대략적 추정 (1 token ≈ 4 chars for English, 1.5 for Korean)
            return len(text) // 3
    
    def get_model_info(self) -> Dict[str, Any]:
        """모델 정보 반환"""
        return {
            "model_name": self.model_name,
            "temperature": self.temperature,
            "max_output_tokens": self.max_output_tokens
        }


# 싱글톤 인스턴스
_gemini_client: Optional[GeminiClient] = None


def get_gemini_client(
    api_key: Optional[str] = None,
    model_name: Optional[str] = None,
    temperature: Optional[float] = None,
    max_output_tokens: Optional[int] = None
) -> GeminiClient:
    """
    Gemini 클라이언트 싱글톤 반환
    
    Args:
        api_key: API 키 (None이면 환경변수에서 로드)
        model_name: 모델 이름 (None이면 기본값)
        temperature: Temperature (None이면 기본값)
        max_output_tokens: 최대 출력 토큰 (None이면 기본값)
    """
    global _gemini_client
    
    if _gemini_client is None:
        if api_key is None:
            import os
            api_key = os.getenv("GEMINI_API_KEY")
            
            if not api_key:
                raise ValueError("GEMINI_API_KEY not found in environment")
        
        _gemini_client = GeminiClient(
            api_key=api_key,
            model_name=model_name or "gemini-2.5-flash",
            temperature=temperature or 0.3,
            max_output_tokens=max_output_tokens or 4096
        )
    
    return _gemini_client


def reset_gemini_client():
    """클라이언트 초기화 (테스트용)"""
    global _gemini_client
    _gemini_client = None

