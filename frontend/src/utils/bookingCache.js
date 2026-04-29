/**
 * bookingCache.js
 * Simple in-memory cache for booking resources to reduce API calls
 */

const cache = {
  resources: null,
  expiresAt: null,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds
};

export const bookingCache = {
  /**
   * Get cached resources
   * @returns {Array|null} Cached resources or null if expired/not set
   */
  getResources() {
    if (!cache.resources || !cache.expiresAt) return null;
    if (Date.now() > cache.expiresAt) {
      cache.resources = null;
      cache.expiresAt = null;
      return null;
    }
    return cache.resources;
  },

  /**
   * Set resources in cache
   * @param {Array} resources - Array of resources to cache
   */
  setResources(resources) {
    cache.resources = resources;
    cache.expiresAt = Date.now() + cache.CACHE_DURATION;
  },

  /**
   * Clear all cached data
   */
  clear() {
    cache.resources = null;
    cache.expiresAt = null;
  },

  /**
   * Check if cache is still valid
   * @returns {Boolean}
   */
  isValid() {
    return cache.resources !== null && Date.now() <= cache.expiresAt;
  },
};
