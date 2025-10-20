"""
Gemini API 직접 테스트 스크립트
응답 구조를 확인합니다
"""
import sys
from pathlib import Path
import os
import logging

# 프로젝트 루트를 Python path에 추가
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

# 로깅 설정
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

from src.ai_assist.config import get_ai_config
from google import genai
from google.genai import types

print("="*60)
print("Gemini API Direct Test")
print("="*60)
print()

# 1. Config 로드
print("1. Loading config...")
config = get_ai_config()
print(f"   ✅ API Key loaded: {config.GEMINI_API_KEY[:10]}***{config.GEMINI_API_KEY[-5:]}")
print(f"   ✅ Model: {config.GEMINI_MODEL}")
print()

# 2. Client 초기화
print("2. Initializing Gemini client...")
try:
    client = genai.Client(api_key=config.GEMINI_API_KEY)
    print("   ✅ Client initialized")
except Exception as e:
    print(f"   ❌ ERROR: {e}")
    sys.exit(1)
print()

# 3. 간단한 텍스트 요청
print("3. Testing simple text generation...")
try:
    simple_prompt = "Hello! Please respond with: 'API is working correctly.'"
    
    response = client.models.generate_content(
        model=config.GEMINI_MODEL,
        contents=simple_prompt,
        config=types.GenerateContentConfig(
            temperature=0.7,
            max_output_tokens=100,
        )
    )
    
    print(f"   Response type: {type(response)}")
    print(f"   Has 'text' attr: {hasattr(response, 'text')}")
    print(f"   Has 'candidates' attr: {hasattr(response, 'candidates')}")
    
    if hasattr(response, 'text'):
        print(f"   response.text: {response.text}")
    
    if hasattr(response, 'candidates') and response.candidates:
        print(f"   Candidates count: {len(response.candidates)}")
        candidate = response.candidates[0]
        
        print(f"   Candidate attributes: {dir(candidate)}")
        
        if hasattr(candidate, 'finish_reason'):
            print(f"   Finish reason: {candidate.finish_reason}")
        
        if hasattr(candidate, 'content'):
            content = candidate.content
            print(f"   Content type: {type(content)}")
            
            if hasattr(content, 'parts'):
                print(f"   Parts count: {len(content.parts)}")
                if content.parts:
                    part = content.parts[0]
                    print(f"   Part attributes: {dir(part)}")
                    if hasattr(part, 'text'):
                        print(f"   ✅ Text: {part.text}")
        
        if hasattr(candidate, 'safety_ratings'):
            print(f"   Safety ratings: {candidate.safety_ratings}")
    
    print()
    
except Exception as e:
    print(f"   ❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    print()

# 4. JSON 응답 요청
print("4. Testing JSON generation...")
try:
    json_prompt = """Please respond with this exact JSON structure:
{
    "status": "success",
    "message": "JSON response is working"
}"""
    
    response = client.models.generate_content(
        model=config.GEMINI_MODEL,
        contents=json_prompt,
        config=types.GenerateContentConfig(
            temperature=0.1,
            max_output_tokens=200,
            response_mime_type="application/json",
        )
    )
    
    if hasattr(response, 'text'):
        print(f"   ✅ JSON Response: {response.text}")
    elif hasattr(response, 'candidates') and response.candidates:
        if hasattr(response.candidates[0].content, 'parts'):
            text = response.candidates[0].content.parts[0].text
            print(f"   ✅ JSON Response: {text}")
    
    print()
    
except Exception as e:
    print(f"   ❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    print()

# 5. Safety Settings 테스트
print("5. Testing with BLOCK_NONE safety settings...")
try:
    safety_settings = [
        types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="BLOCK_NONE"),
        types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="BLOCK_NONE"),
        types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="BLOCK_NONE"),
        types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="BLOCK_NONE"),
    ]
    
    response = client.models.generate_content(
        model=config.GEMINI_MODEL,
        contents="Explain ESG reporting standards.",
        config=types.GenerateContentConfig(
            temperature=0.7,
            max_output_tokens=200,
            safety_settings=safety_settings,
        )
    )
    
    # 상세 디버깅
    print(f"   Response type: {type(response)}")
    print(f"   Has 'text': {hasattr(response, 'text')}")
    print(f"   response.text value: {response.text}")
    print(f"   response.text type: {type(response.text) if hasattr(response, 'text') else 'N/A'}")
    
    if hasattr(response, 'candidates') and response.candidates:
        candidate = response.candidates[0]
        print(f"   Finish reason: {candidate.finish_reason}")
        print(f"   Safety ratings: {candidate.safety_ratings}")
        
        if hasattr(candidate, 'content') and candidate.content:
            if hasattr(candidate.content, 'parts') and candidate.content.parts:
                print(f"   Parts count: {len(candidate.content.parts)}")
                if candidate.content.parts[0]:
                    print(f"   Part[0].text: {candidate.content.parts[0].text}")
    
    # 텍스트 추출 시도
    if hasattr(response, 'text') and response.text:
        print(f"   ✅ Response with BLOCK_NONE: {response.text[:100]}...")
    elif hasattr(response, 'candidates') and response.candidates:
        if hasattr(response.candidates[0], 'content'):
            content = response.candidates[0].content
            if hasattr(content, 'parts') and content.parts:
                if hasattr(content.parts[0], 'text'):
                    text = content.parts[0].text
                    print(f"   ✅ Response with BLOCK_NONE: {text[:100]}...")
    else:
        print("   ⚠️ Could not extract text from response")
    
    print()
    
except Exception as e:
    print(f"   ❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    print()

print("="*60)
print("Test Complete")
print("="*60)

