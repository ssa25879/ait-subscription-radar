# 구독레이더 (Subscription Radar)

수동 등록한 구독의 예상 결제일과 예상 지출을 관리하는 앱인토스 WebView 미니앱입니다.
현재는 개발 환경과 서비스 안내 화면만 구성했습니다. 구독 CRUD, Storage 저장, 날짜 계산, 광고는 아직 구현하지 않았습니다.

## 개발

Node.js 24 이상과 npm을 사용합니다.

```sh
npm ci
npm run dev
npm run lint
npm run typecheck
npm run build
```

React 18, TypeScript, Vite, TDS 및 앱인토스 SDK 3.x를 사용합니다. 실제 설치 버전은 package-lock.json에 기록되어 있습니다.
브라우저용 SDK mock 및 AIT 개발 패널은 Vite에 연결되어 있습니다.

## 콘솔 등록 전 설정

apps-in-toss.config.ts의 local-development는 로컬 빌드 전용 임시 appName입니다. 콘솔 등록 후 실제 앱 식별자로 교체해야 합니다.
개발용 슬러그를 콘솔 식별자로 간주하지 않습니다. 현재 번들은 등록·배포용이 아닙니다.
권한은 빈 배열로 시작하며 로그인·서버·광고 ID는 설정하지 않았습니다.

npm run build는 웹 빌드와 .ait 번들을 생성합니다. 콘솔 업로드와 Android 토스 앱 검증은 별도로 진행해야 합니다.
기능 요구사항은 루트의 개발 기획서를, 디자인 지침은 docs/design-guide.md를 참고합니다.
