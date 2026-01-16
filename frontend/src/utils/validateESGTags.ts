/**
 * ESG Tags Validation Utility
 * 
 * 데이터 무결성 검증:
 * 1. 회사 데이터의 모든 태그가 metadata에 정의되어 있는지
 * 2. 모든 metadata 태그가 최소 1개 그룹에 속하는지 (Coverage)
 * 3. 그룹에 정의된 태그가 metadata에 존재하는지 (역방향 검증)
 */

import { FEATURE_GROUPS, FRAMEWORK_GROUPS } from '@/constants/esg-map';
import { 
  ALL_FEATURES, 
  ALL_FRAMEWORKS,
  isValidFeature,
  isValidFramework,
  TAG_STATS,
  type FeatureTag,
  type FrameworkTag
} from '@/types/esg-tags';
import type { ESGMapData, Company } from '@/types/esg-map';

// ============================================
// Types
// ============================================

export interface ValidationError {
  type: 'error' | 'warning';
  category: 'feature' | 'framework' | 'group' | 'company';
  message: string;
  details?: {
    companyId?: string;
    companyName?: string;
    tag?: string;
    groupId?: string;
  };
}

export interface ValidationStats {
  totalFeatures: number;
  totalFrameworks: number;
  coveredFeatures: number;
  coveredFrameworks: number;
  featureCoveragePercent: number;
  frameworkCoveragePercent: number;
  orphanFeatures: string[];
  orphanFrameworks: string[];
  totalCompanies: number;
  validatedCompanies: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  stats: ValidationStats;
  timestamp: string;
}

// ============================================
// Core Validation Functions
// ============================================

/**
 * ESG 데이터 전체 검증
 */
export function validateESGData(data: ESGMapData): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  // 1. 그룹에 매핑된 태그 수집
  const groupedFeatures = new Set<string>();
  const groupedFrameworks = new Set<string>();
  
  FEATURE_GROUPS.forEach(group => {
    group.relatedFeatures.forEach(f => groupedFeatures.add(f));
  });
  
  FRAMEWORK_GROUPS.forEach(group => {
    group.relatedFrameworks.forEach(fw => groupedFrameworks.add(fw));
  });
  
  // 2. Orphan 태그 찾기 (어느 그룹에도 속하지 않은 태그)
  const orphanFeatures = ALL_FEATURES.filter(f => !groupedFeatures.has(f));
  const orphanFrameworks = ALL_FRAMEWORKS.filter(fw => !groupedFrameworks.has(fw));
  
  // Orphan 경고 추가
  if (orphanFeatures.length > 0) {
    warnings.push({
      type: 'warning',
      category: 'feature',
      message: `${orphanFeatures.length} features are not assigned to any group`,
      details: {
        tag: orphanFeatures.slice(0, 10).join(', ') + (orphanFeatures.length > 10 ? '...' : ''),
      },
    });
  }
  
  if (orphanFrameworks.length > 0) {
    warnings.push({
      type: 'warning',
      category: 'framework',
      message: `${orphanFrameworks.length} frameworks are not assigned to any group`,
      details: {
        tag: orphanFrameworks.slice(0, 10).join(', ') + (orphanFrameworks.length > 10 ? '...' : ''),
      },
    });
  }
  
  // 3. 그룹 정의 검증 (그룹에 정의된 태그가 metadata에 존재하는지)
  FEATURE_GROUPS.forEach(group => {
    group.relatedFeatures.forEach(f => {
      if (!isValidFeature(f)) {
        errors.push({
          type: 'error',
          category: 'group',
          message: `Feature group "${group.id}" references undefined feature`,
          details: {
            groupId: group.id,
            tag: f,
          },
        });
      }
    });
  });
  
  FRAMEWORK_GROUPS.forEach(group => {
    group.relatedFrameworks.forEach(fw => {
      if (!isValidFramework(fw)) {
        errors.push({
          type: 'error',
          category: 'group',
          message: `Framework group "${group.id}" references undefined framework`,
          details: {
            groupId: group.id,
            tag: fw,
          },
        });
      }
    });
  });
  
  // 4. 회사 데이터 검증
  let validatedCompanies = 0;
  
  data.companies.forEach(company => {
    let hasError = false;
    
    // Feature 검증
    company.features.forEach(f => {
      if (!isValidFeature(f)) {
        errors.push({
          type: 'error',
          category: 'company',
          message: `Company uses undefined feature`,
          details: {
            companyId: company.id,
            companyName: company.name,
            tag: f,
          },
        });
        hasError = true;
      }
    });
    
    // Framework 검증
    company.frameworks.forEach(fw => {
      if (!isValidFramework(fw)) {
        errors.push({
          type: 'error',
          category: 'company',
          message: `Company uses undefined framework`,
          details: {
            companyId: company.id,
            companyName: company.name,
            tag: fw,
          },
        });
        hasError = true;
      }
    });
    
    if (!hasError) {
      validatedCompanies++;
    }
  });
  
  // 5. 통계 계산
  const stats: ValidationStats = {
    totalFeatures: TAG_STATS.totalFeatures,
    totalFrameworks: TAG_STATS.totalFrameworks,
    coveredFeatures: groupedFeatures.size,
    coveredFrameworks: groupedFrameworks.size,
    featureCoveragePercent: Math.round((groupedFeatures.size / TAG_STATS.totalFeatures) * 100),
    frameworkCoveragePercent: Math.round((groupedFrameworks.size / TAG_STATS.totalFrameworks) * 100),
    orphanFeatures,
    orphanFrameworks,
    totalCompanies: data.companies.length,
    validatedCompanies,
  };
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats,
    timestamp: new Date().toISOString(),
  };
}

// ============================================
// Logging & Display
// ============================================

/**
 * 검증 결과를 콘솔에 출력 (개발 모드용)
 */
export function logValidationResult(result: ValidationResult): void {
  console.group('🔍 ESG Tags Validation Report');
  console.log(`⏰ Timestamp: ${new Date(result.timestamp).toLocaleString()}`);
  console.log(`📊 Metadata Version: ${TAG_STATS.metadataVersion} (Updated: ${TAG_STATS.lastUpdated})`);
  
  // Overall Status
  if (result.isValid) {
    console.log('✅ PASSED: All tags are valid!');
  } else {
    console.error(`❌ FAILED: Found ${result.errors.length} error(s)`);
  }
  
  // Errors
  if (result.errors.length > 0) {
    console.group(`❌ Errors (${result.errors.length})`);
    result.errors.forEach((err, idx) => {
      console.error(`${idx + 1}. [${err.category.toUpperCase()}] ${err.message}`);
      if (err.details) {
        console.error('   Details:', err.details);
      }
    });
    console.groupEnd();
  }
  
  // Warnings
  if (result.warnings.length > 0) {
    console.group(`⚠️  Warnings (${result.warnings.length})`);
    result.warnings.forEach((warn, idx) => {
      console.warn(`${idx + 1}. [${warn.category.toUpperCase()}] ${warn.message}`);
      if (warn.details) {
        console.warn('   Details:', warn.details);
      }
    });
    console.groupEnd();
  }
  
  // Statistics
  console.group('📊 Coverage Statistics');
  console.log(`🏢 Companies: ${result.stats.validatedCompanies}/${result.stats.totalCompanies} validated`);
  console.log(`✨ Features: ${result.stats.coveredFeatures}/${result.stats.totalFeatures} covered (${result.stats.featureCoveragePercent}%)`);
  console.log(`📋 Frameworks: ${result.stats.coveredFrameworks}/${result.stats.totalFrameworks} covered (${result.stats.frameworkCoveragePercent}%)`);
  
  if (result.stats.orphanFeatures.length > 0) {
    console.warn(`   └─ ${result.stats.orphanFeatures.length} orphan features (not in any group)`);
  }
  
  if (result.stats.orphanFrameworks.length > 0) {
    console.warn(`   └─ ${result.stats.orphanFrameworks.length} orphan frameworks (not in any group)`);
  }
  console.groupEnd();
  
  console.groupEnd();
}

/**
 * 개발 모드에서 자동 검증 및 로그 출력
 */
export function validateAndLog(data: ESGMapData): ValidationResult {
  const result = validateESGData(data);
  
  if (process.env.NODE_ENV === 'development') {
    logValidationResult(result);
  }
  
  return result;
}

// ============================================
// Specific Validators
// ============================================

/**
 * 단일 회사 데이터 검증
 */
export function validateCompany(company: Company): {
  isValid: boolean;
  invalidFeatures: string[];
  invalidFrameworks: string[];
} {
  const invalidFeatures = company.features.filter(f => !isValidFeature(f));
  const invalidFrameworks = company.frameworks.filter(fw => !isValidFramework(fw));
  
  return {
    isValid: invalidFeatures.length === 0 && invalidFrameworks.length === 0,
    invalidFeatures,
    invalidFrameworks,
  };
}

/**
 * 그룹 커버리지 분석
 */
export function analyzeGroupCoverage(): {
  features: {
    covered: FeatureTag[];
    uncovered: FeatureTag[];
    coveragePercent: number;
  };
  frameworks: {
    covered: FrameworkTag[];
    uncovered: FrameworkTag[];
    coveragePercent: number;
  };
} {
  const groupedFeatures = new Set<FeatureTag>();
  const groupedFrameworks = new Set<FrameworkTag>();
  
  FEATURE_GROUPS.forEach(group => {
    group.relatedFeatures.forEach(f => {
      if (isValidFeature(f)) {
        groupedFeatures.add(f);
      }
    });
  });
  
  FRAMEWORK_GROUPS.forEach(group => {
    group.relatedFrameworks.forEach(fw => {
      if (isValidFramework(fw)) {
        groupedFrameworks.add(fw);
      }
    });
  });
  
  const coveredFeatures = Array.from(groupedFeatures);
  const uncoveredFeatures = ALL_FEATURES.filter(f => !groupedFeatures.has(f));
  
  const coveredFrameworks = Array.from(groupedFrameworks);
  const uncoveredFrameworks = ALL_FRAMEWORKS.filter(fw => !groupedFrameworks.has(fw));
  
  return {
    features: {
      covered: coveredFeatures,
      uncovered: uncoveredFeatures,
      coveragePercent: Math.round((coveredFeatures.length / ALL_FEATURES.length) * 100),
    },
    frameworks: {
      covered: coveredFrameworks,
      uncovered: uncoveredFrameworks,
      coveragePercent: Math.round((coveredFrameworks.length / ALL_FRAMEWORKS.length) * 100),
    },
  };
}

