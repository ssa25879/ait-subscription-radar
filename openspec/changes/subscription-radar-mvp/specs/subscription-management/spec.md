# Spec Delta

## Purpose

사용자가 직접 입력한 구독을 일관된 조건으로 등록·수정·삭제하고 활성 상태를 관리할 수 있도록 한다. 실제 구독사 계약이나 결제를 변경하지 않고 앱 안의 관리 기록만 변경한다.

## ADDED Requirements

### Requirement: Validate subscription input
시스템은 이름 앞뒤 공백 제거 후 1~50자, 숫자로 입력한 0 이상 정수 KRW 금액, MONTHLY 또는 YEARLY 주기, 실재하는 YYYY-MM-DD 날짜만 저장하도록 SHALL 검증한다. 신규 기본값은 MONTHLY, KST 오늘, ACTIVE이며 동일 이름을 허용한다.

#### Scenario: Valid free subscription and duplicate name
- **WHEN** 기존과 같은 이름으로 금액 0원, 유효한 기준일을 입력하고 저장한다
- **THEN** 별도 식별자를 가진 신규 활성 구독을 등록한다

#### Scenario: Invalid values
- **WHEN** 공백뿐인 이름, 51자 이름, 음수·소수·지수 표기 금액, 존재하지 않는 날짜 중 하나가 입력된다
- **THEN** 저장을 차단하고 해당 입력란 근처에 오류를 표시하며 다른 입력은 보존한다

### Requirement: Create and edit records
시스템은 고유 ID, 이름, 금액, 주기, 기준일, 상태, 생성·수정 시각을 가진 구독을 SHALL 관리한다. 수정은 ID·생성 시각을 유지하며 저장 성공 후 상세와 대시보드에 반영한다.

#### Scenario: Edit billing information
- **WHEN** 금액·주기·기준일을 바꾸고 저장에 성공한다
- **THEN** 같은 ID의 기록이 갱신되고 예상 일정과 합계가 새 정보로 계산된다

#### Scenario: Cancel editing
- **WHEN** 폼에서 저장하지 않고 취소한다
- **THEN** 기존 기록과 합계는 변경되지 않는다

### Requirement: Confirm record deletion
시스템은 삭제 전 확인을 SHALL 제공하고 확인된 항목만 저장 성공 후 제거한다.

#### Scenario: Cancel deletion
- **WHEN** 삭제 확인에서 취소한다
- **THEN** 기록과 집계를 유지한다

#### Scenario: Confirm deletion
- **WHEN** 삭제를 확인하고 저장에 성공한다
- **THEN** 해당 기록을 제거하고 홈으로 돌아가 목록과 합계를 갱신한다

### Requirement: Change subscription status without changing the contract
시스템은 ACTIVE·PAUSED·CANCELED 간 상태 변경을 SHALL 지원한다. 비활성 기록은 보존하며 집계·활성 일정에서 제외한다. 재활성 시 원래 기준일을 유지한다. 앱에서의 상태 변경이 실제 서비스 해지나 결제 취소를 실행하지 않음을 안내한다.

#### Scenario: Pause and resume
- **WHEN** 활성 구독을 일시정지한 뒤 이후 날짜에 다시 활성화한다
- **THEN** 정지 동안 일정과 합계에서 제외하고 재개 시 기존 기준일에서 오늘 이후의 일정을 다시 계산한다

#### Scenario: Cancel record status
- **WHEN** 기록의 상태를 해지로 바꾸고 저장한다
- **THEN** 기록을 삭제하지 않고 실제 구독사 해지는 별도로 해야 함을 안내한다
