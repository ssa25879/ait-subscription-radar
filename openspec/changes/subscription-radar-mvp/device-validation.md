# 6단계 준비·검증 기록

확인일: 2026-10-27 (KST)

## 콘솔과 기기

- 사용자 승인 후 `YWS_WorkSpace`에 구독레이더를 생성했다. miniAppId는 92755이고 콘솔 appName은 `subscription-radar`다.
- 프로젝트 appName을 콘솔 값 `subscription-radar`로 맞췄다. 번들 `20261027-1`을 업로드했고 콘솔 컴파일은 CREATED이며 테스트 링크가 발급됐다. 테스트 푸시의 isTested는 실제 기기 검증 완료를 뜻하지 않는다.
- 현재 PATH와 확인한 일반 Android SDK 경로에서 adb를 찾지 못했다. 기기 연결 여부는 이 검사로 판정할 수 없다.
- 최초 등록 시 앱 이름 외 정보는 저장되지 않았다. 앱 정보와 번들을 함께 제출하는 최초 검토는 실제 테스트 완료 후 별도 확인이 필요하다. 사용자는 S26 Ultra, Android 17, One UI 9.0, 토스 앱 최신 버전에서 안내한 주요 흐름이 정상이라고 확인했다. 토스 앱의 정확한 버전 번호, foreground·광고·iOS는 별도 확인이 필요하다. 6.2~6.4는 대기 중이다.

## 공식 안내 대조

- [비게임 출시 가이드](https://developers-apps-in-toss.toss.im/checklist/app-nongame): 토스 및 Android 뒤로가기, 최초 화면 종료, 실제 광고 노출·복귀, 스크롤 가능한 화면의 배너 등은 기기 확인이 필요하다.
- 같은 가이드는 플랫폼 뒤로가기와 자체 뒤로가기 버튼이 동시에 보이지 않아야 한다고 명시한다. 상세 화면에 자체 `돌아가기` 버튼이 있으므로 토스 앱에서 플랫폼 뒤로가기 노출 여부를 확인해야 한다. 동시 노출이면 수정과 재검증이 필요하다.
- 같은 가이드는 필요한 경우를 제외하고 확대·축소 비활성화를 요구한다. [WebView 속성 안내](https://developers-apps-in-toss.toss.im/documentation/integration/props#disable-pinch-zoom)에 따라 `index.html`에 제한을 추가했다. 실제 기기 동작은 미검증이다.
- [Storage 공식 문서](https://developers-apps-in-toss.toss.im/documentation/common/file-storage/storage): SDK Storage는 네이티브 저장소를 사용하고 토스 앱 삭제 시 데이터가 함께 삭제된다고 안내한다. 앱의 기기 내 보관·삭제 가능성 안내와 일치한다. 기기 변경 시 실제 복원 여부는 검증하지 않았다.
- 소스상 구독 원본은 SDK Storage로 저장하며 별도의 자체 서버 호출·결제 정보 입력 기능은 확인되지 않았다. 배너 SDK의 네트워크 동작 및 플랫폼 데이터 처리 전체를 검증한 것은 아니다.

## 완료 판정

로컬 테스트·브라우저 검증과 번들 빌드는 확인했다. 최초 등록 검토, 실제 광고와 Android 미확인 항목, iOS 실행은 확인하지 않았으므로 출시 준비와 MVP 전체 완료는 판정하지 않는다. 6.5는 위 대조만으로 완료 처리하지 않는다.
