import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 로컬 전용 임시값. 콘솔 등록 후 실제 appName으로 교체하세요.
  appName: 'local-development',
  brand: {
    primaryColor: '#3182F6',
  },
  permissions: [],
  webBundleDir: 'dist',
});

