# ESG Report Editor - Document API v2

**업데이트 날짜**: 2025-10-14  
**상태**: ✅ 프론트엔드 타입 시스템과 100% 동기화 완료

---

## 🎯 주요 변경사항

### v1 → v2 마이그레이션

| 항목 | v1 (이전) | v2 (현재) |
|------|-----------|-----------|
| **구조** | Document → Chapter → Section | Document → Section → Block |
| **Section 내용** | `content: TEXT` | `blocks: JSONB[]` |
| **Block 타입** | 없음 | `blockType`: paragraph, heading, list, table, chart, esgMetric, etc. |
| **Inline 노드** | 없음 | `InlineNode` with `id`, `marks`, `link`, `annotation` |
| **GRI 참조** | 없음 | `griReference[]` with framework info |
| **메타데이터** | 없음 | `SectionMetadata` with owner, category, status, attachments |

---

## 📡 API Endpoints

### Base URL
```
http://localhost:8000/api/v1/documents
```

---

## 1️⃣ Documents

### 1.1 문서 생성
```http
POST /api/v1/documents
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "2024년 ESG 보고서",
  "description": "지속가능경영 보고서",
  "is_public": false,
  "is_template": false,
  "sections": [
    {
      "title": "1. 회사 개요",
      "description": "기업 소개",
      "order": 0,
      "blocks": [
        {
          "id": "block-001",
          "blockType": "heading",
          "attributes": {
            "level": 2,
            "align": "left"
          },
          "content": [
            {
              "id": "inline-001",
              "type": "inline",
              "text": "사업 영역",
              "marks": ["bold"]
            }
          ]
        },
        {
          "id": "block-002",
          "blockType": "paragraph",
          "content": [
            {
              "id": "inline-002",
              "type": "inline",
              "text": "우리 회사는 ESG 솔루션을 제공합니다.",
              "marks": []
            }
          ]
        }
      ],
      "griReference": [
        {
          "code": ["GRI 102-1"],
          "framework": "GRI"
        }
      ],
      "metadata": {
        "category": "General",
        "status": "draft",
        "owner": "ESG팀"
      }
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "user_id": null,
  "title": "2024년 ESG 보고서",
  "description": "지속가능경영 보고서",
  "is_public": false,
  "is_template": false,
  "sections": [...],
  "created_at": "2024-10-14T10:00:00Z",
  "updated_at": "2024-10-14T10:00:00Z"
}
```

---

### 1.2 문서 목록 조회
```http
GET /api/v1/documents?is_template=false&skip=0&limit=100
```

**Query Parameters:**
- `user_id` (optional): 특정 사용자 문서만 조회
- `is_template` (optional): true면 템플릿만, false면 일반 문서만
- `is_public` (optional): 공개 여부 필터
- `skip` (default: 0): 페이지네이션 오프셋
- `limit` (default: 100, max: 1000): 페이지 크기

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "user_id": null,
    "title": "2024년 ESG 보고서",
    "description": "...",
    "is_public": false,
    "is_template": false,
    "section_count": 3,
    "created_at": "2024-10-14T10:00:00Z",
    "updated_at": "2024-10-14T10:30:00Z"
  }
]
```

---

### 1.3 문서 상세 조회
```http
GET /api/v1/documents/{document_id}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "user_id": null,
  "title": "2024년 ESG 보고서",
  "description": "지속가능경영 보고서",
  "is_public": false,
  "is_template": false,
  "sections": [
    {
      "id": 1,
      "document_id": 1,
      "title": "1. 회사 개요",
      "description": "기업 소개",
      "order": 0,
      "blocks": [
        {
          "id": "block-001",
          "blockType": "heading",
          "attributes": {
            "level": 2,
            "align": "left"
          },
          "content": [
            {
              "id": "inline-001",
              "type": "inline",
              "text": "사업 영역",
              "marks": ["bold"]
            }
          ]
        }
      ],
      "griReference": [
        {
          "code": ["GRI 102-1"],
          "framework": "GRI"
        }
      ],
      "metadata": {
        "category": "General",
        "status": "draft",
        "owner": "ESG팀"
      },
      "created_at": "2024-10-14T10:00:00Z",
      "updated_at": "2024-10-14T10:00:00Z"
    }
  ],
  "created_at": "2024-10-14T10:00:00Z",
  "updated_at": "2024-10-14T10:30:00Z"
}
```

---

### 1.4 문서 메타데이터 업데이트
```http
PUT /api/v1/documents/{document_id}
Content-Type: application/json
```

**Request Body:** (부분 업데이트 지원)
```json
{
  "title": "수정된 제목",
  "description": "수정된 설명"
}
```

**Response:** `200 OK` - 전체 문서 객체 반환

---

### 1.5 문서 삭제
```http
DELETE /api/v1/documents/{document_id}
```

**Response:** `204 No Content`

---

### 1.6 문서 전체 저장 (Bulk Update)
```http
POST /api/v1/documents/{document_id}/bulk-update
Content-Type: application/json
```

**사용 시나리오**: 프론트엔드에서 "저장" 버튼 클릭 시 전체 문서 구조를 한 번에 전송

**Request Body:**
```json
{
  "title": "2024년 ESG 보고서",
  "description": "업데이트된 설명",
  "sections": [
    {
      "title": "1. 회사 개요",
      "order": 0,
      "blocks": [...]
    },
    {
      "title": "2. 환경",
      "order": 1,
      "blocks": [...]
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Document updated successfully",
  "document": {...}
}
```

---

## 2️⃣ Sections

### 2.1 섹션 생성
```http
POST /api/v1/documents/{document_id}/sections
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "새 섹션",
  "description": "섹션 설명",
  "order": 3,
  "blocks": [],
  "griReference": null,
  "metadata": {
    "category": "General",
    "status": "draft"
  }
}
```

**Response:** `201 Created`

---

### 2.2 섹션 업데이트
```http
PUT /api/v1/documents/sections/{section_id}
Content-Type: application/json
```

**Request Body:** (부분 업데이트 지원)
```json
{
  "title": "수정된 섹션 제목",
  "blocks": [
    {
      "id": "block-new",
      "blockType": "paragraph",
      "content": [...]
    }
  ]
}
```

**Response:** `200 OK`

---

### 2.3 섹션 삭제
```http
DELETE /api/v1/documents/sections/{section_id}
```

**Response:** `204 No Content`

---

## 📦 데이터 타입 정의

### BlockNode
```typescript
{
  id: string;
  blockType: 'paragraph' | 'heading' | 'image' | 'list' | 'quote' | 'table' | 'chart' | 'esgMetric';
  attributes?: {
    align?: 'left' | 'center' | 'right' | 'justify';
    level?: 1 | 2 | 3 | 4 | 5 | 6;  // heading용
    listType?: 'ordered' | 'unordered';  // list용
    width?: string | number;  // image용
    // ... 기타 속성
  };
  content?: InlineNode[];  // 텍스트 블록용
  data?: any;  // table, chart, esgMetric 등의 구조화된 데이터
  children?: ListItemNode[];  // list 블록용
}
```

### InlineNode
```typescript
{
  id: string;
  type: 'inline';
  text: string;
  marks?: ('bold' | 'italic' | 'underline' | 'strike' | 'highlight' | 'code')[];
  link?: {
    url: string;
    title?: string;
    target?: '_blank' | '_self';
  };
  annotation?: {
    id: string;
    authorId: string;
    text: string;
    createdAt: string;
    resolved?: boolean;
  };
}
```

### SectionMetadata
```typescript
{
  owner?: string;
  category?: 'E' | 'S' | 'G' | 'General';
  tags?: string[];
  status?: 'draft' | 'in_review' | 'approved' | 'archived' | 'rejected';
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: 'file' | 'image' | 'pdf';
    uploadedAt: string;
    uploadedBy: string;
  }[];
}
```

### GRIReference
```typescript
{
  code: string[];  // ['GRI 102-1', 'GRI 102-2']
  framework: 'GRI' | 'SASB' | 'TCFD' | 'ISO26000' | 'ESRS';
}
```

---

## 🧪 테스트 가이드

### 1. Seed 데이터 생성
```bash
cd backend
python scripts/seed_esg_document.py
```

### 2. API 서버 실행
```bash
cd backend
uvicorn src.main:app --reload --port 8000
```

### 3. API 문서 확인
```
http://localhost:8000/docs
```

### 4. 테스트 요청
```bash
# 문서 목록 조회
curl http://localhost:8000/api/v1/documents

# 문서 상세 조회 (ID=3)
curl http://localhost:8000/api/v1/documents/3
```

---

## ⚠️ 주의사항

1. **ID 생성**: 프론트엔드에서 Block ID와 Inline ID는 `crypto.randomUUID()` 또는 `nanoid()`로 생성
2. **JSON 검증**: 백엔드는 Pydantic으로 스키마를 검증하므로 타입 불일치 시 `422 Unprocessable Entity` 반환
3. **Section Metadata**: ✅ API에서 `metadata` 필드로 정상 노출됨 (프론트엔드 타입과 100% 일치)
4. **GRI Reference**: `griReference` (camelCase) 사용
5. **Bulk Update**: 전체 sections 배열을 전송하므로 기존 데이터가 모두 교체됨 (주의!)

---

## 🔄 프론트엔드 연동 예시

```typescript
// 문서 불러오기
const response = await fetch(`/api/v1/documents/${documentId}`);
const document: DocumentNode = await response.json();

// Zustand store에 저장
useEditorStore.getState().setDocument(document);

// 문서 저장 (자동저장)
const saveDocument = async () => {
  const document = useEditorStore.getState().document;
  await fetch(`/api/v1/documents/${document.id}/bulk-update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: document.title,
      sections: document.sections
    })
  });
};
```

---

## ✅ 백엔드 체크리스트

- [x] DB Migration 실행 완료
- [x] 프론트엔드 타입과 100% 일치
- [x] Seed 데이터 생성 성공
- [x] API 응답 검증 완료
- [x] **metadata 필드 통일 완료** (컬럼명 이슈 해결)

## 🔜 프론트엔드 작업 대기

- [ ] 프론트엔드 API 연동 테스트
- [ ] 실시간 자동저장 구현 (bulk-update API 활용)
- [ ] 오류 처리 및 재시도 로직

---

**문의사항이나 버그는 백엔드 팀에 제보해주세요!** 🚀

