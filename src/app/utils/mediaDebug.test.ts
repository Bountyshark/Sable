import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearMediaDebugEntries,
  getMediaDebugEntries,
  isMediaDebugEnabled,
  pushMediaDebugEntry,
} from './mediaDebug';

describe('mediaDebug', () => {
  beforeEach(() => {
    localStorage.removeItem('sable_media_debug');
    clearMediaDebugEntries();
  });

  it('is disabled by default in tests', () => {
    expect(isMediaDebugEnabled()).toBe(false);
  });

  it('stores debug entries when enabled', () => {
    localStorage.setItem('sable_media_debug', '1');

    pushMediaDebugEntry('media.render', 'Test entry', {
      foo: 'bar',
    });

    expect(getMediaDebugEntries()).toEqual([
      expect.objectContaining({
        stage: 'media.render',
        message: 'Test entry',
        data: { foo: 'bar' },
      }),
    ]);
  });

  it('keeps only the latest 200 entries', () => {
    localStorage.setItem('sable_media_debug', '1');

    Array.from({ length: 205 }).forEach((_, index) => {
      pushMediaDebugEntry('media.fetch', `entry-${index}`);
    });

    const entries = getMediaDebugEntries();
    expect(entries).toHaveLength(200);
    expect(entries[0]?.message).toBe('entry-5');
    expect(entries.at(-1)?.message).toBe('entry-204');
  });
});
