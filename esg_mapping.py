import pandas as pd

aents_esg_services_mapping = [
    {
        "Aents 서비스 (Korean Service Name)": "데이터 수집",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Integration",
        "하위 매핑 항목 (Mapped English Sub-item)": "ESG Data Collection",
        "비고 (Notes)": "기존 데이터의 'Data Integration', 'ESG Data Collection'과 연결"
    },
    {
        "Aents 서비스 (Korean Service Name)": "배출량 산정",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Carbon Footprint Analysis",
        "하위 매핑 항목 (Mapped English Sub-item)": "Carbon Accounting",
        "비고 (Notes)": "온실가스 배출량 추적, 탄소 발자국 관리 포함"
    },
    {
        "Aents 서비스 (Korean Service Name)": "Scope 3",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Carbon Footprint Analysis",
        "하위 매핑 항목 (Mapped English Sub-item)": "Scope3 Emissions Tracking",
        "비고 (Notes)": "기존 데이터의 'Scope3 Emissions Tracking'과 직접 매칭"
    },
    {
        "Aents 서비스 (Korean Service Name)": "탄소 리포트 생성",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Reporting",
        "하위 매핑 항목 (Mapped English Sub-item)": "Carbon Reporting",
        "비고 (Notes)": "지속가능성 보고 포함"
    },
    {
        "Aents 서비스 (Korean Service Name)": "제품탄소발자국",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Carbon Footprint Analysis",
        "하위 매핑 항목 (Mapped English Sub-item)": "Product Carbon Footprint (신규 제안)",
        "비고 (Notes)": "기존 'Carbon Footprint Analysis' 내 세부 항목으로 제안"
    },
    {
        "Aents 서비스 (Korean Service Name)": "ESG 데이터 수집",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Integration",
        "하위 매핑 항목 (Mapped English Sub-item)": "ESG Data Collection",
        "비고 (Notes)": "실시간 ESG 데이터 모니터링 포함"
    },
    {
        "Aents 서비스 (Korean Service Name)": "ESG 데이터 관리",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Integration",
        "하위 매핑 항목 (Mapped English Sub-item)": "ESG Data Management (신규 제안)",
        "비고 (Notes)": "'ESG Data Integration' 내 포괄적인 데이터 관리 항목으로 제안 (ESG Data Quality Management 포함)"
    },
    {
        "Aents 서비스 (Korean Service Name)": "기후 물리 리스크 분석",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Risk Management",
        "하위 매핑 항목 (Mapped English Sub-item)": "Climate Risk Assessment",
        "비고 (Notes)": "ESG Scenario Analysis와 연관"
    },
    {
        "Aents 서비스 (Korean Service Name)": "CBAM",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Regulatory Compliance",
        "하위 매핑 항목 (Mapped English Sub-item)": "ESG Regulatory Compliance",
        "비고 (Notes)": "직접적인 규제 준수 및 컨설팅"
    },
    {
        "Aents 서비스 (Korean Service Name)": "KSSB",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Regulatory Compliance",
        "하위 매핑 항목 (Mapped English Sub-item)": "ESG Regulatory Compliance",
        "비고 (Notes)": "ESG Reporting과 연관"
    },
    {
        "Aents 서비스 (Korean Service Name)": "CDP",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Disclosure",
        "하위 매핑 항목 (Mapped English Sub-item)": "ESG Reporting",
        "비고 (Notes)": "Carbon Reporting과 연관, 공시/보고 지원"
    },
    {
        "Aents 서비스 (Korean Service Name)": "탄소 감축",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Sustainability Management",
        "하위 매핑 항목 (Mapped English Sub-item)": "Carbon Neutral Goals Setting",
        "비고 (Notes)": "Energy Efficiency Management, 탄소 감축 전략 포함"
    }
]

greenery_esg_services_mapping = [
    # 1. 넷제로 로드맵 수립
    {
        "Greenery 서비스 (Korean Service Name)": "온실가스 배출량 파악 및 분석",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Carbon Footprint Analysis",
        "하위 매핑 항목 (Mapped English Sub-item)": "Greenhouse Gas Emissions Tracking",
        "비고 (Notes)": "탄소 회계, 탄소 발자국 관리 포함"
    },
    {
        "Greenery 서비스 (Korean Service Name)": "SBTi 기준 시나리오 도출 및 감축 목표 설정",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Sustainability Management",
        "하위 매핑 항목 (Mapped English Sub-item)": "Carbon Neutral Goals Setting",
        "비고 (Notes)": "SBTi는 목표 설정의 구체적인 기준으로, ESG Scenario Analysis와도 연관"
    },
    {
        "Greenery 서비스 (Korean Service Name)": "온실가스 감축전략 수립",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Sustainability Management",
        "하위 매핑 항목 (Mapped English Sub-item)": "Carbon Reduction Strategy (신규 제안)",
        "비고 (Notes)": "기존 'Carbon Neutral Goals Setting'과 연관되나, '전략 수립'을 명시하기 위함"
    },

    # 2. Scope 1,2,3 산정
    {
        "Greenery 서비스 (Korean Service Name)": "Scope 1,2,3 배출량 데이터 수집 및 분석",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Carbon Footprint Analysis",
        "하위 매핑 항목 (Mapped English Sub-item)": "Scope3 Emissions Tracking",
        "비고 (Notes)": "Scope 1,2,3 모두 포함하는 더 포괄적인 항목으로 활용, ESG Data Collection과 연관"
    },
    {
        "Greenery 서비스 (Korean Service Name)": "온실가스 배출량 모니터링 및 검증 시스템 구축",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Verification",
        "하위 매핑 항목 (Mapped English Sub-item)": "Emissions Monitoring & Verification System (신규 제안)",
        "비고 (Notes)": "ESG Performance Tracking 및 ESG Data Integration과 연관될 수 있는 시스템 구축 기능"
    },
    {
        "Greenery 서비스 (Korean Service Name)": "온실가스 배출권거래제, 목표관리제 대응",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Regulatory Compliance",
        "하위 매핑 항목 (Mapped English Sub-item)": "ESG Regulatory Compliance",
        "비고 (Notes)": "특정 국내 규제 대응"
    },

    # 3. LCA
    {
        "Greenery 서비스 (Korean Service Name)": "제품의 전과정 데이터 수집 및 분석",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Integration",
        "하위 매핑 항목 (Mapped English Sub-item)": "Product Life Cycle Data Collection (신규 제안)",
        "비고 (Notes)": "기존 'Data Collection'의 제품 전과정 특화 버전"
    },
    {
        "Greenery 서비스 (Korean Service Name)": "제품 탄소발자국 및 기타 환경영향평가 수행",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Carbon Footprint Analysis",
        "하위 매핑 항목 (Mapped English Sub-item)": "Product Carbon Footprint", # Aents에서 제안된 항목
        "비고 (Notes)": "Impact Measurement, Environmental Impact Assessment 포함"
    },
    {
        "Greenery 서비스 (Korean Service Name)": "제3자 검증 대응 및 EPD(환경성적표지) 인증 지원",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Disclosure",
        "하위 매핑 항목 (Mapped English Sub-item)": "EPD & Certification Support (신규 제안)",
        "비고 (Notes)": "ESG Data Verification과 연관, EPD는 특정 공시/인증"
    },
    {
        "Greenery 서비스 (Korean Service Name)": "LCA 기반 감축 시나리오 설계",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Scenario Analysis",
        "하위 매핑 항목 (Mapped English Sub-item)": "LCA-based Reduction Scenario Design (신규 제안)",
        "비고 (Notes)": "Sustainability Management와 연관"
    },

    # 4. 기후 리스크 관리
    {
        "Greenery 서비스 (Korean Service Name)": "기후 리스크 식별 및 영향 평가",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Risk Management",
        "하위 매핑 항목 (Mapped English Sub-item)": "Climate Risk Assessment",
        "비고 (Notes)": "기존 항목과 직접 매칭"
    },
    {
        "Greenery 서비스 (Korean Service Name)": "TCFD 등에 따른 공시 대응",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Disclosure",
        "하위 매핑 항목 (Mapped English Sub-item)": "TCFD Disclosure Support (신규 제안)",
        "비고 (Notes)": "ESG Reporting, Regulatory Compliance와 연관. TCFD는 특정 공시 프레임워크"
    },
    {
        "Greenery 서비스 (Korean Service Name)": "기후 시나리오 분석 및 리스크 정책 검토",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Scenario Analysis",
        "하위 매핑 항목 (Mapped English Sub-item)": "Climate Scenario Analysis",
        "비고 (Notes)": "ESG Risk Management와 연관"
    },

    # 5. 지속가능 보고서 컨설팅
    {
        "Greenery 서비스 (Korean Service Name)": "ESG 데이터 수집 및 주요 지표(KPI) 설정",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Integration",
        "하위 매핑 항목 (Mapped English Sub-item)": "ESG Data Collection",
        "비고 (Notes)": "ESG Performance Tracking 및 KPI Setting (신규 제안)과 연관"
    },
    {
        "Greenery 서비스 (Korean Service Name)": "GRI(Global Reporting Initiative) 등 국제표준 기준 보고서 작성",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Reporting",
        "하위 매핑 항목 (Mapped English Sub-item)": "Sustainability Reporting",
        "비고 (Notes)": "GRI는 특정 보고 표준으로, ESG Disclosure와 연관"
    },
    {
        "Greenery 서비스 (Korean Service Name)": "지속가능 목표 및 성과의 시각화 및 검증 지원",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Visualization",
        "하위 매핑 항목 (Mapped English Sub-item)": "ESG Performance Tracking",
        "비고 (Notes)": "ESG Data Verification과 연관"
    },

    # 6. CDP 평가 대응
    {
        "Greenery 서비스 (Korean Service Name)": "CDP 설문지 작성",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Disclosure",
        "하위 매핑 항목 (Mapped English Sub-item)": "CDP Disclosure Support (신규 제안)",
        "비고 (Notes)": "ESG Reporting과 연관. 특정 공시 지원"
    },
    {
        "Greenery 서비스 (Korean Service Name)": "개선 전략 수립",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Sustainability Management",
        "하위 매핑 항목 (Mapped English Sub-item)": "Carbon Reduction Strategy (기존 제안)",
        "비고 (Notes)": "탄소 감축 외의 전반적인 개선 전략 포함"
    },
    {
        "Greenery 서비스 (Korean Service Name)": "탄소감축 성과 보고서 작성",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Reporting",
        "하위 매핑 항목 (Mapped English Sub-item)": "Carbon Reporting",
        "비고 (Notes)": "기존 항목과 직접 매칭"
    },

    # 7. 감축 프로젝트 기획
    {
        "Greenery 서비스 (Korean Service Name)": "프로젝트 타당성, 경제성 분석",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Project Management",
        "하위 매핑 항목 (Mapped English Sub-item)": "Project Feasibility & Economic Analysis (신규 제안)",
        "비고 (Notes)": "Impact Measurement와 연관"
    },
    {
        "Greenery 서비스 (Korean Service Name)": "프로젝트 설계 및 실행 로드맵 수립",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Project Management",
        "하위 매핑 항목 (Mapped English Sub-item)": "Project Design & Roadmap Development (신규 제안)",
        "비고 (Notes)": "Sustainability Management와 연관"
    },
    {
        "Greenery 서비스 (Korean Service Name)": "탄소배출권 인증 지원",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Green Finance",
        "하위 매핑 항목 (Mapped English Sub-item)": "Carbon Credit Certification Support (신규 제안)",
        "비고 (Notes)": "Carbon Offsetting과 연관"
    },

    # 주요 플랫폼 시스템 - envion (LCA 시스템)
    {
        "Greenery 서비스 (Korean Service Name)": "envion - 진단/연동 : 목록 분석, 기업 시스템 연동, 데이터 등록",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Integration",
        "하위 매핑 항목 (Mapped English Sub-item)": "Supply Chain Analytics",
        "비고 (Notes)": "데이터 수집 및 시스템 연동 기능"
    },
    {
        "Greenery 서비스 (Korean Service Name)": "envion - LCI DB : ecoinvent, Gabi",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Integration", # 또는 LCA 토픽을 신설할 수도 있음
        "하위 매핑 항목 (Mapped English Sub-item)": "LCI Database Access & Management (신규 제안)",
        "비고 (Notes)": "LCA 시스템의 핵심 데이터베이스 제공/관리 기능"
    },
    {
        "Greenery 서비스 (Korean Service Name)": "envion - 전과정 해석 : 탄소발자국 산정, 고배출 항목 분석",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Carbon Footprint Analysis",
        "하위 매핑 항목 (Mapped English Sub-item)": "Product Carbon Footprint", # LCA 시스템의 핵심 기능
        "비고 (Notes)": "탄소 발자국 산정 및 분석"
    },
    {
        "Greenery 서비스 (Korean Service Name)": "envion - 분석/예측 : 월별 LCA 예측, 재생에너지 및 원료 대체 결과 시뮬레이션",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG AI and Machine Learning",
        "하위 매핑 항목 (Mapped English Sub-item)": "LCA Prediction & Simulation (신규 제안)",
        "비고 (Notes)": "ESG Scenario Analysis, Energy Efficiency Management와 연관. AI 기반 예측"
    },
    {
        "Greenery 서비스 (Korean Service Name)": "envion - 리포트 발행 : LCA 리포트, CBAM 데이터 추출",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Reporting",
        "하위 매핑 항목 (Mapped English Sub-item)": "LCA Reporting (신규 제안)",
        "비고 (Notes)": "Regulatory Compliance (CBAM) 및 EPD 데이터 추출 포함"
    },
    # envion 효과는 간접적인 서비스 설명이므로 직접 매핑하지 않고, 위의 핵심 기능들에 녹여냄.

    # 주요 플랫폼 시스템 - Pople (CARBON CREDIT 인증)
    {
        "Greenery 서비스 (Korean Service Name)": "Pople - 탄소크레딧 인증",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Green Finance",
        "하위 매핑 항목 (Mapped English Sub-item)": "Carbon Credit Certification (신규 제안)",
        "비고 (Notes)": "Carbon Offsetting과 연관"
    },
    {
        "Greenery 서비스 (Korean Service Name)": "Pople - 마켓플레이스에서 크레딧 거래",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Green Finance",
        "하위 매핑 항목 (Mapped English Sub-item)": "Carbon Credit Trading Platform (신규 제안)",
        "비고 (Notes)": "탄소 배출권 거래를 위한 플랫폼 기능"
    }
]

twopmlab_esg_services_mapping = [
    # 1. 그린플로 비즈니스
    {
        "기업 이름": "오후두시랩",
        "서비스 (Korean Service Name)": "글로벌 규제에 맞춰 보고서 생성",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Reporting",
        "하위 매핑 항목 (Mapped English Sub-item)": "Regulatory Reporting",
        "비고 (Notes)": "ESG Regulatory Compliance와 연관"
    },
    {
        "기업 이름": "오후두시랩",
        "서비스 (Korean Service Name)": "비용 기반(EEIO) 모델로 공급망 Scope 3 배출원 관리 및 배출량 산정",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Carbon Footprint Analysis",
        "하위 매핑 항목 (Mapped English Sub-item)": "Scope3 Emissions Tracking",
        "비고 (Notes)": "Supply Chain Transparency와 연관; EEIO 모델은 분석 기법으로 고려"
    },
    {
        "기업 이름": "오후두시랩",
        "서비스 (Korean Service Name)": "외부 데이터 연동으로 데이터 입력 자동화 (인증 기관 데이터 연동)",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Integration",
        "하위 매핑 항목 (Mapped English Sub-item)": "ESG Data Collection",
        "비고 (Notes)": "Real-time ESG Data Monitoring과 연관"
    },
    {
        "기업 이름": "오후두시랩",
        "서비스 (Korean Service Name)": "리포트 아카이브부터 PDF 추출까지 탄소 리포트 관리",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Reporting",
        "하위 매핑 항목 (Mapped English Sub-item)": "Reporting Management & Archiving (신규 제안)",
        "비고 (Notes)": "Carbon Reporting과 연관; 보고서 생성 및 관리 기능"
    },
    {
        "기업 이름": "오후두시랩",
        "서비스 (Korean Service Name)": "다수의 사업장 관리",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Sustainability Management",
        "하위 매핑 항목 (Mapped English Sub-item)": "Energy Efficiency Management", # 또는 Multi-site Management (신규 제안)
        "비고 (Notes)": "여러 사업장의 탄소 및 에너지 관리와 연관"
    },

    # 2. 그린플로 임팩트
    {
        "기업 이름": "오후두시랩",
        "서비스 (Korean Service Name)": "제품 탄소 발자국 측정 서비스",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Carbon Footprint Analysis",
        "하위 매핑 항목 (Mapped English Sub-item)": "Product Carbon Footprint",
        "비고 (Notes)": "기존 제안 항목과 매칭"
    },
    {
        "기업 이름": "오후두시랩",
        "서비스 (Korean Service Name)": "LCA",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Carbon Footprint Analysis", # 또는 Sustainability Management
        "하위 매핑 항목 (Mapped English Sub-item)": "LCA (Life Cycle Assessment) Service (신규 제안)",
        "비고 (Notes)": "LCA가 자주 등장하므로, 자체 하위 항목으로 제안"
    },
    {
        "기업 이름": "오후두시랩",
        "서비스 (Korean Service Name)": "친환경 인증 취득을 위한 자료 제공(녹색인증, B-Corp)",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Disclosure",
        "하위 매핑 항목 (Mapped English Sub-item)": "EPD & Certification Support",
        "비고 (Notes)": "기존 제안 항목과 매칭"
    },
    {
        "기업 이름": "오후두시랩",
        "서비스 (Korean Service Name)": "국제 표준 ISO 14067에 근거한 제품 탄소 발자국 산정 및 기업 신뢰도",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Verification",
        "하위 매핑 항목 (Mapped English Sub-item)": "Product Carbon Footprint Verification (신규 제안)",
        "비고 (Notes)": "ESG Data Verification 및 Product Carbon Footprint와 연관"
    },
    {
        "기업 이름": "오후두시랩",
        "서비스 (Korean Service Name)": "지속가능보고서 제작, 웹/앱 서비스 구축",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Reporting",
        "하위 매핑 항목 (Mapped English Sub-item)": "Sustainability Reporting",
        "비고 (Notes)": "ESG Reporting Automation, ESG Data Visualization과 연관"
    },
    {
        "기업 이름": "오후두시랩",
        "서비스 (Korean Service Name)": "대조 상품과 당사 제품의 탄소발자국 비교 분석 및 마케팅 홍보",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Benchmarking",
        "하위 매핑 항목 (Mapped English Sub-item)": "Product Carbon Footprint Benchmarking (신규 제안)",
        "비고 (Notes)": "ESG Data Visualization, Marketing Support (신규 제안)와 연관"
    },
    {
        "기업 이름": "오후두시랩",
        "서비스 (Korean Service Name)": "데이터 시각화",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Visualization",
        "하위 매핑 항목 (Mapped English Sub-item)": "ESG Performance Tracking", # 또는 Data Visualization (신규 제안)
        "비고 (Notes)": "직접적인 데이터 시각화 기능"
    },
    {
        "기업 이름": "오후두시랩",
        "서비스 (Korean Service Name)": "탄소 중립 프로그램과 연계 (산림 조성, 재생 가능 에너지 프로젝트)",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Sustainability Management",
        "하위 매핑 항목 (Mapped English Sub-item)": "Carbon Offsetting",
        "비고 (Notes)": "Carbon Neutral Goals Setting, ESG Project Management와 연관"
    },

    # 3. 그린플로 시티
    {
        "기업 이름": "오후두시랩",
        "서비스 (Korean Service Name)": "도시 탄소 데이터 모니터링 및 탄소 중립 달성",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Sustainability Management",
        "하위 매핑 항목 (Mapped English Sub-item)": "Smart City Sustainability Management (신규 제안)",
        "비고 (Notes)": "도시 단위의 지속가능성 관리"
    },
    {
        "기업 이름": "오후두시랩",
        "서비스 (Korean Service Name)": "직관적인 모니터링 대시보드로 탄소배출량 확인 및 관리",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Visualization",
        "하위 매핑 항목 (Mapped English Sub-item)": "Carbon Footprint Management",
        "비고 (Notes)": "ESG Performance Tracking과 연관"
    },
    {
        "기업 이름": "오후두시랩",
        "서비스 (Korean Service Name)": "도시 탄소 로드맵 설정",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Sustainability Management",
        "하위 매핑 항목 (Mapped English Sub-item)": "Urban Carbon Roadmap Development (신규 제안)",
        "비고 (Notes)": "Carbon Neutral Goals Setting과 연관"
    },
    {
        "기업 이름": "오후두시랩",
        "서비스 (Korean Service Name)": "친환경 행동 유도 및 탄소 저감효과 달성 (학교, 기관, 기업, 시민)",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Stakeholder Engagement",
        "하위 매핑 항목 (Mapped English Sub-item)": "Behavioral Change & Engagement Programs (신규 제안)",
        "비고 (Notes)": "ESG Training and Education과 연관"
    },

    # 4. 그린플로 프로젝트
    {
        "기업 이름": "오후두시랩",
        "서비스 (Korean Service Name)": "FEMS 솔루션 제작 (탄소 관리에 특화된 경량형 시스템으로 에너지 관리)",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Energy Efficiency Management",
        "하위 매핑 항목 (Mapped English Sub-item)": "FEMS (Facility Energy Management System) Solution (신규 제안)",
        "비고 (Notes)": "실제 사업장 에너지 관리 시스템"
    },
    {
        "기업 이름": "오후두시랩",
        "서비스 (Korean Service Name)": "실제 사업장 대시보드에서 데이터 확인",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Visualization",
        "하위 매핑 항목 (Mapped English Sub-item)": "ESG Performance Tracking",
        "비고 (Notes)": "데이터 시각화 및 성과 추적"
    },
    {
        "기업 이름": "오후두시랩",
        "서비스 (Korean Service Name)": "구역별 에너지 사용량 및 소비 패턴 상세 파악 및 관리",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Energy Efficiency Management",
        "하위 매핑 항목 (Mapped English Sub-item)": "Energy Consumption Monitoring & Optimization (신규 제안)",
        "비고 (Notes)": "세부적인 에너지 관리 기능"
    },
    {
        "기업 이름": "오후두시랩",
        "서비스 (Korean Service Name)": "LCA 솔루션 제작 (산업군에 최적화된 제품 전 과정 탄소 배출량 분석)",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Carbon Footprint Analysis",
        "하위 매핑 항목 (Mapped English Sub-item)": "LCA Platform/Tool (신규 제안)",
        "비고 (Notes)": "LCA 서비스 제공을 위한 플랫폼/도구 개발"
    },
]

livvit_esg_services_mapping = [
    # Tansolution - 1. 측정 (Measurement)
    {
        "기업 이름": "리빗",
        "서비스 (Korean Service Name)": "Scope1, 2부터 Scope 3까지 배출량 측정",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Carbon Footprint Analysis",
        "하위 매핑 항목 (Mapped English Sub-item)": "Scope3 Emissions Tracking", # Scope 1,2도 포함하는 포괄적 항목으로 활용
        "비고 (Notes)": "GHG 프로토콜 방법론 및 최신 배출 계수 활용"
    },
    {
        "기업 이름": "리빗",
        "서비스 (Korean Service Name)": "API 자동화를 통한 데이터 수집",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Integration",
        "하위 매핑 항목 (Mapped English Sub-item)": "ESG Data Collection",
        "비고 (Notes)": "데이터 입력 자동화 기능"
    },

    # Tansolution - 2. 보고 (Reporting)
    {
        "기업 이름": "리빗",
        "서비스 (Korean Service Name)": "지속가능경영 보고서 활용 가능한 자체 보고서 자동 생성",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Reporting",
        "하위 매핑 항목 (Mapped English Sub-item)": "Sustainability Reporting",
        "비고 (Notes)": "ESG Reporting Automation과 연관"
    },
    {
        "기업 이름": "리빗",
        "서비스 (Korean Service Name)": "TCFD, ISSB 등 국제 가이드라인 기본 보고서 자동 생성",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Disclosure",
        "하위 매핑 항목 (Mapped English Sub-item)": "TCFD Disclosure Support", # 그리너리에서 제안된 항목
        "비고 (Notes)": "ISSB Disclosure Support (신규 제안) 필요, Regulatory Compliance와 연관"
    },

    # Tansolution - 3. 감축 (Reduction)
    {
        "기업 이름": "리빗",
        "서비스 (Korean Service Name)": "측정 데이터 활용 과학기반 감축 목표(SBTi) 설정",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Sustainability Management",
        "하위 매핑 항목 (Mapped English Sub-item)": "Carbon Neutral Goals Setting",
        "비고 (Notes)": "SBTi 기준 명시"
    },
    {
        "기업 이름": "리빗",
        "서비스 (Korean Service Name)": "배출량 저감 로드맵 파악, 저감 계획 수립부터 실행까지 지원",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Sustainability Management",
        "하위 매핑 항목 (Mapped English Sub-item)": "Carbon Reduction Strategy", # 그리너리에서 제안된 항목
        "비고 (Notes)": "ESG Project Management와 연관"
    },

    # Tansolution - 4. 상쇄 (Offsetting)
    {
        "기업 이름": "리빗",
        "서비스 (Korean Service Name)": "탄소 상쇄를 통한 기업 경쟁력 확보",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Green Finance",
        "하위 매핑 항목 (Mapped English Sub-item)": "Carbon Offsetting",
        "비고 (Notes)": "기존 항목과 직접 매칭"
    },

    # Tansolution - 주요 특징/상세 서비스
    {
        "기업 이름": "리빗",
        "서비스 (Korean Service Name)": "휴먼에러 없는 데이터 자동 등록으로 관리 시간 단축 (다수 계정 연동)",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Integration",
        "하위 매핑 항목 (Mapped English Sub-item)": "ESG Data Collection",
        "비고 (Notes)": "데이터 품질 관리 및 자동화 강조"
    },
    {
        "기업 이름": "리빗",
        "서비스 (Korean Service Name)": "실시간 사업장별 탄소 배출량 모니터링 및 상세 관리",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Visualization",
        "하위 매핑 항목 (Mapped English Sub-item)": "Carbon Footprint Management",
        "비고 (Notes)": "Real-time ESG Data Monitoring, ESG Performance Tracking 포함"
    },
    {
        "기업 이름": "리빗",
        "서비스 (Korean Service Name)": "배출 현황과 비교 가능한 정확한 감축 목표 관리 (SBTi)",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Sustainability Management",
        "하위 매핑 항목 (Mapped English Sub-item)": "Carbon Neutral Goals Setting",
        "비고 (Notes)": "ESG Benchmarking과 연관"
    },
    {
        "기업 이름": "리빗",
        "서비스 (Korean Service Name)": "탄솔루션 자체 개발 상세 보고서 생성 및 기후공시 역량 내재화",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Reporting",
        "하위 매핑 항목 (Mapped English Sub-item)": "Reporting Management & Archiving", # 오후두시랩에서 제안된 항목
        "비고 (Notes)": "ESG Disclosure, Corporate Governance Reporting과 연관"
    },
    {
        "기업 이름": "리빗",
        "서비스 (Korean Service Name)": "규제 완벽 대응 국제 가이드라인 기반 보고서 (TCFD, ISSB) 자동 생성",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Disclosure",
        "하위 매핑 항목 (Mapped English Sub-item)": "ISSB Disclosure Support (신규 제안)", # 새로운 항목으로 추가
        "비고 (Notes)": "Regulatory Compliance, TCFD Disclosure Support 포함"
    },
    {
        "기업 이름": "리빗",
        "서비스 (Korean Service Name)": "SBTi 감축 목표 설정 로드맵 제공",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Sustainability Management",
        "하위 매핑 항목 (Mapped English Sub-item)": "Carbon Neutral Goals Setting",
        "비고 (Notes)": "기존 항목과 매칭"
    },
    {
        "기업 이름": "리빗",
        "서비스 (Korean Service Name)": "MACC 감축 목표 설정 (한계저감 비용 평가 시뮬레이션)",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Sustainability Management",
        "하위 매핑 항목 (Mapped English Sub-item)": "MACC Analysis & Cost-Effective Reduction (신규 제안)",
        "비고 (Notes)": "ESG Scenario Analysis, Green Finance와 연관"
    },
    {
        "기업 이름": "리빗",
        "서비스 (Korean Service Name)": "외부감축사업 탄소 저감활동 수익화 (인증실적 판매 및 상쇄 배출권 전환)",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Green Finance",
        "하위 매핑 항목 (Mapped English Sub-item)": "Carbon Credit Certification Support", # 그리너리에서 제안된 항목
        "비고 (Notes)": "Carbon Offsetting, Carbon Credit Trading Platform과 연관"
    },

    # Scope3 탄소 배출 관리 앱 - TANSO
    {
        "기업 이름": "리빗",
        "서비스 (Korean Service Name)": "쉽고 빠른 출퇴근 탄소배출량 관리 (TANSO 앱)",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Carbon Footprint Analysis",
        "하위 매핑 항목 (Mapped English Sub-item)": "Commute Emissions Tracking (App-based) (신규 제안)",
        "비고 (Notes)": "Scope3 Emissions Tracking, ESG Data Collection과 연관"
    },
    {
        "기업 이름": "리빗",
        "서비스 (Korean Service Name)": "출퇴근 등록 자동 업무기록 근무유형 탄소달력 (TANSO 앱)",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Integration",
        "하위 매핑 항목 (Mapped English Sub-item)": "App-based Data Logging (신규 제안)",
        "비고 (Notes)": "데이터 수집 및 관리 자동화"
    }
]

kunthech_esg_services_mapping = [
    # PlanESG - 1. ESG 데이터 수집
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "다양한 소스 데이터 조합 탄소 배출량 계산 및 가시화",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Integration",
        "하위 매핑 항목 (Mapped English Sub-item)": "ESG Data Collection",
        "비고 (Notes)": "Carbon Footprint Analysis 및 ESG Data Visualization 포함"
    },
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "Scope 1,2 자동 계산, Scope 3 배출량 산정",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Carbon Footprint Analysis",
        "하위 매핑 항목 (Mapped English Sub-item)": "Scope3 Emissions Tracking", # Scope 1,2도 포괄하는 항목으로 활용
        "비고 (Notes)": "Scope 1,2 Emissions Tracking (신규 제안)으로 더 세분화 가능"
    },

    # PlanESG - 2. 탄소배출량 보고서 자동화
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "간편한 활동데이터 수집 기능 제공",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Integration",
        "하위 매핑 항목 (Mapped English Sub-item)": "ESG Data Collection",
        "비고 (Notes)": "보고서 자동화를 위한 데이터 수집"
    },
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "스마트한 배출량 산정 기능",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Carbon Footprint Analysis",
        "하위 매핑 항목 (Mapped English Sub-item)": "Carbon Accounting",
        "비고 (Notes)": "배출량 산정의 효율성 강조"
    },

    # PlanESG - 3. 엑셀 템플릿 기반 데이터 관리 기능 제공
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "배출시설 엑셀 템플릿 통한 데이터 관리",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Integration",
        "하위 매핑 항목 (Mapped English Sub-item)": "Excel Template-based Data Management (신규 제안)",
        "비고 (Notes)": "ESG Data Management, 대규모 사업장 관리 지원"
    },
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "활동 데이터 연/월별 기입 및 일괄 입력",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Integration",
        "하위 매핑 항목 (Mapped English Sub-item)": "ESG Data Collection",
        "비고 (Notes)": "대량 데이터 입력 효율성 강조"
    },
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "배출계수 및 계산식 엑셀 템플릿 관리",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Carbon Footprint Analysis",
        "하위 매핑 항목 (Mapped English Sub-item)": "Emission Factor Management (신규 제안)",
        "비고 (Notes)": "Methodology & Emission Factor Database와 연관"
    },

    # PlanESG - 4. API를 통한 데이터 소스 연계
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "MES, ERP 연계 탄소 배출량 산정 자동화",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Integration",
        "하위 매핑 항목 (Mapped English Sub-item)": "System Integration (MES, ERP) (신규 제안)",
        "비고 (Notes)": "API를 통한 데이터 연동 강조"
    },

    # PlanESG - 5. 블록체인을 통한 ESG 데이터의 안전한 저장
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "블록체인 기반 ESG 데이터 저장 및 신뢰도 제공",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Verification",
        "하위 매핑 항목 (Mapped English Sub-item)": "Blockchain-based Data Storage (신규 제안)",
        "비고 (Notes)": "ESG Data Quality Management, Data Security (신규 제안)와 연관"
    },

    # PlanESG - 6. 신뢰도 있는 감사 로그 제공
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "신뢰도 있는 감사 로그 제공",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Verification",
        "하위 매핑 항목 (Mapped English Sub-item)": "Audit Trail Management (신규 제안)",
        "비고 (Notes)": "데이터 신뢰성 및 투명성 보장"
    },

    # PlanESG - 상세 기능
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "Scope 1,2 온실가스 배출량 산정 (기업 데이터 활용)",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Carbon Footprint Analysis",
        "하위 매핑 항목 (Mapped English Sub-item)": "Scope1,2 Emissions Tracking (신규 제안)",
        "비고 (Notes)": "기존 Scope3 Emissions Tracking과 구분되는 항목"
    },
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "Scope 3 온실가스 배출량 산정 (15개 카테고리별 산정)",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Carbon Footprint Analysis",
        "하위 매핑 항목 (Mapped English Item)": "Scope3 Emissions Tracking",
        "비고 (Notes)": "구체적인 산정 방법론 제공"
    },
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "국내외 제도 및 표준 인정 방법론 및 배출계수 제공",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Regulatory Compliance",
        "하위 매핑 항목 (Mapped English Sub-item)": "Methodology & Emission Factor Database (신규 제안)",
        "비고 (Notes)": "ESG Regulatory Compliance와 연관"
    },
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "기업 환경 고려 다양한 계산 옵션 (추정 계산식 및 평균값 활용)",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Carbon Footprint Analysis",
        "하위 매핑 항목 (Mapped English Sub-item)": "Estimated Emissions Calculation (신규 제안)",
        "비고 (Notes)": "데이터 미관리 기업 지원"
    },
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "기업 환경에 맞는 최적의 ESG 정보 공개 (K-ESG, GRI 등 표준 적용)",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Disclosure",
        "하위 매핑 항목 (Mapped English Sub-item)": "Sustainability Reporting",
        "비고 (Notes)": "ESG Reporting과 연관"
    },
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "한 번 입력으로 탄소 배출량/지속가능경영/IFRS 등 다양한 보고서 활용",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Reporting",
        "하위 매핑 항목 (Mapped English Sub-item)": "ESG Reporting Automation",
        "비고 (Notes)": "IFRS Disclosure Support (신규 제안) 포함"
    },
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "탄소 배출량 보고서 (CBAM, CDP, TCFD, ISO 14064, GHG Protocol 대응)",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Disclosure",
        "하위 매핑 항목 (Mapped English Sub-item)": "CBAM Disclosure Support", # 기존 항목 활용
        "비고 (Notes)": "CDP Disclosure Support, TCFD Disclosure Support 포함; ISO 14064 Compliance (신규 제안), GHG Protocol Compliance (신규 제안) 필요"
    },
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "매출액 및 생산량 기준 배출량 비교, 주기별 배출량/감축 이력, 원클릭 보고서 다운로드",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG Data Visualization",
        "하위 매핑 항목 (Mapped English Sub-item)": "ESG Performance Tracking",
        "비고 (Notes)": "ESG Benchmarking, Reporting Management & Archiving과 연관"
    },
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "SBTi 기준 목표량과 배출량 모니터링 및 추적",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Sustainability Management",
        "하위 매핑 항목 (Mapped English Sub-item)": "Carbon Neutral Goals Setting",
        "비고 (Notes)": "ESG Performance Tracking과 연관"
    },
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "SBTi 목표관리 시나리오 제공",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Sustainability Management",
        "하위 매핑 항목 (Mapped English Sub-item)": "SBTi Scenario Planning (신규 제안)",
        "비고 (Notes)": "ESG Scenario Analysis와 연관"
    },
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "넷제로 달성을 위한 기업 목표 시나리오 제공",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Sustainability Management",
        "하위 매핑 항목 (Mapped English Sub-item)": "Carbon Neutral Goals Setting",
        "비고 (Notes)": "전반적인 탄소 중립 목표 설정"
    },
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "에너지 온실가스 DB 활용 AI 감축활동 제안",
        "주요 매핑 토픽 (Main Mapped English Topic)": "ESG AI and Machine Learning",
        "하위 매핑 항목 (Mapped English Sub-item)": "AI-driven Reduction Recommendations (신규 제안)",
        "비고 (Notes)": "Energy Efficiency Management, Carbon Reduction Strategy와 연관"
    },
    {
        "기업 이름": "쿤텍",
        "서비스 (Korean Service Name)": "감축활동 MAC (한계 저감비용) 기준, 투자비 회수기간 및 예상 감축량 제공",
        "주요 매핑 토픽 (Main Mapped English Topic)": "Green Finance",
        "하위 매핑 항목 (Mapped English Sub-item)": "MACC Analysis & Cost-Effective Reduction", # 기존 항목 활용
        "비고 (Notes)": "Investment ROI Analysis (신규 제안) 포함"
    },
]

# 데이터 프레임 생성
df = pd.DataFrame(aents_esg_services_mapping)

# 데이터 프레임 출력
print(df)   

df.to_csv('esg_mapping.csv', index=False)
print("CSV 파일이 생성되었습니다.")