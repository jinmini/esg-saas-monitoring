// import { DocumentNode } from '@/types/editor/document';

// /**
//  * 테스트용 샘플 ESG 보고서 데이터
//  */
// export const mockDocument: DocumentNode = {
//   id: 'doc-001',
//   type: 'document',
//   title: '2024년 지속가능경영 보고서',
  
//   metadata: {
//     version: 1,
//     revisionId: 'rev-001-abc123',
//     status: 'draft',
//     authorId: 'user-001',
//     language: 'ko',
//     createdAt: '2024-01-15T09:00:00Z',
//     updatedAt: '2024-10-10T14:30:00Z',
//     tags: ['ESG', '2024', '지속가능경영'],
//     permissions: [
//       { userId: 'user-001', role: 'admin' },
//       { userId: 'user-002', role: 'editor' },
//       { userId: 'user-003', role: 'viewer' },
//     ],
//   },

//   pageSetup: {
//     format: 'A4',
//     orientation: 'portrait',
//     margin: {
//       top: 25,
//       bottom: 25,
//       left: 20,
//       right: 20,
//     },
//   },

//   sections: [
//     // 섹션 1: 회사 개요
//     {
//       id: 'section-001',
//       type: 'section',
//       title: '1. 회사 개요',
//       description: '기업의 기본 정보와 사업 영역을 소개합니다.',
//       metadata: {
//         category: 'General',
//         status: 'approved',
//         owner: 'ESG팀',
//       },
//       blocks: [
//         {
//           id: 'block-001',
//           blockType: 'heading',
//           attributes: { level: 2, align: 'left' },
//           content: [
//             { id: 'inline-001', type: 'inline', text: '1.1 사업 영역', marks: [] },
//           ],
//         },
//         {
//           id: 'block-002',
//           blockType: 'paragraph',
//           attributes: { align: 'left' },
//           content: [
//             { id: 'inline-002', type: 'inline', text: '우리 회사는 ', marks: [] },
//             { id: 'inline-003', type: 'inline', text: '지속가능한 에너지 솔루션', marks: ['bold'] },
//             { id: 'inline-003', type: 'inline', text: '을 제공하는 글로벌 선도 기업입니다. 주요 사업 영역은 다음과 같습니다:', marks: [] },
//           ],
//         },
//         {
//           id: 'block-003',
//           blockType: 'list',
//           attributes: { level: 1, listType: 'unordered' },
//           children: [
//             { id: 'inline-004', type: 'listItem', content: [{ id: 'inline-004', type: 'inline', text: '태양광 발전 시스템 제조 및 설치', marks: [] }] },
//           ],
//         },
//         {
//           id: 'block-004',
//           blockType: 'list',
//           attributes: { level: 1, listType: 'unordered' },
//           children: [
//             { id: 'inline-005', type: 'listItem', content: [{ id: 'inline-005', type: 'inline', text: 'ESS(에너지 저장 시스템) 개발', marks: [] }] },
//           ],
//         },
//         {
//           id: 'block-005',
//           blockType: 'list',
//           attributes: { level: 1, listType: 'unordered' },
//           children: [
//             { id: 'inline-006', type: 'listItem', content: [{ id: 'inline-006', type: 'inline', text: '스마트 그리드 솔루션 제공', marks: [] }] },
//           ],
//         },
//       ],
//     },

//     // 섹션 2: 환경 (Environmental)
//     {
//       id: 'section-002',
//       type: 'section',
//       title: '2. 환경 (Environmental)',
//       description: '환경 관련 성과와 목표를 담고 있습니다.',
//       griReference: [{ code: ['GRI 305', 'GRI 306'], framework: 'GRI' }],
//       metadata: {
//         category: 'E',
//         status: 'in_review',
//         owner: '환경안전팀',
//       },
//       blocks: [
//         {
//           id: 'block-006',
//           blockType: 'heading',
//           attributes: { level: 2, align: 'left' },
//           content: [
//             { id: 'inline-007', type: 'inline', text: '2.1 온실가스 배출 관리', marks: [] },
//           ],
//         },
//         {
//           id: 'block-007',
//           blockType: 'paragraph',
//           attributes: { align: 'left' },
//           content: [
//             { id: 'inline-008', type: 'inline', text: '2024년 당사는 ', marks: [] },
//             { id: 'inline-009', type: 'inline', text: 'Scope 1, 2 온실가스 배출량을 전년 대비 15% 감축', marks: ['bold', 'highlight'] },
//             { id: 'inline-010', type: 'inline', text: '하는 성과를 달성했습니다. 이는 다음과 같은 노력의 결과입니다:', marks: [] },
//           ],
//         },
//         {
//           id: 'block-008',
//           blockType: 'quote',
//           attributes: { align: 'left' },
//           content: [
//             { id: 'inline-010', type: 'inline', text: '"탄소중립은 선택이 아닌 필수입니다. 우리는 2030년까지 RE100을 달성하겠습니다."', marks: ['italic'] },
//           ],
//         },
//         {
//           id: 'block-009',
//           blockType: 'paragraph',
//           attributes: { align: 'right' },
//           content: [
//             { id: 'inline-011', type: 'inline', text: '- 김철수 대표이사', marks: [] },
//           ],
//         },
//       ],
//     },

//     // 섹션 3: 사회 (Social)
//     {
//       id: 'section-003',
//       type: 'section',
//       title: '3. 사회 (Social)',
//       description: '임직원, 지역사회와의 관계 및 사회공헌 활동',
//       griReference: [{ code: ['GRI 401', 'GRI 404'], framework: 'GRI' }],
//       metadata: {
//         category: 'S',
//         status: 'draft',
//         owner: '인사팀',
//       },
//       blocks: [
//         {
//           id: 'block-010',
//           blockType: 'heading',
//           attributes: { level: 2, align: 'left' },
//           content: [
//             { id: 'inline-012', type: 'inline', text: '3.1 인재 개발 및 교육', marks: [] },
//           ],
//         },
//         {
//           id: 'block-011',
//           blockType: 'paragraph',
//           attributes: { align: 'left' },
//           content: [
//             { id: 'inline-013', type: 'inline', text: '임직원 1인당 평균 ', marks: [] },
//             { id: 'inline-014', type: 'inline', text: '연 40시간의 교육', marks: ['bold'] },
//             { id: 'inline-015', type: 'inline', text: '을 제공하며, 리더십 개발 프로그램, 기술 역량 강화 워크숍 등 다양한 교육 기회를 마련하고 있습니다.', marks: [] },
//           ],
//         },
//         {
//           id: 'block-012',
//           blockType: 'heading',
//           attributes: { level: 2, align: 'left' },
//           content: [
//             { id: 'inline-016', type: 'inline', text: '3.2 지역사회 공헌', marks: [] },
//           ],
//         },
//         {
//           id: 'block-013',
//           blockType: 'paragraph',
//           attributes: { align: 'left' },
//           content: [
//            { id: 'inline-017', type: 'inline', text: '연간 매출의 ', marks: [] },
//             { id: 'inline-018', type: 'inline', text: '1%를 사회공헌 활동에 투자', marks: ['bold', 'underline'] },
//             { id: 'inline-018', type: 'inline', text: '하며, 취약계층 에너지 지원, 청소년 환경교육 등을 진행하고 있습니다.', marks: [] },
//           ],
//         },
//       ],
//     },
//   ],
// };

// /**
//  * 빈 문서 템플릿 생성 함수
//  */
// export function createEmptyDocument(): DocumentNode {
//   return {
//     id: `doc-${Date.now()}`,
//     type: 'document',
//     title: '새 문서',
//     metadata: {
//       version: 1,
//       revisionId: `rev-${Date.now()}`,
//       status: 'draft',
//       authorId: 'current-user',
//       language: 'ko',
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     },
//     pageSetup: {
//       format: 'A4',
//       orientation: 'portrait',
//       margin: { top: 25, bottom: 25, left: 20, right: 20 },
//     },
//     sections: [
//       {
//         id: 'section-new',
//         type: 'section',
//         title: '새 섹션',
//         blocks: [
//           {
//             id: 'block-new',
//             blockType: 'paragraph',
//             content: [{ id: 'inline-001', type: 'inline', text: '여기에 내용을 입력하세요...', marks: [] }],
//           },
//         ],
//       },
//     ],
//   };
// }

