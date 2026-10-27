import { getTossAppVersion, TossAds } from '@apps-in-toss/web-framework';

export const adGroupId = import.meta.env.DEV ? 'ait-ad-test-banner-id' : import.meta.env.VITE_SUBSCRIPTION_RADAR_BANNER_AD_GROUP_ID;

let initialization: Promise<boolean> | undefined;
export function initializeAds(): Promise<boolean> {
  if (initialization) return initialization;
  initialization = new Promise(resolve => {
    try {
      const match = /^(\d+)\.(\d+)\.(\d+)/.exec(getTossAppVersion());
      if (!match || (Number(match[1]) < 5 || (Number(match[1]) === 5 && Number(match[2]) < 241)) || !TossAds.initialize.isSupported() || !TossAds.attachBanner.isSupported()) { resolve(false); return; }
      TossAds.initialize({ callbacks: { onInitialized: () => resolve(true), onInitializationFailed: () => resolve(false) } });
    } catch { resolve(false); }
  });
  return initialization;
}
