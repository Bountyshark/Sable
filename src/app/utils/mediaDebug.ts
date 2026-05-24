import { createDebugLogger, getDebugLogger } from './debugLogger';

const MEDIA_DEBUG_KEY = 'sable_media_debug';
const MEDIA_DEBUG_BUFFER_LIMIT = 200;

export type MediaDebugStage =
  | 'mxc.resolve'
  | 'media.fetch'
  | 'media.fetch.result'
  | 'media.fetch.error'
  | 'media.render'
  | 'media.render.result'
  | 'service-worker';

export type MediaDebugEntry = {
  timestamp: number;
  stage: MediaDebugStage;
  message: string;
  data?: unknown;
};

type MediaDebugWindow = Window & {
  __SABLE_MEDIA_DEBUG__?: MediaDebugEntry[];
  __SABLE_MEDIA_DEBUG_CLEAR__?: () => void;
};

const mediaLogger = createDebugLogger('media');

export const isMediaDebugEnabled = (): boolean =>
  (import.meta.env.DEV && import.meta.env.MODE !== 'test') ||
  localStorage.getItem(MEDIA_DEBUG_KEY) === '1';

const getMediaDebugWindow = (): MediaDebugWindow | undefined =>
  typeof window === 'undefined' ? undefined : (window as MediaDebugWindow);

const ensureBuffer = (): MediaDebugEntry[] | undefined => {
  const debugWindow = getMediaDebugWindow();
  if (!debugWindow) return undefined;
  debugWindow.__SABLE_MEDIA_DEBUG__ ??= [];
  debugWindow.__SABLE_MEDIA_DEBUG_CLEAR__ ??= () => {
    debugWindow.__SABLE_MEDIA_DEBUG__ = [];
  };
  return debugWindow.__SABLE_MEDIA_DEBUG__;
};

export const pushMediaDebugEntry = (
  stage: MediaDebugStage,
  message: string,
  data?: unknown
): void => {
  if (!isMediaDebugEnabled()) return;

  const entry: MediaDebugEntry = {
    timestamp: Date.now(),
    stage,
    message,
    data,
  };

  const buffer = ensureBuffer();
  if (buffer) {
    if (buffer.length >= MEDIA_DEBUG_BUFFER_LIMIT) buffer.shift();
    buffer.push(entry);
  }

  mediaLogger.debug('network', `${stage}: ${message}`, data);
};

export const getMediaDebugEntries = (): MediaDebugEntry[] => {
  const debugWindow = getMediaDebugWindow();
  return debugWindow?.__SABLE_MEDIA_DEBUG__ ? [...debugWindow.__SABLE_MEDIA_DEBUG__] : [];
};

export const clearMediaDebugEntries = (): void => {
  const debugWindow = getMediaDebugWindow();
  debugWindow?.__SABLE_MEDIA_DEBUG_CLEAR__?.();
  getDebugLogger().clear();
};
