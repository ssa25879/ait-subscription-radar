import { useEffect, useRef, useState } from 'react';
import { TossAds } from '@apps-in-toss/web-framework';
import { adGroupId, initializeAds } from './initializeAds';

export function BannerAd() {
  const container = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (!adGroupId) return;
    let active = true;
    let slot: { destroy: () => void } | undefined;
    let failed = false;
    const fail = () => { failed = true; if (active) { slot?.destroy(); slot = undefined; setHidden(true); } };
    void initializeAds().then(ready => {
      if (!active) return;
      if (!ready || !container.current) { setHidden(true); return; }
      try {
        slot = TossAds.attachBanner(adGroupId, container.current, { callbacks: { onNoFill: fail, onAdFailedToRender: fail } });
        if (failed) { slot.destroy(); slot = undefined; }
      } catch { fail(); }
    });
    return () => { active = false; slot?.destroy(); };
  }, []);
  if (!adGroupId || hidden) return null;
  return <div className="banner-ad" ref={container} />;
}
