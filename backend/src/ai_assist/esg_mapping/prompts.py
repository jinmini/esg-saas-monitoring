"""
ESG 매핑용 프롬프트 템플릿
"""
from typing import List, Dict, Any, Optional


def build_esg_mapping_prompt(
    user_text: str,
    candidates: List[Dict[str, Any]],
    language: str = "ko",
    max_candidates: Optional[int] = None
) -> str:
    """
    ESG 매핑용 프롬프트 생성
    
    Args:
        user_text: 사용자가 작성한 보고서 텍스트
        candidates: 벡터 검색으로 찾은 후보 표준들
        language: 응답 언어
        max_candidates: 최대 후보 수 (토큰 초과 방지, None이면 동적 조정)
    
    Returns:
        완성된 프롬프트
    """
    
    # Top-K 후보 수 동적 조정 (토큰 초과 방지)
    if max_candidates is None:
        # 사용자 텍스트 길이에 따라 후보 수 조정
        if len(user_text) < 100:
            max_candidates = 5  # 매우 짧은 텍스트
        elif len(user_text) < 300:
            max_candidates = 4  # 짧은 텍스트
        else:
            max_candidates = 3  # 긴 텍스트: 더 적은 후보
    
    # 후보 수 제한
    candidates = candidates[:max_candidates]
    
    # 후보 표준 포맷팅 (간결하게)
    candidates_text = ""
    for i, candidate in enumerate(candidates, 1):
        meta = candidate.get("metadata", {})
        description = meta.get('description', 'N/A')
        # description을 150자로 제한
        if len(description) > 150:
            description = description[:150] + "..."
        
        candidates_text += f"""
[후보 {i}]
ID: {meta.get('id', 'N/A')}
프레임워크: {meta.get('framework', 'N/A')}
제목: {meta.get('title', 'N/A')}
설명: {description}
유사도: {candidate.get('similarity', 0):.3f}
---
"""
    
    if language == "ko":
        prompt = f"""당신은 ESG 보고서 전문가입니다. 사용자가 작성한 보고서 텍스트를 분석하여 관련된 ESG 표준(GRI, SASB, TCFD, ESRS)을 매핑해주세요.

## 사용자 텍스트
{user_text}

## 후보 ESG 표준 (벡터 검색 결과)
{candidates_text}

## 작업
위 후보 표준들 중에서 사용자 텍스트와 가장 관련성이 높은 표준들을 선별하고, 각각에 대해 다음 정보를 제공하세요:

1. **standard_id**: 표준 ID (예: GRI 305-1)
2. **confidence**: 매칭 신뢰도 (0.0 ~ 1.0)
   - 1.0: 완벽히 일치 (텍스트가 해당 표준을 직접 언급하거나 정확히 부합)
   - 0.8-0.9: 강한 연관성 (핵심 개념과 지표가 일치)
   - 0.6-0.7: 중간 연관성 (주제는 관련되나 세부사항 차이)
   - 0.5 이하: 약한 연관성 (일부만 관련)
3. **reasoning**: 왜 이 표준이 매칭되는지 1-2문장으로 설명

**중요 지침:**
- 신뢰도 0.5 이상인 것만 선별하세요
- 최대 3개까지만 반환하세요 (간결성)
- 신뢰도 높은 순으로 정렬하세요
- 억지로 매칭하지 마세요. 관련성이 낮으면 제외하세요
- **응답은 최대 500 토큰 내로 작성하세요** (간결한 reasoning 필수)

## 응답 형식 (JSON)
{{
  "matches": [
    {{
      "standard_id": "GRI 305-1",
      "confidence": 0.85,
      "reasoning": "텍스트에서 Scope 1 직접 배출량을 명시하고 있어 GRI 305-1 (직접 온실가스 배출)에 정확히 부합합니다."
    }}
  ],
  "summary": "이 텍스트는 주로 환경(E) 영역의 온실가스 배출 공시와 관련이 있으며, GRI 305 시리즈 표준이 가장 적합합니다."
}}

**JSON만 반환하세요. 추가 설명은 포함하지 마세요.**
"""
    else:  # English
        prompt = f"""You are an ESG reporting expert. Analyze the user's report text and map it to relevant ESG standards (GRI, SASB, TCFD, ESRS).

## User Text
{user_text}

## Candidate ESG Standards (Vector Search Results)
{candidates_text}

## Task
From the candidate standards above, select the most relevant ones and provide:

1. **standard_id**: Standard ID (e.g., GRI 305-1)
2. **confidence**: Matching confidence (0.0 ~ 1.0)
   - 1.0: Perfect match
   - 0.8-0.9: Strong relevance
   - 0.6-0.7: Moderate relevance
   - 0.5 or below: Weak relevance
3. **reasoning**: Explain why this standard matches (1-2 sentences)

**Important:**
- Only include matches with confidence >= 0.5
- Return at most 5 matches
- Sort by confidence (highest first)
- Don't force matches. Exclude if relevance is low.

## Response Format (JSON)
{{
  "matches": [
    {{
      "standard_id": "GRI 305-1",
      "confidence": 0.85,
      "reasoning": "The text explicitly mentions Scope 1 direct emissions, which directly aligns with GRI 305-1."
    }}
  ],
  "summary": "This text primarily relates to environmental (E) greenhouse gas emissions disclosure, with GRI 305 series being most appropriate."
}}

**Return ONLY JSON. No additional explanation.**
"""
    
    return prompt


def build_reranking_prompt(
    user_text: str,
    candidate_id: str,
    candidate_title: str,
    candidate_description: str,
    language: str = "ko"
) -> str:
    """
    개별 후보 표준에 대한 재순위화 프롬프트
    (옵션: 더 정교한 필터링이 필요할 때 사용)
    
    Args:
        user_text: 사용자 텍스트
        candidate_id: 후보 표준 ID
        candidate_title: 후보 표준 제목
        candidate_description: 후보 표준 설명
        language: 응답 언어
    
    Returns:
        재순위화 프롬프트
    """
    
    if language == "ko":
        prompt = f"""다음 사용자 텍스트가 주어진 ESG 표준과 얼마나 관련이 있는지 평가하세요.

## 사용자 텍스트
{user_text}

## ESG 표준
ID: {candidate_id}
제목: {candidate_title}
설명: {candidate_description}

## 평가
0.0 ~ 1.0 사이의 점수로 관련성을 평가하고, 그 이유를 설명하세요.

응답 형식 (JSON):
{{
  "score": 0.85,
  "reasoning": "텍스트가 이 표준의 핵심 요구사항을 다루고 있습니다..."
}}
"""
    else:
        prompt = f"""Evaluate how relevant the user text is to the given ESG standard.

## User Text
{user_text}

## ESG Standard
ID: {candidate_id}
Title: {candidate_title}
Description: {candidate_description}

## Evaluation
Rate relevance from 0.0 to 1.0 and explain why.

Response format (JSON):
{{
  "score": 0.85,
  "reasoning": "The text addresses the core requirements of this standard..."
}}
"""
    
    return prompt


def build_summarization_prompt(
    user_text: str,
    language: str = "ko"
) -> str:
    """
    텍스트 요약용 프롬프트 (ESG 매핑과 별개)
    
    Args:
        user_text: 요약할 텍스트
        language: 응답 언어
    
    Returns:
        요약 프롬프트
    """
    
    if language == "ko":
        prompt = f"""다음 ESG 보고서 텍스트를 간결하게 요약하세요.

## 텍스트
{user_text}

## 요구사항
- 핵심 내용만 50단어 이내로 요약
- 전문적이고 명확한 톤 유지
- 주요 데이터와 지표 포함

**요약만 반환하세요. JSON이나 추가 형식 없이 텍스트만 작성하세요.**
"""
    else:
        prompt = f"""Summarize the following ESG report text concisely.

## Text
{user_text}

## Requirements
- Summarize in 50 words or less
- Maintain professional and clear tone
- Include key data and metrics

**Return ONLY the summary text. No JSON or additional formatting.**
"""
    
    return prompt


def build_rewrite_prompt(
    user_text: str,
    style: str = "professional",
    language: str = "ko"
) -> str:
    """
    텍스트 재작성용 프롬프트
    
    Args:
        user_text: 재작성할 텍스트
        style: 작성 스타일 (professional, casual, formal, etc.)
        language: 응답 언어
    
    Returns:
        재작성 프롬프트
    """
    
    style_guide = {
        "professional": "전문적이고 객관적인",
        "formal": "격식 있고 공식적인",
        "casual": "친근하고 읽기 쉬운",
        "academic": "학술적이고 분석적인"
    }
    
    style_desc = style_guide.get(style, "전문적이고 객관적인")
    
    if language == "ko":
        prompt = f"""다음 텍스트를 {style_desc} 스타일로 재작성하세요.

## 원본 텍스트
{user_text}

## 요구사항
- {style_desc} 톤 유지
- 핵심 정보와 데이터는 그대로 유지
- 가독성과 명확성 향상
- 문법과 표현 개선

**재작성된 텍스트만 반환하세요. JSON이나 추가 형식 없이 텍스트만 작성하세요.**
"""
    else:
        prompt = f"""Rewrite the following text in a {style} style.

## Original Text
{user_text}

## Requirements
- Maintain {style} tone
- Keep core information and data
- Improve readability and clarity
- Enhance grammar and expression

**Return ONLY the rewritten text. No JSON or additional formatting.**
"""
    
    return prompt

