# Spec Delta

## Purpose

사용자가 홈, 구독 입력 및 상세 화면에서 중요한 정보와 가능한 조작을 일관되게 식별하고 작은 화면에서도 안전하게 이용할 수 있게 한다.

## ADDED Requirements

### Requirement: Present a consistent screen hierarchy
화면은 예상 지출과 기록의 주요 정보를 보조 설명과 구분하고, 저장·수정 등 주요 행동과 취소·삭제 등 보조 행동을 시각적으로 구분하여 SHALL 표시한다.

#### Scenario: View the home and detail screens
- **WHEN** 사용자가 등록된 구독이 있는 홈과 상세를 연다
- **THEN** 홈의 예상 지출과 각 항목, 상세의 이름·금액·상태를 읽을 수 있고 주요 행동을 알아볼 수 있다

### Requirement: Keep exceptional states actionable
시스템은 로딩, 빈 목록, 필터 결과 없음, 읽기 오류, 저장 오류 및 삭제 확인을 SHALL 구별해 보여주고 해당 상태에서 사용 가능한 행동을 식별할 수 있게 한다.

#### Scenario: Save fails
- **WHEN** 사용자가 입력 폼에서 저장에 실패한다
- **THEN** 입력과 오류를 함께 표시하고 다시 저장하거나 취소할 수 있다

### Requirement: Keep controls accessible on small screens
화면은 320px 너비와 긴 이름·큰 금액에서도 중요한 콘텐츠와 조작이 가로 잘림이나 겹침 없이 표시되거나 스크롤로 접근 가능하도록 SHALL 제공한다. 터치 영역은 최소 44px이며 하단 행동에 안전 영역을 확보한다.

#### Scenario: Edit on a small screen
- **WHEN** 작은 화면에서 긴 서비스명과 금액을 입력하고 키보드를 연다
- **THEN** 레이블과 입력값을 식별하고 저장·취소에 스크롤로 접근할 수 있다

### Requirement: Avoid duplicate platform back controls
앱은 토스 플랫폼 뒤로가기와 같은 동작을 하는 자체 뒤로가기 조작을 같은 화면에 동시에 표시하지 않도록 SHALL 구성하고, 내부 화면에서 한 번의 뒤로가기로 이전 맥락에 복귀한다.

#### Scenario: Return from detail in Toss
- **WHEN** 토스 앱의 상세 화면에서 플랫폼 뒤로가기가 표시된다
- **THEN** 같은 화면에 자체 돌아가기 버튼을 중복 노출하지 않고 뒤로가기로 홈에 돌아간다
