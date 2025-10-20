"""
AI Assist 설정 디버깅 스크립트
환경변수 로딩 문제를 진단합니다
"""
import sys
from pathlib import Path
import os

# 프로젝트 루트를 Python path에 추가
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

print("="*60)
print("AI Assist Config Debug")
print("="*60)
print()

# 1. 파일 경로 확인
print("1. File Paths:")
print(f"   Script: {Path(__file__).absolute()}")
print(f"   Project Root: {project_root.absolute()}")

env_dev_path = project_root / ".env.dev"
print(f"   .env.dev: {env_dev_path.absolute()}")
print(f"   .env.dev exists: {env_dev_path.exists()}")
print()

# 2. .env.dev 파일 내용 확인
if env_dev_path.exists():
    print("2. .env.dev Contents:")
    with open(env_dev_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        for i, line in enumerate(lines[:10], 1):  # 처음 10줄만
            # API 키는 마스킹
            if 'API_KEY' in line and '=' in line:
                key, value = line.split('=', 1)
                masked_value = value[:10] + '***' + value[-5:] if len(value) > 15 else '***'
                print(f"   Line {i}: {key}={masked_value}")
            else:
                print(f"   Line {i}: {line.rstrip()}")
    print()
else:
    print("2. .env.dev NOT FOUND!")
    print()

# 3. 환경변수 직접 확인 (OS)
print("3. OS Environment Variables:")
env_keys = [
    'AI_ASSIST_GEMINI_API_KEY',
    'AI_ASSIST_GEMINI_MODEL',
    'GEMINI_API_KEY',  # 접두사 없는 버전도 확인
]
for key in env_keys:
    value = os.getenv(key)
    if value:
        masked = value[:10] + '***' + value[-5:] if len(value) > 15 else '***'
        print(f"   {key} = {masked}")
    else:
        print(f"   {key} = NOT SET")
print()

# 4. dotenv 수동 로딩
print("4. Manual dotenv Loading:")
try:
    from dotenv import load_dotenv
    
    # 명시적으로 .env.dev 로딩
    result = load_dotenv(dotenv_path=env_dev_path, override=True)
    print(f"   load_dotenv() result: {result}")
    
    # 다시 환경변수 확인
    print("   After load_dotenv():")
    for key in env_keys:
        value = os.getenv(key)
        if value:
            masked = value[:10] + '***' + value[-5:] if len(value) > 15 else '***'
            print(f"     {key} = {masked}")
        else:
            print(f"     {key} = NOT SET")
except Exception as e:
    print(f"   ERROR: {e}")
print()

# 5. Pydantic Settings 테스트
print("5. Pydantic Settings Test:")
try:
    from src.ai_assist.config import AIAssistConfig
    
    # config.py에서 계산된 경로 확인
    print(f"   config.py location: {Path('src/ai_assist/config.py').absolute()}")
    
    # 설정 로드 시도
    print("   Loading AIAssistConfig...")
    config = AIAssistConfig()
    
    print("   ✅ Config loaded successfully!")
    print(f"   GEMINI_API_KEY: {config.GEMINI_API_KEY[:10]}***{config.GEMINI_API_KEY[-5:]}")
    print(f"   GEMINI_MODEL: {config.GEMINI_MODEL}")
    print(f"   EMBEDDING_MODEL: {config.EMBEDDING_MODEL}")
    
except Exception as e:
    print(f"   ❌ ERROR: {e}")
    print(f"   Error Type: {type(e).__name__}")
    import traceback
    traceback.print_exc()
print()

# 6. Pydantic model_config 확인
print("6. Pydantic model_config:")
try:
    from src.ai_assist.config import AIAssistConfig
    
    config_dict = AIAssistConfig.model_config
    print(f"   env_file: {config_dict.get('env_file')}")
    print(f"   env_prefix: {config_dict.get('env_prefix')}")
    print(f"   env_file_encoding: {config_dict.get('env_file_encoding')}")
    
    # 실제 파일 존재 확인
    env_file_path = Path(config_dict.get('env_file', ''))
    print(f"   Resolved path: {env_file_path}")
    print(f"   File exists: {env_file_path.exists()}")
    
except Exception as e:
    print(f"   ERROR: {e}")
print()

print("="*60)
print("Debug Complete")
print("="*60)

