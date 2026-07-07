import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Cache entry structure:
 * {
 *   [namespace]: {
 *     [cacheKey]: {
 *       data: any,
 *       timestamp: number,
 *       ttlMs: number
 *     }
 *   }
 * }
 */

//TODO: Modify functions to fit in an object-oriented model 
//TODO: update methods to use class attrubutes like namespace and cacheKeys
export class CacheStorage {
	#CACHE_STORAGE_KEY = "@JakesFreeGameBrowser:api_cache";
	static MAX_CACHE_AGE_MS = 6 * 60 * 60 * 1000; // 6 hours
    static DEALS_CACHE_KEY = "DealsCache"
    static GAMES_CACHE_KEY = "GamesCache"
    static STORES_CACHE_KEY = "StoresCache"

	constructor(){};

	/**
	 * Get cache key for a specific query
	 * @param {string} namespace - API namespace (e.g., 'gamerpower', 'cheapshark')
	 * @param {string} cacheKey - Unique key for this cache entry
	 * @returns {string} Namespaced cache key
	 */
	getNamespacedKey(cacheKey) {
		return `${namespace}:${cacheKey}`;
	}

	/**
	 * Read from cache
	 * @param {string} namespace - API namespace
	 * @param {string} cacheKey - Cache key
	 * @returns {Promise<any|null>} Cached data or null if expired/missing
	 */
	async readCache(cacheKey) {
		//TODO: class should check date of cache and if null before returning data.
		try {
			const rawCache = await AsyncStorage.getItem(CACHE_STORAGE_KEY);

			if (!rawCache) {
				return null;
			}

			const cacheStore = JSON.parse(rawCache);

			if (!cacheStore[namespace] || !cacheStore[namespace][cacheKey]) {
				return null;
			}

			const entry = cacheStore[namespace][cacheKey];
			const { data, timestamp, ttlMs } = entry;
			const isExpired = Date.now() - timestamp > ttlMs;

			if (isExpired) {
				// Remove expired entry
				delete cacheStore[namespace][cacheKey];

				// Clean up empty namespaces
				if (Object.keys(cacheStore[namespace]).length === 0) {
					delete cacheStore[namespace];
				}

				await AsyncStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cacheStore));
				return null;
			}

			return data;
		} catch (err) {
			console.error(`Error reading cache for ${namespace}:${cacheKey}:`, err);
			return null;
		}
	}

	/**
	 * Write to cache
	 * @param {string} namespace - API namespace
	 * @param {string} cacheKey - Cache key
	 * @param {any} data - Data to cache
	 * @param {number} ttlMs - Time to live in milliseconds
	 * @returns {Promise<void>}
	 */
	async writeCache(cacheKey, data) {
		try {
			const rawCache = await AsyncStorage.getItem(CACHE_STORAGE_KEY);
			const cacheStore = rawCache ? JSON.parse(rawCache) : {};

			if (!cacheStore[namespace]) {
				cacheStore[namespace] = {};
			}

			cacheStore[namespace][cacheKey] = {
				data,
				timestamp: Date.now(),
				ttlMs,
			};

			await AsyncStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cacheStore));
		} catch (err) {
			console.error(`Error writing cache for ${namespace}:${cacheKey}:`, err);
		}
	}

	/**
	 * Clear cache for a specific namespace
	 * @param {string} namespace - API namespace to clear
	 * @returns {Promise<void>}
	 */
	async clearNamespaceCache() {
		try {
			const rawCache = await AsyncStorage.getItem(CACHE_STORAGE_KEY);
			if (!rawCache) return;

			const cacheStore = JSON.parse(rawCache);

			if (cacheStore[namespace]) {
				delete cacheStore[namespace];
				await AsyncStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cacheStore));
				console.log(`Cleared cache for namespace: ${namespace}`);
			}
		} catch (err) {
			console.error(`Error clearing cache for namespace ${namespace}:`, err);
		}
	}

	/**
	 * Clear all cached data
	 * @returns {Promise<void>}
	 */
	async clearAllCache() {
		try {
			await AsyncStorage.removeItem(CACHE_STORAGE_KEY);
			console.log("All API cache cleared");
		} catch (err) {
			console.error("Error clearing all cache:", err);
		}
	}

	/**
	 * Get cache statistics
	 * @returns {Promise<object>} Cache stats with size, entries per namespace, etc.
	 */
	async getCacheStats() {
		try {
			const rawCache = await AsyncStorage.getItem(CACHE_STORAGE_KEY);
			if (!rawCache) {
				return {
					totalSize: 0,
					namespaces: {},
					totalEntries: 0,
				};
			}

			const cacheStore = JSON.parse(rawCache);
			const stats = {
				totalSize: rawCache.length,
				namespaces: {},
				totalEntries: 0,
			};

			Object.entries(cacheStore).forEach(([namespace, entries]) => {
				const entryCount = Object.keys(entries).length;
				stats.namespaces[namespace] = {
					entries: entryCount,
					keys: Object.keys(entries),
				};
				stats.totalEntries += entryCount;
			});

			return stats;
		} catch (err) {
			console.error("Error getting cache stats:", err);
			return null;
		}
	}

	/**
	 * Get remaining TTL for a cached item
	 * @param {string} namespace - API namespace
	 * @param {string} cacheKey - Cache key
	 * @returns {Promise<number|null>} Remaining TTL in ms, or null if not found/expired
	 */
	async getCacheRemainingTTL(cacheKey) {
		try {
			const rawCache = await AsyncStorage.getItem(CACHE_STORAGE_KEY);

			if (!rawCache) {
				return null;
			}

			const cacheStore = JSON.parse(rawCache);

			if (!cacheStore[namespace] || !cacheStore[namespace][cacheKey]) {
				return null;
			}

			const entry = cacheStore[namespace][cacheKey];
			const { timestamp, ttlMs } = entry;
			const elapsed = Date.now() - timestamp;
			const remaining = ttlMs - elapsed;

			return remaining > 0 ? remaining : null;
		} catch (err) {
			console.error(`Error getting TTL for ${namespace}:${cacheKey}:`, err);
			return null;
		}
	}
}