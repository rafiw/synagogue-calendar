/*
 * Copyright (C) 2026 Rafi Wiener
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 */

import { ComponentType, lazy, LazyExoticComponent } from 'react';
import { Platform } from 'react-native';

/**
 * Checks if an error is caused by a missing chunk / bundle file (common after new deployments).
 */
export const isChunkLoadError = (error: unknown): boolean => {
  if (!error) return false;
  if (typeof error === 'object') {
    const err = error as Record<string, unknown>;
    const name = typeof err.name === 'string' ? err.name : '';
    const message = typeof err.message === 'string' ? err.message : '';

    if (name === 'ChunkLoadError' || name === 'AsyncRequireError') {
      return true;
    }
    if (
      message.includes('Loading module') ||
      message.includes('Loading chunk') ||
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('error loading dynamically imported module') ||
      message.includes('Importing a module script failed') ||
      message.includes('net::ERR_ABORTED')
    ) {
      return true;
    }
  }
  return false;
};

export const CHUNK_RELOAD_KEY = 'synagogue_chunk_reload_time';
export const CHUNK_RELOAD_COOLDOWN_MS = 15000;

/**
 * Wraps React.lazy with automatic reload recovery if the chunk fails to load due to a stale deployment.
 */
export function lazyWithRetry<T extends ComponentType<never>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && isChunkLoadError(error)) {
        try {
          const lastReload = window.sessionStorage?.getItem(CHUNK_RELOAD_KEY);
          const now = Date.now();
          if (!lastReload || now - Number(lastReload) > CHUNK_RELOAD_COOLDOWN_MS) {
            window.sessionStorage?.setItem(CHUNK_RELOAD_KEY, String(now));
            console.warn('[ChunkRetry] Chunk load error detected (new deployment). Reloading application...', error);
            window.location.reload();
            // Return an unresolved promise so React stays in Suspense fallback while reloading
            return await new Promise<{ default: T }>(() => {});
          }
        } catch {
          // Fall back to rethrowing if sessionStorage access fails
        }
      }
      throw error;
    }
  });
}
