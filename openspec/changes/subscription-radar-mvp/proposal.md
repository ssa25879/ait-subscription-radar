# Proposal

## Why

여러 서비스에 흩어진 구독의 예상 결제일과 비용을 한곳에서 확인할 수 있도록 한다. 기획서 v1.1의 P0 요구사항을 현재 초기 안내 화면에서 실제 사용 가능한 로컬 저장형 MVP로 발전시킨다.

## What Changes

- 구독 등록·수정·삭제 및 활성·일시정지·해지 상태 관리를 제공한다.
- KRW 정수 금액, 월간·연간 주기, 원래 기준일에 따른 다음 예상 결제일과 월·연 환산 비용을 계산한다.
- 공식 Storage에 원본만 저장하고 재진입 복원, 저장 실패 재시도, 손상 데이터 보호를 제공한다.
- 홈 대시보드, 등록/수정 폼, 상세/관리 화면을 TDS로 구성한다.
- 기본 내비게이션과 뒤로가기를 연결하고 홈 하단 배너 한 곳을 조건부 지원한다.
- 계산·저장·UI 검증과 Android 토스 앱 검증을 분리한다. 콘솔 식별자·광고 그룹 미발급은 외부 대기 상태로 남긴다.
- P1 분류·검색, 계정·서버·동기화·푸시·실제 결제 조회·결제 실행·내보내기는 제외한다.

## Capabilities

### New Capabilities

- `subscription-management`: 입력 검증과 구독 CRUD, 상태 전환.
- `billing-projection`: KST 달력 기준 예상 일정, D-day, 비용 환산.
- `subscription-persistence`: 스키마 검증, 기기 내 저장·복원 및 실패 보호.
- `subscription-dashboard`: 통계, 예정 목록, 상태 필터와 세 화면의 사용자 흐름.
- `toss-platform-integration`: 플랫폼 내비게이션, 조건부 배너, 콘솔 설정 및 실기기 검증 기준.

### Modified Capabilities

없음. 기존 main specs가 없다.

## Impact

- 기준 문서: `구독레이더_Subscription_Radar_개발_기획서.md` v1.1의 3~9장과 11장.
- 기존 React 18·Vite·TDS·SDK 3.8.1 및 devtools 구성을 재사용한다. 초기 안내 화면을 기능 화면으로 교체하고 domain/types/storage/pages/components/ads 모듈을 필요한 만큼 추가한다.
- Vitest 및 저장/UI 회귀 검증에 필요한 최소 테스트 의존성을 추가한다. 서버와 외부 업무 API는 도입하지 않는다.
- 실제 appName은 아직 없으며 현재 `local-development`는 로컬 전용이다. 콘솔 등록·업로드·심사·출시와 Git 커밋/푸시는 이 계획 작성으로 승인되지 않는다.
