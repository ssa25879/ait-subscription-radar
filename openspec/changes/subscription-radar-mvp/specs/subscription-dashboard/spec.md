# Spec Delta

## Purpose

등록한 구독의 평균 비용과 다가오는 예상 결제일을 홈에서 이해하고 필요한 기록을 관리 화면으로 연결한다. 활성 일정과 보관 중인 비활성 기록을 구분하여 실제 청구액이나 실제 해지로 오해하지 않게 한다.

## ADDED Requirements

### Requirement: Display estimated summary
홈은 월 환산 예상 구독료·연 환산 예상 구독료·활성 구독 수·가장 가까운 활성 예상 결제를 SHALL 표시한다. 환산 금액은 실제 청구액이 아닌 평균 비교값임을 설명하며 ‘이번 달 청구액’으로 표시하지 않는다.

#### Scenario: No active subscriptions
- **WHEN** 등록 기록은 있지만 모두 일시정지 또는 해지 상태이다
- **THEN** 활성 수와 예상 비용은 0, 가장 가까운 결제는 없음으로 표시하며 보관 기록은 조회할 수 있다

### Requirement: Sort upcoming payments and show imminent dates
홈은 활성 예정 목록을 예상 결제일 오름차순, 같은 날이면 서비스명 한국어 오름차순으로 SHALL 표시한다. 각 항목에 이름·금액·주기·예상일·D-day를 제공하고 오늘부터 7일 이내를 임박 기준으로 명시한다.

#### Scenario: Ties and imminent boundary
- **WHEN** 같은 날짜의 ‘가’와 ‘나’ 및 D-7·D-8 항목이 있다
- **THEN** 같은 날은 ‘가’가 먼저 표시되고 D-day~D-7만 임박으로 표시한다

### Requirement: Filter records without changing totals
홈은 전체·활성·일시정지·해지 필터를 SHALL 제공한다. 기본값은 전체이며 전체에서는 활성 예정 목록과 비활성 보관 기록을 구분한다. 필터는 조회 대상만 바꾸고 활성 전체 기준 요약을 변경하지 않는다. 비활성 예정일은 ‘계산 제외’로 표시한다.

#### Scenario: Paused filter
- **WHEN** 일시정지 필터를 선택한다
- **THEN** 일시정지 기록만 조회되고 날짜는 계산 제외이며 요약 통계는 전체 활성 구독 기준으로 유지된다

### Requirement: Navigate dashboard form and detail
시스템은 홈에서 추가·항목 선택으로 등록/수정 폼과 상세/관리 화면에 SHALL 접근할 수 있게 한다. 저장 성공 후 원래 문맥으로 돌아가 최신 목록과 상세를 표시한다.

#### Scenario: First registration
- **WHEN** 빈 홈에서 ‘첫 구독 추가’를 누르고 필수 항목을 저장한다
- **THEN** 홈에 돌아와 신규 기록과 계산 결과를 표시한다

#### Scenario: Edit from detail
- **WHEN** 상세에서 수정을 열고 저장한다
- **THEN** 갱신된 상세로 돌아오며 홈의 요약·목록에도 동일한 변경이 반영된다

### Requirement: Render empty loading and accessible states
시스템은 로딩·빈 목록·필터 결과 없음·오류를 SHALL 구분한다. 최초 빈 목록은 ‘등록한 구독이 없어요. 첫 구독을 추가해 보세요.’와 등록 CTA를 제공한다. 라이트 화면에서 입력 레이블, 오류 연결, 44px 이상 터치 영역 및 안전 영역을 제공한다.

#### Scenario: Keyboard and small viewport
- **WHEN** 작은 화면에서 긴 서비스명을 입력하고 키보드를 연다
- **THEN** 필수 입력과 저장·취소에 스크롤로 접근 가능하고 CTA와 광고가 겹치지 않는다

#### Scenario: Empty filtered result
- **WHEN** 등록 기록은 있으나 선택 상태의 기록이 없다
- **THEN** 선택 상태의 기록이 없다는 안내를 표시하고 전체 빈 목록으로 오인시키지 않는다
