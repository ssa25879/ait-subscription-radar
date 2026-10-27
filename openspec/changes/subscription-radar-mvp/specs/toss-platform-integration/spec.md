# Spec Delta

## Purpose

앱인토스 안에서 기본 내비게이션과 화면 수명주기가 자연스럽게 작동하고 광고가 구독 관리를 방해하지 않도록 한다. 콘솔에서 확인해야 하는 설정과 실제 기기에서만 확인 가능한 동작을 로컬 개발 결과와 구분한다.

## ADDED Requirements

### Requirement: Preserve native navigation semantics
시스템은 토스 기본 내비게이션을 SHALL 사용하고 내부 화면에서 Android 시스템·플랫폼 뒤로가기를 동일하게 처리한다. 폼은 진입 화면으로, 상세는 홈으로 돌아가며 홈의 뒤로가기·닫기는 플랫폼 종료 정책을 따른다. 이벤트는 화면 해제 후 중복 등록되지 않는다.

#### Scenario: Return from edit
- **WHEN** 상세에서 수정 폼에 진입한 뒤 뒤로가기를 누른다
- **THEN** 저장하지 않은 변경은 확정하지 않고 상세로 한 번만 돌아간다

#### Scenario: Return from detail and close
- **WHEN** 상세에서 뒤로가기를 누른 다음 홈에서 종료한다
- **THEN** 상세는 홈으로 돌아가고 홈 종료는 기본 플랫폼 동작을 따른다

### Requirement: Show one supported dashboard banner
시스템은 지원 환경과 유효한 광고 그룹 설정을 만족할 때 홈 목록 하단 한 곳에만 배너를 SHALL 표시한다. 등록·수정·상세에서는 표시하지 않으며 광고 외형·레이블을 임의 변조하거나 클릭을 유도하지 않는다.

#### Scenario: Supported banner and leave home
- **WHEN** 지원 환경에서 배너가 표시된 후 홈을 떠난다
- **THEN** 광고 인스턴스를 해제하고 재진입에도 중복 슬롯 없이 하나만 표시한다

### Requirement: Isolate unavailable ads
시스템은 SDK 미지원, 초기화·렌더 실패, No Fill, 그룹 미설정 시 배너와 남은 빈 영역을 SHALL 정리하고 구독 조회·저장·이동을 계속 허용한다. 개발 테스트 ID를 실제 운영 광고 그룹으로 사용하지 않는다.

#### Scenario: Ad failure or no group
- **WHEN** 광고 지원이 없거나 No Fill이거나 실제 그룹이 설정되지 않았다
- **THEN** 홈에 막힌 빈 광고 영역이 없고 구독 등록·저장이 정상 작동한다

### Requirement: Require confirmed console identity before distribution
배포용 번들은 콘솔에 등록된 실제 appName과 SHALL 일치해야 한다. 로컬 임시 식별자나 서비스 표시명을 콘솔 식별자로 간주하지 않으며 실제 광고 ID는 확인된 환경 설정으로 제공한다.

#### Scenario: Console registration is pending
- **WHEN** 실제 appName과 운영 광고 그룹이 아직 없다
- **THEN** 로컬 개발·테스트 가능 상태와 콘솔 등록·운영 광고 미완료 상태를 구분해 보고하고 배포 완료로 판정하지 않는다

### Requirement: Verify on Android before release readiness
출시 준비 완료 판정은 Android 토스 앱에서 등록·수정·삭제·상태·재진입·복귀·뒤로가기·키보드·광고 예외 검증과 현재 출시 정책 점검 근거를 SHALL 요구한다. iOS를 실행하지 않았다면 미검증으로 명시한다.

#### Scenario: Browser checks only
- **WHEN** 단위·브라우저 검사와 번들 빌드만 통과했다
- **THEN** 로컬 검증 완료로만 기록하고 Android·iOS·광고 실노출·출시 승인을 완료 처리하지 않는다
