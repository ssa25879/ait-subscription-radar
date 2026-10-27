# Spec Delta

## Purpose

사용자가 기록한 원래 결제 기준일과 주기로 예상 일정과 비용을 재현 가능하게 계산한다. 실제 청구 내역을 조회하지 않으며 한국 달력 날짜를 기준으로 월말과 윤년에도 일관된 예측을 제공한다.

## ADDED Requirements

### Requirement: Calculate monthly recurrence from the anchor
시스템은 원래 기준일의 일을 유지하고 해당 일이 없는 달만 말일로 보정하여 오늘 또는 이후 최초 월간 예정일을 SHALL 반환한다. 오늘은 Asia/Seoul 달력 날짜이며 기준일보다 이른 회차를 만들지 않는다.

#### Scenario: Month end does not drift
- **WHEN** 기준일이 2026-01-31이고 오늘이 2026-02-01 또는 2026-03-01이다
- **THEN** 각각 2026-02-28과 2026-03-31을 반환한다

#### Scenario: Leap month and day thirty
- **WHEN** 기준일 2024-01-31의 2월 회차와 기준일 2026-01-30의 2월·3월 회차를 계산한다
- **THEN** 각각 2024-02-29, 2026-02-28, 2026-03-30을 사용한다

### Requirement: Calculate annual recurrence from the anchor
시스템은 원래 월·일을 유지하여 오늘 또는 이후 최초 연간 예정일을 SHALL 반환한다. 2월 29일은 평년에 2월 28일로 보정하고 윤년에는 원래 날짜로 돌아온다.

#### Scenario: Leap birthday recurrence
- **WHEN** 기준일이 2024-02-29이고 오늘이 2025-01-01 또는 2028-01-01이다
- **THEN** 각각 2025-02-28과 2028-02-29를 반환한다

### Requirement: Include today and future anchors
시스템은 당일 예정일을 SHALL 포함하고 달력 날짜 차이로 D-day를 계산한다. 미래 기준일은 최초 예정일이며 그 이전 회차는 생성하지 않는다. 실제 결제 완료를 자동 판정하지 않는다.

#### Scenario: Due today and next day
- **WHEN** 월간 기준일이 2026-01-31이고 오늘이 2026-02-28에서 2026-03-01로 바뀐다
- **THEN** 처음에는 2026-02-28·D-day, 이후에는 2026-03-31·D-30을 표시한다

#### Scenario: Future initial payment
- **WHEN** 오늘이 2026-10-27이고 기준일이 2026-12-15이다
- **THEN** 주기와 무관하게 최초 예정일은 2026-12-15이다

#### Scenario: Host timezone differs
- **WHEN** 기기 시간대와 무관하게 현재 시각이 2026-10-27T15:01:00Z이다
- **THEN** 오늘은 KST 2026-10-28로 계산한다

### Requirement: Aggregate active costs and round once
시스템은 ACTIVE만 포함해 월 환산을 월간 합계+연간 합계÷12, 연 환산을 월간 합계×12+연간 합계로 SHALL 산출한다. 표시 시 합계 후 원 단위로 한 번 반올림하고 활성 수를 함께 제공한다.

#### Scenario: Monthly and annual mix
- **WHEN** 월 9,900원과 연 120,000원이 활성이다
- **THEN** 월 환산 19,900원, 연 환산 238,800원, 활성 2개를 표시한다

#### Scenario: Paused and all canceled
- **WHEN** 위 연간 항목을 정지한다가 모든 항목을 해지한다
- **THEN** 정지 시 월 9,900원·연 118,800원·활성 1개, 전부 해지 시 두 합계와 활성 수는 0이다

#### Scenario: Round after summing
- **WHEN** 연 5원인 활성 구독이 2개 있다
- **THEN** 월 환산은 합산한 10÷12를 반올림한 1원이며 개별 반올림 합계 0원을 사용하지 않는다

### Requirement: Refresh derived projections
시스템은 원본 변경, 앱 재진입, 백그라운드 복귀 및 화면을 켜 둔 상태의 KST 날짜 변경 시 현재 날짜로 파생값을 SHALL 갱신한다.

#### Scenario: Stay open over midnight
- **WHEN** 결제 당일 화면을 켜 둔 채 KST 자정을 넘기거나 다음 날 앱에 복귀한다
- **THEN** 이전 D-day를 남기지 않고 다음 회차의 예정일·남은 일수로 갱신한다
