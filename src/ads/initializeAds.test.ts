import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const sdk = vi.hoisted(() => ({ version: '5.241.0', supported: true, init: vi.fn() }));
vi.mock('@apps-in-toss/web-framework', () => ({ getTossAppVersion: () => sdk.version, TossAds: { initialize: Object.assign((options: { callbacks: { onInitialized: () => void } }) => sdk.init(options), { isSupported: () => sdk.supported }), attachBanner: { isSupported: () => sdk.supported } } }));
beforeEach(() => { vi.resetModules(); sdk.version = '5.241.0'; sdk.supported = true; sdk.init.mockReset(); });
afterEach(() => vi.unstubAllEnvs());
describe('banner initialization', () => {
  it('shares one initialization between StrictMode mounts', async () => {
    sdk.init.mockImplementation(options => options.callbacks.onInitialized());
    const { initializeAds } = await import('./initializeAds');
    expect(await Promise.all([initializeAds(), initializeAds()])).toEqual([true, true]);
    expect(sdk.init).toHaveBeenCalledOnce();
  });
  it('skips unsupported versions and SDK environments', async () => {
    sdk.version = '5.240.9';
    let module = await import('./initializeAds');
    expect(await module.initializeAds()).toBe(false);
    vi.resetModules(); sdk.version = '5.241.0'; sdk.supported = false;
    module = await import('./initializeAds');
    expect(await module.initializeAds()).toBe(false);
    expect(sdk.init).not.toHaveBeenCalled();
  });
  it('uses a development test ID and only an injected ID in production', async () => {
    vi.stubEnv('DEV', true);
    let module = await import('./initializeAds');
    expect(module.adGroupId).toBe('ait-ad-test-banner-id');
    vi.resetModules();
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_SUBSCRIPTION_RADAR_BANNER_AD_GROUP_ID', '');
    module = await import('./initializeAds');
    expect(module.adGroupId).toBe('');
    vi.resetModules();
    vi.stubEnv('VITE_SUBSCRIPTION_RADAR_BANNER_AD_GROUP_ID', 'example-production-group');
    module = await import('./initializeAds');
    expect(module.adGroupId).toBe('example-production-group');
  });
});
