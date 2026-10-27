# Spec Delta

## Purpose

구독 원본 기록을 같은 기기에서 다시 사용할 수 있도록 보존하고 저장 오류로 사용자 입력이나 기존 기록이 사라지지 않게 한다. 계정이나 서버 동기화 없이 동작하는 저장 범위와 복구 한계를 명확히 한다.

## ADDED Requirements

### Requirement: Restore validated original data
시스템은 기기 내 저장소에서 스키마 버전 1과 구독 원본 목록·수정 시각을 SHALL 복원한다. 저장값이 없을 때만 빈 목록으로 시작하며 예상일·D-day·환산 합계는 저장하지 않는다.

#### Scenario: First visit
- **WHEN** 저장된 값 없이 앱을 연다
- **THEN** 로드 완료 후 빈 목록과 첫 등록 안내를 표시한다

#### Scenario: Relaunch with data
- **WHEN** 유효한 저장 기록이 있는 상태에서 앱을 다시 연다
- **THEN** 원본 입력과 상태를 복원하고 현재 KST 날짜로 예정일과 합계를 다시 계산한다

### Requirement: Commit mutations only after persistence succeeds
시스템은 생성·수정·삭제·상태 변경을 저장 성공 후에만 확정하도록 SHALL 처리한다. 저장 중 중복 변경을 막고 실패 시 기존 확정 데이터와 사용자 입력을 보존한다.

#### Scenario: Failed write and retry
- **WHEN** 저장이 실패한다
- **THEN** 완료 화면으로 이동하지 않고 기존 목록·입력을 유지하며 ‘저장하지 못했어요. 다시 시도해 주세요.’와 재시도를 제공한다

#### Scenario: Repeated save press
- **WHEN** 저장 응답 전에 저장 버튼을 여러 번 누른다
- **THEN** 중복 기록이나 뒤늦은 이전 쓰기에 의한 덮어쓰기가 발생하지 않는다

### Requirement: Protect unreadable and unsupported data
시스템은 로드 실패, JSON 파손, 잘못된 레코드, 지원하지 않는 스키마를 SHALL 구별해 복원 실패로 안내한다. 기존 값을 자동 삭제·초기화·부분 복구·덮어쓰기하지 않으며 정상 로드 전 변경 저장을 막고 재시도를 제공한다.

#### Scenario: Corruption or newer schema
- **WHEN** JSON이 파손되었거나 버전이 2이거나 필수 필드가 잘못된 기록을 읽는다
- **THEN** 복원 오류 안내와 재시도를 표시하고 원본 저장값을 그대로 유지한다

#### Scenario: Read recovers
- **WHEN** 일시적 읽기 실패 후 재시도가 성공한다
- **THEN** 복원된 목록을 표시하고 변경 작업을 다시 허용한다

### Requirement: Explain local data limits and minimize collection
시스템은 기기 변경·토스 앱 삭제·저장소 초기화 시 데이터가 소실될 수 있고 자동 백업·동기화가 없음을 SHALL 안내한다. 카드·계좌·비밀번호를 요구하지 않고 구독 입력을 서버나 광고·이벤트 로그로 전송하지 않는다.

#### Scenario: Read service data notice
- **WHEN** 홈의 데이터 보관 안내를 확인한다
- **THEN** 기기 내 보관과 데이터 소실 가능성, 동기화 없음이 표시된다
