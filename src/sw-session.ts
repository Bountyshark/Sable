import { pushMediaDebugEntry } from './app/utils/mediaDebug';

export function pushSessionToSW(baseUrl?: string, accessToken?: string, userId?: string) {
  if (!('serviceWorker' in navigator)) {
    pushMediaDebugEntry('service-worker', 'Skipping session push: service worker unavailable');
    return;
  }
  if (!navigator.serviceWorker.controller) {
    pushMediaDebugEntry('service-worker', 'Skipping session push: no controlling service worker', {
      hasBaseUrl: Boolean(baseUrl),
      hasAccessToken: Boolean(accessToken),
      userId,
    });
    return;
  }

  pushMediaDebugEntry('service-worker', 'Posting session to controlling service worker', {
    hasBaseUrl: Boolean(baseUrl),
    hasAccessToken: Boolean(accessToken),
    userId,
  });
  navigator.serviceWorker.controller.postMessage({
    type: 'setSession',
    accessToken,
    baseUrl,
    userId,
    // oxlint-disable-next-line unicorn/require-post-message-target-origin
  });
}
