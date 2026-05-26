import { isTauri } from '@tauri-apps/api/core';

let swSupported: boolean | undefined;

export function hasServiceWorker(): boolean {
  if (swSupported === undefined) {
    swSupported = 'serviceWorker' in navigator && !isTauri();
  }
  return swSupported;
}