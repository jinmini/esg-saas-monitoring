/**
 * ESG Tags Type Definitions
 * 
 * 📌 Single Source of Truth: esg_companies_global.json의 metadata
 * 
 * 이 파일은 JSON 데이터에서 타입을 자동으로 추출하여,
 * 하드코딩된 문자열 오타와 누락을 방지합니다.
 */

// Next.js public 폴더는 루트 경로로 접근
import metadataImport from '@/../public/data/esg_companies_global.json';

// JSON import 타입 단언
const metadata = metadataImport.metadata;

// ============================================
// Feature Tags (기능 태그)
// ============================================

/**
 * Feature Tag 타입
 * metadata.features의 모든 키를 Union 타입으로 추출
 * 
 * @example
 * const tag: FeatureTag = 'CARBON_ACCOUNTING'; // ✅ OK
 * const invalid: FeatureTag = 'INVALID_TAG'; // ❌ Type Error
 */
export type FeatureTag = keyof typeof metadata.features;

/**
 * 모든 Feature 태그 배열 (런타임에서 사용)
 * 
 * @example
 * ALL_FEATURES.forEach(tag => console.log(tag));
 */
export const ALL_FEATURES = Object.keys(metadata.features) as FeatureTag[];

/**
 * Feature 태그 설명 가져오기
 */
export function getFeatureDescription(tag: FeatureTag): string {
  return metadata.features[tag];
}

/**
 * Feature 태그 검증 (런타임)
 */
export function isValidFeature(tag: string): tag is Extract<FeatureTag, string> {
  return tag in metadata.features;
}

// ============================================
// Framework Tags (프레임워크 태그)
// ============================================

/**
 * Framework Tag 타입
 * metadata.frameworks의 모든 키를 Union 타입으로 추출
 * 
 * @example
 * const tag: FrameworkTag = 'CSRD'; // ✅ OK
 * const invalid: FrameworkTag = 'INVALID_FW'; // ❌ Type Error
 */
export type FrameworkTag = keyof typeof metadata.frameworks;

/**
 * 모든 Framework 태그 배열 (런타임에서 사용)
 */
export const ALL_FRAMEWORKS = Object.keys(metadata.frameworks) as FrameworkTag[];

/**
 * Framework 태그 설명 가져오기
 */
export function getFrameworkDescription(tag: FrameworkTag): string {
  return metadata.frameworks[tag];
}

/**
 * Framework 태그 검증 (런타임)
 */
export function isValidFramework(tag: string): tag is Extract<FrameworkTag, string> {
  return tag in metadata.frameworks;
}

// ============================================
// Type Guards & Utilities
// ============================================

/**
 * 태그 배열 검증
 */
export function validateFeatureTags(tags: string[]): {
  valid: FeatureTag[];
  invalid: string[];
} {
  const valid: FeatureTag[] = [];
  const invalid: string[] = [];
  
  tags.forEach(tag => {
    if (isValidFeature(tag)) {
      valid.push(tag);
    } else {
      invalid.push(tag);
    }
  });
  
  return { valid, invalid };
}

/**
 * 프레임워크 배열 검증
 */
export function validateFrameworkTags(tags: string[]): {
  valid: FrameworkTag[];
  invalid: string[];
} {
  const valid: FrameworkTag[] = [];
  const invalid: string[] = [];
  
  tags.forEach(tag => {
    if (isValidFramework(tag)) {
      valid.push(tag);
    } else {
      invalid.push(tag);
    }
  });
  
  return { valid, invalid };
}

// ============================================
// Statistics
// ============================================

/**
 * 메타데이터 통계
 */
export const TAG_STATS = {
  totalFeatures: ALL_FEATURES.length,
  totalFrameworks: ALL_FRAMEWORKS.length,
  metadataVersion: metadata.version,
  lastUpdated: metadata.lastUpdated,
} as const;

// ============================================
// Type Exports for Constants
// ============================================

/**
 * FEATURE_GROUPS와 FRAMEWORK_GROUPS에서 사용할 수 있도록 타입 export
 */
export type { FeatureTag as Feature, FrameworkTag as Framework };

