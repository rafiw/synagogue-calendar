import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isChunkLoadError, CHUNK_RELOAD_KEY, CHUNK_RELOAD_COOLDOWN_MS } from '../utils/lazyWithRetry';

describe('lazyWithRetry and isChunkLoadError', () => {
  describe('isChunkLoadError', () => {
    it('returns true for AsyncRequireError', () => {
      const err = new Error('Loading module failed');
      err.name = 'AsyncRequireError';
      expect(isChunkLoadError(err)).toBe(true);
    });

    it('returns true for ChunkLoadError', () => {
      const err = new Error('Loading chunk 4 failed');
      err.name = 'ChunkLoadError';
      expect(isChunkLoadError(err)).toBe(true);
    });

    it('returns true for dynamic import message errors', () => {
      expect(isChunkLoadError(new Error('Failed to fetch dynamically imported module'))).toBe(true);
      expect(isChunkLoadError(new Error('error loading dynamically imported module: foo.js'))).toBe(true);
      expect(isChunkLoadError(new Error('Importing a module script failed.'))).toBe(true);
      expect(
        isChunkLoadError(new Error('GET https://rafiw.github.io/synagogue-calendar/Deceased.js net::ERR_ABORTED 404')),
      ).toBe(true);
      expect(isChunkLoadError(new Error('Loading module Deceased-9b39f3.js failed.'))).toBe(true);
    });

    it('returns false for standard errors', () => {
      expect(isChunkLoadError(new Error('Network request failed'))).toBe(false);
      expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false);
      expect(isChunkLoadError(null)).toBe(false);
      expect(isChunkLoadError(undefined)).toBe(false);
      expect(isChunkLoadError('some string')).toBe(false);
      expect(isChunkLoadError(123)).toBe(false);
    });
  });

  describe('cooldown and storage keys', () => {
    it('exports proper constants', () => {
      expect(CHUNK_RELOAD_KEY).toBe('synagogue_chunk_reload_time');
      expect(CHUNK_RELOAD_COOLDOWN_MS).toBe(15000);
    });
  });
});
