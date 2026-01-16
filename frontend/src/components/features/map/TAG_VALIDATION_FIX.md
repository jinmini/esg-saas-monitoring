# ESG 태그 검증 오류 수정 완료

## 문제점

개발 실행 시 13개의 태그 검증 오류 발생:
- Feature 태그: 7개 오류
- Framework 태그: 6개 오류

## 원인

`esg-map.ts`의 `FEATURE_GROUPS`와 `FRAMEWORK_GROUPS`에서 참조하는 태그명이 `esg_companies_global.json`의 metadata에 정의된 태그명과 불일치.

## 해결 방법

### 1. Feature 태그 수정 (frontend/src/constants/esg-map.ts)

#### carbon-net-zero 그룹
- ❌ `SCOPE3_QUANTIFICATION` → ✅ `SCOPE3_CARBON_MANAGEMENT`
- ❌ `NET_ZERO_TARGET_SETTING` → ✅ 제거 (metadata에 없음)
- ❌ `CARBON_REDUCTION` → ✅ 제거 (metadata에 없음)

#### nature-biodiversity-land 그룹
- ❌ `NATURE_ASSESSMENT` → ✅ `NATURE_BIODIVERSITY`
- ❌ `DEFORESTATION_FREE_SUPPLY_CHAIN` → ✅ 제거 (metadata에 없음)

#### sector-specific 그룹
- ❌ `FOOD_TRACEABILITY` → ✅ `FOOD_INDUSTRY_FOCUS`
- ❌ `TEXTILE_SUSTAINABILITY` → ✅ `TEXTILE_FASHION_ECODESIGN`
- ❌ `HOSPITALITY_ESG` → ✅ `HOSPITALITY_DATA_HUB`
- ❌ `OIL_GAS_ESG` → ✅ `OIL_GAS_ENVIRONMENTAL_MANAGEMENT`

### 2. Framework 태그 수정

#### frontend/src/constants/esg-map.ts

##### global-esg-reporting 그룹
- ❌ `IFRS_S1` → ✅ `IFRS_S1_S2` (통합 태그)

##### product-lca-circular 그룹
- ❌ `DPP` → ✅ `DPP_ESPR`

##### real-estate-building 그룹
- ❌ `WELL` → ✅ `WELL_STANDARD`

##### sector-theme-specific 그룹
- ❌ `HCMI` → ✅ `HCMI_HWMI` (통합 태그)
- ❌ `HWMI` → ✅ 제거 (HCMI_HWMI로 통합)

#### frontend/public/data/esg_companies_global.json

frameworks 섹션에 누락된 태그 추가:
```json
"GREEN_BONDS": "Green Bonds & Sustainable Debt"
```

## 검증 결과

### 최종 검증 스크립트 실행 결과
```
✅ 모든 Feature 태그가 올바르게 정의되어 있습니다!
✅ 모든 Framework 태그가 올바르게 정의되어 있습니다!

🎉 완벽합니다! 모든 태그가 올바르게 매핑되어 있습니다.
```

### 통계
- Metadata Features: 688개
- Metadata Frameworks: 146개
- 그룹 참조 Features: 102개
- 그룹 참조 Frameworks: 62개
- **에러: 0개** ✅

## 생성된 유틸리티

### 1. `scripts/validate_json_tags.mjs`
- 회사 데이터에서 실제 사용 중인 태그 분석
- Metadata와 비교하여 누락/불일치 검증
- 그룹 정의 태그 검증

### 2. `scripts/test_esg_validation.mjs`
- esg-map.ts의 그룹 정의와 JSON metadata 일치 확인
- 빠른 검증용 스크립트

## 브라우저 확인

개발 서버: http://localhost:3000/analysis
브라우저 콘솔에서 검증 로그 확인 가능:
```
🔍 ESG Tags Validation Report
✅ PASSED: All tags are valid!
```

## 작업 완료 일시

2025-11-28

## 참고

향후 새로운 태그를 추가할 때는 반드시:
1. `esg_companies_global.json`의 metadata에 먼저 정의
2. `esg-map.ts`의 그룹에 추가
3. `npm run dev` 후 브라우저 콘솔에서 검증 결과 확인

